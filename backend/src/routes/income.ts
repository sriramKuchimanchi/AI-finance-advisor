import { Router, Response } from 'express'
import pool from '../db/pool'
import { AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM income WHERE user_id = $1 ORDER BY date DESC',
      [req.userId]
    )
    res.json(result.rows)
  } catch { res.status(500).json({ error: 'Failed to fetch income' }) }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  const { amount, source, description, date } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO income (user_id, amount, source, description, date)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.userId, amount, source, description || '', date || new Date().toISOString().split('T')[0]]
    )
    res.status(201).json(result.rows[0])
  } catch { res.status(500).json({ error: 'Failed to add income' }) }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM income WHERE id=$1 AND user_id=$2', [req.params.id, req.userId])
    res.json({ success: true })
  } catch { res.status(500).json({ error: 'Failed to delete income' }) }
})

export default router