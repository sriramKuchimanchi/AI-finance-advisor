import { useEffect, useState } from 'react'
import { getDashboardStats } from '@/services/api'
import { Card } from '@/components/ui/card'
import MonthPicker from '@/components/shared/MonthPicker'
import { CATEGORY_COLORS, INCOME_SOURCE_COLORS } from '@/types'
import type { DashboardStats } from '@/types'
import { Loader2 } from 'lucide-react'

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function InsightsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(getCurrentMonth())

  useEffect(() => {
    setLoading(true)
    getDashboardStats(month).then(setStats).finally(() => setLoading(false))
  }, [month])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
    </div>
  )
  if (!stats) return null

  const totalCat = stats.expensesByCategory.reduce((s, c) => s + c.total, 0)
  const totalSrc = (stats.incomeBySource || []).reduce((s, c) => s + c.total, 0)
  const savingsRate = stats.monthlyIncome > 0
    ? Math.max(0, ((stats.monthlyIncome - stats.monthlyExpenses) / stats.monthlyIncome) * 100)
    : 0
  const netPositive = stats.netBalance >= 0

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Showing insights for selected month</p>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      <Card className="p-5 border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Savings Rate</p>
          <span className={`text-xl font-bold ${netPositive ? 'text-primary' : 'text-rose-400'}`}>
            {savingsRate.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-accent rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(savingsRate, 100)}%`,
              background: savingsRate >= 20 ? 'hsl(var(--primary))' : savingsRate >= 10 ? 'hsl(38,92%,60%)' : 'hsl(var(--destructive))',
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
          <span>Income: <span className="text-primary font-mono">₹{stats.monthlyIncome.toLocaleString('en-IN')}</span></span>
          <span>Spent: <span className="text-rose-400 font-mono">₹{stats.monthlyExpenses.toLocaleString('en-IN')}</span></span>
          <span>{savingsRate >= 20 ? '🟢 Excellent' : savingsRate >= 10 ? '🟡 Moderate' : '🔴 Overspending'}</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-border">
          <p className="text-sm font-semibold text-foreground mb-4">Where Your Money Goes</p>
          {stats.expensesByCategory.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No expenses this month</p>
          ) : (
            <div className="space-y-3">
              {stats.expensesByCategory.map(c => {
                const color = CATEGORY_COLORS[c.category] || CATEGORY_COLORS['Other']
                const pct = totalCat > 0 ? (c.total / totalCat) * 100 : 0
                return (
                  <div key={c.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        <span className="text-xs text-foreground">{c.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground">{pct.toFixed(0)}%</span>
                        <span className="text-xs font-mono text-foreground w-20 text-right">₹{c.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card className="p-5 border-border">
          <p className="text-sm font-semibold text-foreground mb-4">Income Sources</p>
          {!stats.incomeBySource || stats.incomeBySource.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No income this month</p>
          ) : (
            <div className="space-y-3">
              {stats.incomeBySource.map(s => {
                const color = INCOME_SOURCE_COLORS[s.source] || INCOME_SOURCE_COLORS['Other']
                const pct = totalSrc > 0 ? (s.total / totalSrc) * 100 : 0
                return (
                  <div key={s.source}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        <span className="text-xs text-foreground">{s.source}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground">{pct.toFixed(0)}%</span>
                        <span className="text-xs font-mono text-primary w-20 text-right">₹{s.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}