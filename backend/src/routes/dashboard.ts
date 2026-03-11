import { Router, Response } from 'express'
import pool from '../db/pool'
import { AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  const uid = req.userId
  const monthParam = req.query.month as string | undefined

  let monthStart: string
  let monthEnd: string

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    monthStart = `${monthParam}-01`
    const [y, m] = monthParam.split('-').map(Number)
    const end = new Date(y, m, 0)
    monthEnd = `${monthParam}-${String(end.getDate()).padStart(2, '0')}`
  } else {
    const now = new Date()
    monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
  }

  try {
    const [totalResult, monthResult, incomeResult, totalIncomeResult] = await Promise.all([
      pool.query('SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE user_id=$1', [uid]),
      pool.query('SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE user_id=$1 AND date >= $2 AND date <= $3', [uid, monthStart, monthEnd]),
      pool.query('SELECT COALESCE(SUM(amount),0) as total FROM income WHERE user_id=$1 AND date >= $2 AND date <= $3', [uid, monthStart, monthEnd]),
      pool.query('SELECT COALESCE(SUM(amount),0) as total FROM income WHERE user_id=$1', [uid]),
    ])

    const totalExpenses = parseFloat(totalResult.rows[0].total)
    const monthlyExpenses = parseFloat(monthResult.rows[0].total)
    const monthlyIncome = parseFloat(incomeResult.rows[0].total)
    const totalIncome = parseFloat(totalIncomeResult.rows[0].total)
    const netBalance = monthlyIncome - monthlyExpenses

    const catResult = await pool.query(
      'SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses WHERE user_id=$1 AND date >= $2 AND date <= $3 GROUP BY category ORDER BY total DESC',
      [uid, monthStart, monthEnd]
    )
    const expensesByCategory = catResult.rows.map(r => ({
      category: r.category, total: parseFloat(r.total), count: parseInt(r.count),
    }))
    const topCategory = expensesByCategory.length > 0 ? expensesByCategory[0].category : 'N/A'

    const budgetResult = await pool.query('SELECT * FROM budgets WHERE user_id=$1', [uid])
    let budgetHealth = 100
    if (budgetResult.rows.length > 0) {
      let healthy = 0
      for (const b of budgetResult.rows) {
        const spentResult = await pool.query(
          'SELECT COALESCE(SUM(amount),0) as spent FROM expenses WHERE user_id=$1 AND category=$2 AND date >= $3 AND date <= $4',
          [uid, b.category, monthStart, monthEnd]
        )
        if (parseFloat(spentResult.rows[0].spent) <= parseFloat(b.monthly_limit)) healthy++
      }
      budgetHealth = Math.round((healthy / budgetResult.rows.length) * 100)
    }

    const recentResult = await pool.query(
      'SELECT * FROM expenses WHERE user_id=$1 AND date >= $2 AND date <= $3 ORDER BY date DESC, created_at DESC LIMIT 10',
      [uid, monthStart, monthEnd]
    )

    const trendResult = await pool.query(
      `SELECT TO_CHAR(DATE_TRUNC('month',date),'Mon') as month,
              TO_CHAR(DATE_TRUNC('month',date),'YYYY-MM') as month_key,
              SUM(amount) as amount
       FROM expenses WHERE user_id=$1 AND date >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month',date) ORDER BY DATE_TRUNC('month',date)`,
      [uid]
    )

    const incomeTrendResult = await pool.query(
      `SELECT TO_CHAR(DATE_TRUNC('month',date),'Mon') as month,
              SUM(amount) as amount
       FROM income WHERE user_id=$1 AND date >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month',date) ORDER BY DATE_TRUNC('month',date)`,
      [uid]
    )

    const incomeBySource = await pool.query(
      'SELECT source, SUM(amount) as total, COUNT(*) as count FROM income WHERE user_id=$1 AND date >= $2 AND date <= $3 GROUP BY source ORDER BY total DESC',
      [uid, monthStart, monthEnd]
    )

    res.json({
      totalExpenses, totalIncome, monthlyExpenses, monthlyIncome, netBalance,
      topCategory, budgetHealth,
      expensesByCategory,
      recentExpenses: recentResult.rows,
      monthlyTrend: trendResult.rows.map(r => ({ month: r.month, month_key: r.month_key, amount: parseFloat(r.amount) })),
      monthlyIncomeTrend: incomeTrendResult.rows.map(r => ({ month: r.month, amount: parseFloat(r.amount) })),
      incomeBySource: incomeBySource.rows.map(r => ({ source: r.source, total: parseFloat(r.total), count: parseInt(r.count) })),
      selectedMonth: monthParam || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
})

export default router