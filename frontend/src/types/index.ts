export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface Expense {
  id: number
  user_id: number
  amount: number
  category: string
  description: string
  date: string
  created_at: string
}

export interface Income {
  id: number
  user_id: number
  amount: number
  source: string
  description: string
  date: string
  created_at: string
}

export interface Budget {
  id: number
  user_id: number
  category: string
  monthly_limit: number
  spent?: number
  created_at: string
}

export interface ChatMessage {
  id?: number
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface DashboardStats {
  totalExpenses: number
  totalIncome: number
  monthlyExpenses: number
  monthlyIncome: number
  netBalance: number
  topCategory: string
  budgetHealth: number
  expensesByCategory: CategoryStat[]
  recentExpenses: Expense[]
  monthlyTrend: MonthlyTrend[]
  monthlyIncomeTrend: MonthlyTrend[]
  incomeBySource: SourceStat[]
}

export interface CategoryStat {
  category: string
  total: number
  count: number
  color: string
}

export interface SourceStat {
  source: string
  total: number
  count: number
}

export interface MonthlyTrend {
  month: string
  month_key: string
  amount: number
}


export type Page = 'dashboard' | 'expenses' | 'budgets' | 'chat' | 'income' | 'insights'

export const CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Entertainment',
  'Health',
  'Education',
  'Utilities',
  'Rent',
  'Other',
] as const

export const INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Part-time Job',
  'Allowance',
  'Business',
  'Investment',
  'Gift',
  'Other',
] as const

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': 'hsl(38,92%,60%)',
  'Transport': 'hsl(199,89%,60%)',
  'Shopping': 'hsl(258,90%,66%)',
  'Entertainment': 'hsl(350,89%,60%)',
  'Health': 'hsl(158,64%,52%)',
  'Education': 'hsl(280,80%,65%)',
  'Utilities': 'hsl(30,85%,60%)',
  'Rent': 'hsl(220,70%,65%)',
  'Other': 'hsl(210,12%,50%)',
}

export const INCOME_SOURCE_COLORS: Record<string, string> = {
  'Salary': 'hsl(158,64%,52%)',
  'Freelance': 'hsl(199,89%,60%)',
  'Part-time Job': 'hsl(38,92%,60%)',
  'Allowance': 'hsl(258,90%,66%)',
  'Business': 'hsl(280,80%,65%)',
  'Investment': 'hsl(220,70%,65%)',
  'Gift': 'hsl(350,89%,60%)',
  'Other': 'hsl(210,12%,50%)',
}