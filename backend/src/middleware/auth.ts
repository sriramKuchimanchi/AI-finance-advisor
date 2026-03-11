import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import pool from '../db/pool'

const JWT_SECRET = process.env.JWT_SECRET || 'financeai_secret_key_2024'

export interface AuthRequest extends Request {
  userId?: number
  user?: { id: number; name: string; email: string }
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    const session = await pool.query(
      'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    )
    if (session.rows.length === 0) return res.status(401).json({ error: 'Session expired, please log in again' })

    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}