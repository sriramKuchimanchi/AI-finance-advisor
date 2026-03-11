import { useEffect, useState } from 'react'
import { getDashboardStats } from '@/services/api'
import StatsCards from '@/components/dashboard/StatsCards'
import CategoryChart from '@/components/dashboard/CategoryChart'
import RecentExpenses from '@/components/dashboard/RecentExpenses'
import MonthPicker from '@/components/shared/MonthPicker'
import type { DashboardStats } from '@/types'
import { CATEGORY_COLORS } from '@/types'
import { Loader2 } from 'lucide-react'

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(getCurrentMonth())

  useEffect(() => {
    setLoading(true)
    getDashboardStats(month)
      .then(setStats)
      .finally(() => setLoading(false))
  }, [month])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
    </div>
  )
  if (!stats) return null

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Showing data for selected month</p>
        <MonthPicker value={month} onChange={setMonth} />
      </div>
      <StatsCards stats={stats} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <CategoryChart data={stats.expensesByCategory.map(c => ({ ...c, color: CATEGORY_COLORS[c.category] || CATEGORY_COLORS['Other'] }))} />
        <RecentExpenses expenses={stats.recentExpenses} />
      </div>
    </div>
  )
}