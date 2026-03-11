import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addExpense } from '@/services/api'
import { CATEGORIES } from '@/types'
import type { Expense } from '@/types'
import { Loader2 } from 'lucide-react'

interface AddExpenseDialogProps {
  open: boolean
  onClose: () => void
  onAdded: (expense: Expense) => void
}

export default function AddExpenseDialog({ open, onClose, onAdded }: AddExpenseDialogProps) {
  const [form, setForm] = useState({
    amount: '',
    category: CATEGORIES[0],
    description: '',
    date: new Date().toISOString().split('T')[0],
    user_id: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.amount || isNaN(Number(form.amount))) {
      setError('Please enter a valid amount')
      return
    }
    setLoading(true)
    setError('')
    try {
      const expense = await addExpense({ ...form, amount: Number(form.amount) })
      onAdded(expense)
      setForm({ amount: '', category: CATEGORIES[0], description: '', date: new Date().toISOString().split('T')[0], user_id: 1 })
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Expense</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Amount (₹)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full h-9 rounded-md bg-background border border-border text-foreground text-sm px-3 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Input
              placeholder="What was this for?"
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
            <Button variant="outline" className="flex-1 border-border" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Expense'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}