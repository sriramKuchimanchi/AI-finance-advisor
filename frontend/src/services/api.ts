import type { Expense, Budget, ChatMessage, DashboardStats, Income } from '../types'

const BASE = 'http://localhost:5000/api'

function getToken() {
  return localStorage.getItem('fa_token')
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const getExpenses = () => req<Expense[]>('/expenses')
export const addExpense = (data: Omit<Expense, 'id' | 'created_at'>) =>
  req<Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) })
export const updateExpense = (id: number, data: Partial<Expense>) =>
  req<Expense>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteExpense = (id: number) =>
  req<void>(`/expenses/${id}`, { method: 'DELETE' })

export const getBudgets = () => req<Budget[]>('/budgets')
export const addBudget = (data: Omit<Budget, 'id' | 'created_at'>) =>
  req<Budget>('/budgets', { method: 'POST', body: JSON.stringify(data) })
export const deleteBudget = (id: number) =>
  req<void>(`/budgets/${id}`, { method: 'DELETE' })

export const getIncome = () => req<Income[]>('/income')
export const addIncome = (data: Omit<Income, 'id' | 'created_at'>) =>
  req<Income>('/income', { method: 'POST', body: JSON.stringify(data) })
export const deleteIncome = (id: number) =>
  req<void>(`/income/${id}`, { method: 'DELETE' })

export const getDashboardStats = (month?: string) =>
  req<DashboardStats>(`/dashboard${month ? `?month=${month}` : ''}`)

export const getChatHistory = () => req<ChatMessage[]>('/chat/history')
export const sendChatMessage = (message: string) =>
  req<{ reply: string }>('/chat', { method: 'POST', body: JSON.stringify({ message }) })
export const clearChatHistory = () =>
  req<void>('/chat/history', { method: 'DELETE' })