import { Card } from '@/components/ui/card'
import type { CategoryStat } from '@/types'

interface CategoryChartProps {
  data: CategoryStat[]
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const total = data.reduce((s, d) => s + d.total, 0)

  return (
    <Card className="p-5 border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Spending by Category</h3>

      {data.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-muted-foreground text-xs">
          No expense data yet
        </div>
      ) : (
        <>
          
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-5">
            {data.map((d) => (
              <div
                key={d.category}
                style={{ width: `${(d.total / total) * 100}%`, background: d.color }}
                className="rounded-full transition-all duration-500"
                title={`${d.category}: ₹${d.total}`}
              />
            ))}
          </div>

         
          <div className="space-y-2.5">
            {data.slice(0, 6).map((d) => (
              <div key={d.category} className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-muted-foreground flex-1 truncate">{d.category}</span>
                <span className="text-xs font-medium text-foreground font-mono">
                  ₹{d.total.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-muted-foreground w-8 text-right">
                  {Math.round((d.total / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}