import { TrendingUp, TrendingDown, Wallet, ShieldCheck, ArrowUpDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { DashboardStats } from '@/types'

interface StatsCardsProps {
  stats: DashboardStats
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const netPositive = stats.netBalance >= 0

  const cards = [
    {
      label: 'Monthly Income',
      value: `₹${stats.monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      sub: new Date().toLocaleString('default', { month: 'long' }),
    },
    {
      label: 'Monthly Expenses',
      value: `₹${stats.monthlyExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
      border: 'border-rose-400/20',
      sub: `Top: ${stats.topCategory}`,
    },
    {
      label: 'Net Balance',
      value: `${netPositive ? '+' : '-'}₹${Math.abs(stats.netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: ArrowUpDown,
      color: netPositive ? 'text-primary' : 'text-rose-400',
      bg: netPositive ? 'bg-primary/10' : 'bg-rose-400/10',
      border: netPositive ? 'border-primary/20' : 'border-rose-400/20',
      sub: netPositive ? 'Saving money' : 'Overspending',
    },
    {
      label: 'Budget Health',
      value: `${stats.budgetHealth}%`,
      icon: ShieldCheck,
      color: stats.budgetHealth >= 70 ? 'text-primary' : stats.budgetHealth >= 40 ? 'text-amber-400' : 'text-rose-400',
      bg: stats.budgetHealth >= 70 ? 'bg-primary/10' : stats.budgetHealth >= 40 ? 'bg-amber-400/10' : 'bg-rose-400/10',
      border: stats.budgetHealth >= 70 ? 'border-primary/20' : stats.budgetHealth >= 40 ? 'border-amber-400/20' : 'border-rose-400/20',
      sub: stats.budgetHealth >= 70 ? 'On track' : stats.budgetHealth >= 40 ? 'Watch out' : 'Over budget',
    },
    {
      label: 'Total Income',
      value: `₹${stats.totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: Wallet,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
      border: 'border-sky-400/20',
      sub: 'All time',
    },
    {
      label: 'Total Expenses',
      value: `₹${stats.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
      sub: 'All time',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className={`p-4 border ${c.border} bg-card animate-slide-up`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{c.label}</p>
              <p className={`text-lg font-semibold mt-1 ${c.color} truncate`}>{c.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{c.sub}</p>
            </div>
            <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center shrink-0 ml-2`}>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}