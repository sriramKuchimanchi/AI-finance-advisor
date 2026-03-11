import { useState } from 'react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import DashboardPage from '@/pages/DashboardPage'
import ExpensesPage from '@/pages/ExpensesPage'
import BudgetsPage from '@/pages/BudgetsPage'
import ChatPage from '@/pages/ChatPage'
import IncomePage from '@/pages/IncomePage'
import InsightsPage from '@/pages/InsightsPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPage from '@/pages/ForgotPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import { Loader2 } from 'lucide-react'
import type { Page } from '@/types'

type AuthPage = 'login' | 'register' | 'forgot'


const initialPath = window.location.pathname
const initialParams = new URLSearchParams(window.location.search)
const RESET_TOKEN = initialPath === '/reset-password' ? initialParams.get('token') : null


if (RESET_TOKEN) {
  window.history.replaceState({}, '', '/')
}

function AppInner() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState<Page>('dashboard')
  const [authPage, setAuthPage] = useState<AuthPage>('login')
  const [showReset, setShowReset] = useState(!!RESET_TOKEN)

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
    </div>
  )


  if (showReset && RESET_TOKEN) {
    return (
      <ResetPasswordPage
        resetToken={RESET_TOKEN}
        onDone={() => setShowReset(false)}
      />
    )
  }

  if (!user) {
    if (authPage === 'register') return <RegisterPage onSwitch={setAuthPage} />
    if (authPage === 'forgot') return <ForgotPage onSwitch={setAuthPage} />
    return <LoginPage onSwitch={setAuthPage} />
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage />
      case 'expenses':  return <ExpensesPage />
      case 'income':    return <IncomePage />
      case 'budgets':   return <BudgetsPage />
      case 'insights':  return <InsightsPage />
      case 'chat':      return <ChatPage />
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPage={page} onNavigate={setPage} />
      <div className="flex-1 flex flex-col" style={{ marginLeft: 'var(--sidebar-width)' }}>
        <Header currentPage={page} />
        <main className="flex-1 p-6 overflow-y-auto scrollbar-thin">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}