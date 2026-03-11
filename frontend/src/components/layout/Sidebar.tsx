import { LayoutDashboard, Receipt, PiggyBank, MessageSquare, TrendingUp, LogOut, Banknote, BarChart2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import type { Page } from '@/types'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems: { icon: React.ElementType; label: string; page: Page; badge?: string }[] = [
  { icon: LayoutDashboard, label: 'Dashboard',  page: 'dashboard' },
  { icon: Receipt,         label: 'Expenses',   page: 'expenses' },
  { icon: Banknote,        label: 'Income',     page: 'income' },
  { icon: PiggyBank,       label: 'Budgets',    page: 'budgets' },
  { icon: BarChart2,       label: 'Insights',   page: 'insights' },
  { icon: MessageSquare,   label: 'AI Adviser', page: 'chat', badge: 'AI' },
]

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth()
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <aside className="fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-40" style={{ width: 'var(--sidebar-width)' }}>
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">FinanceAI</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Smart Adviser</p>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-2">Menu</p>
        {navItems.map(({ icon: Icon, label, page, badge }) => (
          <button key={page} onClick={() => onNavigate(page)} className={`sidebar-item w-full ${currentPage === page ? 'active' : ''}`}>
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {badge && (
              <Badge className="text-[9px] px-1.5 py-0 h-4 bg-primary/15 text-primary border-primary/20 font-medium">{badge}</Badge>
            )}
          </button>
        ))}
      </nav>

      <Separator />

      <div className="px-3 py-4 space-y-0.5">
        <div className="sidebar-item">
          <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-item w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}