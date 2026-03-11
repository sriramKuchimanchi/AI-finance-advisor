import { useEffect, useState } from 'react'
import { getIncome, addIncome, deleteIncome, getExpenses } from '@/services/api'
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog'
import AIIncomeParser from '@/components/income/AIIncomeParser'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { INCOME_SOURCES, INCOME_SOURCE_COLORS } from '@/types'
import type { Income, Expense } from '@/types'
import { Plus, Trash2, Loader2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface IncomeForm {
  source: string
  amount: string
  description: string
  date: string
  user_id: number
}

export default function IncomePage() {
  const [income, setIncome] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<IncomeForm>({
    source: INCOME_SOURCES[0],
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    user_id: 1,
  })

  useEffect(() => {
    Promise.all([getIncome(), getExpenses()])
      .then(([inc, exp]) => { setIncome(inc); setExpenses(exp) })
      .finally(() => setLoading(false))
  }, [])

  const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0)
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const netBalance = totalIncome - totalExpenses
  const thisMonthIncome = income.filter(i => {
    const d = new Date(i.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((s, i) => s + Number(i.amount), 0)

  const handleAdd = async () => {
    if (!form.amount || isNaN(Number(form.amount))) return
    setSaving(true)
    try {
      const item = await addIncome({
        source: form.source,
        amount: Number(form.amount),
        description: form.description,
        date: form.date,
        user_id: form.user_id,
      })
      setIncome(prev => [item, ...prev])
      setDialogOpen(false)
      setForm({ source: INCOME_SOURCES[0], amount: '', description: '', date: new Date().toISOString().split('T')[0], user_id: 1 })
    } finally {
      setSaving(false)
    }
  }

  const askDelete = (id: number) => { setPendingDeleteId(id); setConfirmOpen(true) }

  const handleConfirmDelete = async () => {
    if (pendingDeleteId === null) return
    setDeletingId(pendingDeleteId)
    setConfirmOpen(false)
    try {
      await deleteIncome(pendingDeleteId)
      setIncome(prev => prev.filter(i => i.id !== pendingDeleteId))
    } finally {
      setDeletingId(null)
      setPendingDeleteId(null)
    }
  }

  const summaryCards = [
    { label: 'Total Income', value: `₹${totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    { label: 'This Month', value: `₹${thisMonthIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: Wallet, color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
    { label: 'Net Balance', value: `₹${Math.abs(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: netBalance >= 0 ? TrendingUp : TrendingDown, color: netBalance >= 0 ? 'text-primary' : 'text-rose-400', bg: netBalance >= 0 ? 'bg-primary/10' : 'bg-rose-400/10', border: netBalance >= 0 ? 'border-primary/20' : 'border-rose-400/20', prefix: netBalance >= 0 ? '🟢 Surplus' : '🔴 Deficit' },
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {summaryCards.map(c => (
          <Card key={c.label} className={`p-4 border ${c.border} bg-card`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{c.label}</p>
                <p className={`text-xl font-semibold mt-1 ${c.color}`}>{c.value}</p>
                {'prefix' in c && <p className="text-[11px] text-muted-foreground mt-1">{c.prefix}</p>}
              </div>
              <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                <c.icon className={`w-4 h-4 ${c.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <AIIncomeParser onAdded={newIncome => setIncome(prev => [...newIncome, ...prev])} />
        <Button size="sm" className="bg-primary text-primary-foreground h-9" onClick={() => setDialogOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Income
        </Button>
      </div>

      <Card className="border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
        ) : income.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-sm text-muted-foreground">No income recorded yet</p>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}><Plus className="w-3.5 h-3.5 mr-1.5" /> Add your first income</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Description</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Source</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {income.map((item, i) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors group" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-4 py-3"><p className="text-sm text-foreground">{item.description || '—'}</p></td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px] border" style={{ borderColor: `${INCOME_SOURCE_COLORS[item.source] || INCOME_SOURCE_COLORS['Other']}40`, color: INCOME_SOURCE_COLORS[item.source] || INCOME_SOURCE_COLORS['Other'], background: `${INCOME_SOURCE_COLORS[item.source] || INCOME_SOURCE_COLORS['Other']}12` }}>
                        {item.source}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold font-mono text-primary">+₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => askDelete(item.id)} disabled={deletingId === item.id}>
                        {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Income</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Amount (₹)</Label>
              <Input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="bg-background border-border text-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Source</Label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="w-full h-9 rounded-md bg-background border border-border text-foreground text-sm px-3 focus:outline-none focus:ring-1 focus:ring-ring">
                {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Input placeholder="e.g. Monthly salary..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-background border-border text-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="bg-background border-border text-foreground" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 border-border" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleAdd} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Income'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog open={confirmOpen} onClose={() => { setConfirmOpen(false); setPendingDeleteId(null) }} onConfirm={handleConfirmDelete} title="Delete Income?" description="This will permanently remove this income entry." loading={deletingId !== null} />
    </div>
  )
}