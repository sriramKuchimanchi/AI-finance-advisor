import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_COLORS } from '@/types'
import type { Expense } from '@/types'

interface RecentExpensesProps {
  expenses: Expense[]
}

export default function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <Card className="p-5 border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Recent Transactions</h3>

      {expenses.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-muted-foreground text-xs">
          No transactions yet
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.slice(0, 8).map((e) => (
            <div key={e.id} className="flex items-center gap-3 py-1.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: `${CATEGORY_COLORS[e.category] || CATEGORY_COLORS['Other']}22`,
                  color: CATEGORY_COLORS[e.category] || CATEGORY_COLORS['Other'],
                }}
              >
                {e.category.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{e.description || e.category}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-rose-400">
                  -₹{Number(e.amount).toLocaleString('en-IN')}
                </p>
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 border-border text-muted-foreground hidden group-hover:inline-flex"
                >
                  {e.category}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}