import { Router, Response } from 'express'
import pool from '../db/pool'
import { getChatReply } from '../services/groqService'
import { AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM chat_history WHERE user_id=$1 ORDER BY created_at ASC LIMIT 50',
      [req.userId]
    )
    res.json(result.rows)
  } catch { res.status(500).json({ error: 'Failed to fetch chat history' }) }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'Message is required' })

  try {
    const historyResult = await pool.query(
      'SELECT role, content FROM chat_history WHERE user_id=$1 ORDER BY created_at ASC LIMIT 20',
      [req.userId]
    )
    const history = historyResult.rows

    const reply = await getChatReply(message, history, req.userId!)

    await pool.query(
      'INSERT INTO chat_history (user_id, role, content) VALUES ($1,$2,$3)',
      [req.userId, 'user', message]
    )
    await pool.query(
      'INSERT INTO chat_history (user_id, role, content) VALUES ($1,$2,$3)',
      [req.userId, 'assistant', reply]
    )

    res.json({ reply })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to process message' })
  }
})

router.delete('/history', async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM chat_history WHERE user_id=$1', [req.userId])
    res.json({ success: true })
  } catch { res.status(500).json({ error: 'Failed to clear history' }) }
})

export default router