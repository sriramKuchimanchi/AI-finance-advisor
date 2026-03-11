import { Router, Response } from 'express'
import pool from '../db/pool'
import { AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const budgets = await pool.query('SELECT * FROM budgets WHERE user_id = $1', [req.userId])
    const result = await Promise.all(budgets.rows.map(async (b) => {
      const spent = await pool.query(
        `SELECT COALESCE(SUM(amount),0) as spent FROM expenses
         WHERE user_id=$1 AND category=$2
         AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)`,
        [req.userId, b.category]
      )
      return { ...b, spent: parseFloat(spent.rows[0].spent) }
    }))
    res.json(result)
  } catch { res.status(500).json({ error: 'Failed to fetch budgets' }) }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  const { category, monthly_limit } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO budgets (user_id, category, monthly_limit)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id, category) DO UPDATE SET monthly_limit=$3
       RETURNING *`,
      [req.userId, category, monthly_limit]
    )
    res.status(201).json(result.rows[0])
  } catch { res.status(500).json({ error: 'Failed to add budget' }) }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM budgets WHERE id=$1 AND user_id=$2', [req.params.id, req.userId])
    res.json({ success: true })
  } catch { res.status(500).json({ error: 'Failed to delete budget' }) }
})

export default router