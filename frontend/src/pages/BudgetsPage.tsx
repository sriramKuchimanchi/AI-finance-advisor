import { useEffect, useState } from 'react'
import { getBudgets, addBudget, deleteBudget, getExpenses } from '@/services/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CATEGORY_COLORS, CATEGORIES } from '@/types'
import type { Budget, Expense } from '@/types'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog'

interface BudgetForm {
  category: string
  monthly_limit: string
  user_id: number
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<BudgetForm>({ category: CATEGORIES[0], monthly_limit: '', user_id: 1 })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([getBudgets(), getExpenses()])
      .then(([b, e]) => { setBudgets(b); setExpenses(e) })
      .finally(() => setLoading(false))
  }, [])

  const getSpent = (category: string) => {
    const now = new Date()
    return expenses
      .filter(e => e.category === category &&
        new Date(e.date).getMonth() === now.getMonth() &&
        new Date(e.date).getFullYear() === now.getFullYear())
      .reduce((s, e) => s + Number(e.amount), 0)
  }

  const handleCategoryChange = (value: string) => {
    setForm(prev => ({ ...prev, category: value }))
  }

  const handleLimitChange = (value: string) => {
    setForm(prev => ({ ...prev, monthly_limit: value }))
  }

  const handleAdd = async () => {
    if (!form.monthly_limit || isNaN(Number(form.monthly_limit))) return
    setSaving(true)
    try {
      const b = await addBudget({ ...form, monthly_limit: Number(form.monthly_limit) })
      setBudgets(prev => [b, ...prev])
      setDialogOpen(false)
      setForm({ category: CATEGORIES[0], monthly_limit: '', user_id: 1 })
    } finally { setSaving(false) }
  }

  const askDelete = (id: number) => {
    setPendingDeleteId(id)
    setConfirmOpen(true)
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try { await deleteBudget(id); setBudgets(prev => prev.filter(b => b.id !== id)) }
    finally { setDeletingId(null) }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-end">
        <Button size="sm" className="bg-primary text-primary-foreground h-9" onClick={() => setDialogOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Set Budget
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : budgets.length === 0 ? (
        <Card className="border-border p-12 flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">No budgets set yet</p>
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Create your first budget
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {budgets.map((b) => {
            const spent = getSpent(b.category)
            const limit = Number(b.monthly_limit)
            const pct = Math.min((spent / limit) * 100, 100)
            const color = CATEGORY_COLORS[b.category] || CATEGORY_COLORS['Other']
            const status = pct >= 90 ? 'over' : pct >= 70 ? 'warn' : 'ok'

            return (
              <Card key={b.id} className="p-5 border-border group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{b.category}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Monthly limit</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold font-mono"
                      style={{ color }}
                    >
                      ₹{limit.toLocaleString('en-IN')}
                    </span>
                    <Button
                      variant="ghost" size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => askDelete(b.id)}
                      disabled={deletingId === b.id}
                    >
                      {deletingId === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: status === 'over' ? 'hsl(var(--destructive))' : status === 'warn' ? 'hsl(38,92%,60%)' : color,
                    }}
                  />
                </div>

                <div className="flex justify-between mt-2">
                  <span className="text-[11px] text-muted-foreground">
                    Spent: <span className="text-foreground font-mono">₹{spent.toLocaleString('en-IN')}</span>
                  </span>
                  <span className={`text-[11px] font-medium ${
                    status === 'over' ? 'text-destructive' : status === 'warn' ? 'text-amber-400' : 'text-primary'
                  }`}>
                    {status === 'over' ? '⚠ Over budget' : status === 'warn' ? `${Math.round(pct)}% used` : `${Math.round(pct)}% used`}
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Set Monthly Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <select
                value={form.category}
                onChange={e => handleCategoryChange(e.target.value)}
                className="w-full h-9 rounded-md bg-background border border-border text-sm text-foreground px-3 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Monthly Limit (₹)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.monthly_limit}
                onChange={e => handleLimitChange(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 border-border" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleAdd} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Budget'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setPendingDeleteId(null) }}
        onConfirm={async () => {
          if (pendingDeleteId !== null) {
            setConfirmOpen(false)
            await handleDelete(pendingDeleteId)
            setPendingDeleteId(null)
          }
        }}
        title="Delete Budget?"
        description="This will remove this budget limit. Your expenses will not be affected."
        loading={deletingId !== null}
      />
    </div>
  )
}