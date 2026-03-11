import type { Page } from '@/types'

const PAGE_TITLES: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard',  subtitle: 'Your financial overview at a glance' },
  expenses:  { title: 'Expenses',   subtitle: 'Track and manage your spending' },
  income:    { title: 'Income',     subtitle: 'Track your earnings and net balance' },
  budgets:   { title: 'Budgets',    subtitle: 'Set limits and stay on track' },
  insights:  { title: 'Insights',   subtitle: 'Visual breakdown of your financial patterns' },
  chat:      { title: 'AI Adviser', subtitle: 'Ask anything about your finances' },
}

interface HeaderProps { currentPage: Page }

export default function Header({ currentPage }: HeaderProps) {
  const { title, subtitle } = PAGE_TITLES[currentPage]
  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-sm font-semibold text-foreground leading-none">{title}</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </header>
  )
}