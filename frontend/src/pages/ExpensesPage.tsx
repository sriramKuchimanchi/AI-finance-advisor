import { useEffect, useState } from 'react'
import { getExpenses, deleteExpense } from '@/services/api'
import AddExpenseDialog from '@/components/expenses/AddExpenseDialog'
import EditExpenseDialog from '@/components/expenses/EditExpenseDialog'
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog'
import AIExpenseParser from '@/components/expenses/AIExpenseParser'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CATEGORY_COLORS, CATEGORIES } from '@/types'
import type { Expense } from '@/types'
import { Plus, Trash2, Pencil, Search, Loader2, Filter } from 'lucide-react'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filtered, setFiltered] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  useEffect(() => {
    getExpenses()
      .then(data => { setExpenses(data); setFiltered(data) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = expenses
    if (search) result = result.filter(e =>
      e.description?.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
    )
    if (categoryFilter !== 'All') result = result.filter(e => e.category === categoryFilter)
    setFiltered(result)
  }, [search, categoryFilter, expenses])

  const askDelete = (id: number) => { setPendingDeleteId(id); setConfirmOpen(true) }

  const handleConfirmDelete = async () => {
    if (pendingDeleteId === null) return
    setDeletingId(pendingDeleteId)
    setConfirmOpen(false)
    try {
      await deleteExpense(pendingDeleteId)
      setExpenses(prev => prev.filter(e => e.id !== pendingDeleteId))
    } finally {
      setDeletingId(null)
      setPendingDeleteId(null)
    }
  }

  const handleUpdated = (updated: Expense) =>
    setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e))

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 bg-card border-border text-sm" />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="h-9 rounded-md bg-card border border-border text-sm text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <AIExpenseParser onAdded={newExpenses => setExpenses(prev => [...newExpenses, ...prev])} />
        <Button size="sm" className="bg-primary text-primary-foreground h-9" onClick={() => setAddOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Expense
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{filtered.length} transactions</span>
        <span>·</span>
        <span className="font-mono text-rose-400 font-medium">Total: ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>

      <Card className="border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-sm text-muted-foreground">No expenses found</p>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}><Plus className="w-3.5 h-3.5 mr-1.5" /> Add your first expense</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Description</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Category</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors group" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-4 py-3"><p className="text-sm text-foreground">{e.description || '—'}</p></td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px] border" style={{ borderColor: `${CATEGORY_COLORS[e.category]}40`, color: CATEGORY_COLORS[e.category], background: `${CATEGORY_COLORS[e.category]}12` }}>
                        {e.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold font-mono text-rose-400">₹{Number(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => setEditExpense(e)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => askDelete(e.id)} disabled={deletingId === e.id}>
                          {deletingId === e.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddExpenseDialog open={addOpen} onClose={() => setAddOpen(false)} onAdded={e => setExpenses(prev => [e, ...prev])} />
      <EditExpenseDialog expense={editExpense} onClose={() => setEditExpense(null)} onUpdated={handleUpdated} />
      <ConfirmDeleteDialog open={confirmOpen} onClose={() => { setConfirmOpen(false); setPendingDeleteId(null) }} onConfirm={handleConfirmDelete} title="Delete Expense?" description="This will permanently remove this expense." loading={deletingId !== null} />
    </div>
  )
}