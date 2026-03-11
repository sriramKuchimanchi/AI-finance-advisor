import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateExpense } from '@/services/api'
import { CATEGORIES } from '@/types'
import type { Expense } from '@/types'
import { Loader2 } from 'lucide-react'

interface EditExpenseDialogProps {
  expense: Expense | null
  onClose: () => void
  onUpdated: (expense: Expense) => void
}

export default function EditExpenseDialog({ expense, onClose, onUpdated }: EditExpenseDialogProps) {
  const [form, setForm] = useState({
    amount: expense?.amount?.toString() || '',
    category: expense?.category || CATEGORIES[0],
    description: expense?.description || '',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCategoryChange = (value: string) => setForm(f => ({ ...f, category: value }))

  const handleSubmit = async () => {
    if (!form.amount || isNaN(Number(form.amount))) {
      setError('Please enter a valid amount')
      return
    }
    if (!expense) return
    setLoading(true)
    setError('')
    try {
      const updated = await updateExpense(expense.id, {
        amount: Number(form.amount),
        category: form.category,
        description: form.description,
        date: form.date,
      })
      onUpdated(updated)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!expense} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Amount (₹)</Label>
            <Input
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="bg-background border-border text-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <select
              value={form.category}
              onChange={e => handleCategoryChange(e.target.value)}
              className="w-full h-9 rounded-md bg-background border border-border text-foreground text-sm px-3 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="bg-background border-border text-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="bg-background border-border text-foreground"
            />
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 border-border" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}