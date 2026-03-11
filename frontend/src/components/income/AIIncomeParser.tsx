import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { addIncome } from '@/services/api'
import { INCOME_SOURCE_COLORS } from '@/types'
import type { Income } from '@/types'
import { Sparkles, Loader2, Check, X, Trash2 } from 'lucide-react'

interface ParsedIncome {
  description: string
  amount: number
  source: string
  date: string
  selected: boolean
}

interface AIIncomeParserProps {
  onAdded: (income: Income[]) => void
}

export default function AIIncomeParser({ onAdded }: AIIncomeParserProps) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState<ParsedIncome[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleOpen = () => {
    setOpen(true)
    setText('')
    setItems([])
    setError('')
    setSuccess('')
  }

  const handleClose = () => {
    if (saving || parsing) return
    setOpen(false)
  }

  const handleParse = async () => {
    if (!text.trim()) return
    setParsing(true)
    setError('')
    setItems([])
    try {
      const token = localStorage.getItem('fa_token')
      const res = await fetch('http://localhost:5000/api/ai/parse-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to parse'); return }
      if (data.items.length === 0) { setError('No income detected. Try being more specific.'); return }
      setItems(data.items.map((i: Omit<ParsedIncome, 'selected'>) => ({ ...i, selected: true })))
    } catch {
      setError('Could not connect to server')
    } finally {
      setParsing(false)
    }
  }

  const handleAddAll = async () => {
    const selected = items.filter(i => i.selected)
    if (selected.length === 0) return
    setSaving(true)
    try {
      const added: Income[] = []
      for (const item of selected) {
        const income = await addIncome({ user_id: 0, amount: item.amount, source: item.source, description: item.description, date: item.date })
        added.push(income)
      }
      onAdded(added)
      setSuccess(`✅ Added ${added.length} income entr${added.length > 1 ? 'ies' : 'y'} successfully!`)
      setItems([])
      setText('')
    } catch {
      setError('Failed to save some income entries')
    } finally {
      setSaving(false)
    }
  }

  const toggleItem = (i: number) =>
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, selected: !item.selected } : item))
  const removeItem = (i: number) =>
    setItems(prev => prev.filter((_, idx) => idx !== i))

  const selectedCount = items.filter(i => i.selected).length
  const totalAmount = items.filter(i => i.selected).reduce((s, i) => s + i.amount, 0)

  return (
    <TooltipProvider>
      <Button
        variant="outline"
        size="sm"
        className="h-9 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary gap-2"
        onClick={handleOpen}
      >
        <Sparkles className="w-3.5 h-3.5" />
        AI Add
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Income Detector
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Describe your income in plain text and AI will detect and categorise it automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-1">
            {items.length === 0 ? (
              <>
                <Textarea
                  placeholder='e.g. "Got 30000 salary, 5000 from freelance project and 1000 gift from dad"'
                  value={text}
                  onChange={e => { setText(e.target.value); setError(''); setSuccess('') }}
                  className="bg-background border-border resize-none text-sm min-h-[100px]"
                  autoFocus
                />
                {error && <p className="text-xs text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-md px-3 py-2">{error}</p>}
                {success && <p className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-md px-3 py-2">{success}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-border" onClick={handleClose}>Cancel</Button>
                  <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleParse} disabled={!text.trim() || parsing}>
                    {parsing ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />Detecting...</> : <><Sparkles className="w-3.5 h-3.5 mr-2" />Detect Income</>}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {items.map((item, i) => {
                    const color = INCOME_SOURCE_COLORS[item.source] || INCOME_SOURCE_COLORS['Other']
                    return (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${item.selected ? 'bg-background border-border' : 'bg-muted/20 border-border/30 opacity-50'}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => toggleItem(i)} className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${item.selected ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-background'}`}>
                              {item.selected && <Check className="w-3 h-3" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>{item.selected ? 'Deselect' : 'Select'}</TooltipContent>
                        </Tooltip>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground font-medium truncate">{item.description}</p>
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 mt-0.5 border" style={{ borderColor: `${color}40`, color, background: `${color}12` }}>
                            {item.source}
                          </Badge>
                        </div>
                        <span className="text-sm font-semibold font-mono text-primary shrink-0">+₹{item.amount.toLocaleString('en-IN')}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Remove</TooltipContent>
                        </Tooltip>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">{selectedCount}</span> selected ·{' '}
                    <span className="text-primary font-mono font-medium">+₹{totalAmount.toLocaleString('en-IN')}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-border text-xs" onClick={() => { setItems([]); setText('') }}>
                      <X className="w-3 h-3 mr-1" /> Back
                    </Button>
                    <Button size="sm" className="bg-primary text-primary-foreground text-xs" onClick={handleAddAll} disabled={saving || selectedCount === 0}>
                      {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                      Add {selectedCount} Entr{selectedCount !== 1 ? 'ies' : 'y'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}