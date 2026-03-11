import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays } from 'lucide-react'

interface MonthPickerProps {
  value: string
  onChange: (month: string) => void
}

function generateMonths(): { value: string; label: string }[] {
  const months = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' })
    months.push({ value, label })
  }
  return months
}

const MONTHS = generateMonths()

export default function MonthPicker({ value, onChange }: MonthPickerProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-44 bg-card border-border text-sm gap-2">
        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {MONTHS.map(m => (
          <SelectItem key={m.value} value={m.value} className="text-sm">
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}