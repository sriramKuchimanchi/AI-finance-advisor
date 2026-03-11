import { Router, Response } from 'express'
import pool from '../db/pool'
import { AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
      [req.userId]
    )
    res.json(result.rows)
  } catch { res.status(500).json({ error: 'Failed to fetch expenses' }) }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  const { amount, category, description, date } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO expenses (user_id, amount, category, description, date)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.userId, amount, category, description || '', date || new Date().toISOString().split('T')[0]]
    )
    res.status(201).json(result.rows[0])
  } catch { res.status(500).json({ error: 'Failed to add expense' }) }
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { amount, category, description, date } = req.body
  try {
    const result = await pool.query(
      `UPDATE expenses SET amount=$1, category=$2, description=$3, date=$4
       WHERE id=$5 AND user_id=$6 RETURNING *`,
      [amount, category, description, date, req.params.id, req.userId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' })
    res.json(result.rows[0])
  } catch { res.status(500).json({ error: 'Failed to update expense' }) }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM expenses WHERE id=$1 AND user_id=$2', [req.params.id, req.userId])
    res.json({ success: true })
  } catch { res.status(500).json({ error: 'Failed to delete expense' }) }
})

export default router