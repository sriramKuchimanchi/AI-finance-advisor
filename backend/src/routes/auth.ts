import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/pool'
import { sendPasswordResetEmail } from '../services/emailService'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'financeai_secret_key_2024'
const TOKEN_EXPIRY_HOURS = 24 * 7

async function createSession(userId: number): Promise<string> {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
  await pool.query(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  )
  return token
}


router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' })
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  if (!/\S+@\S+\.\S+/.test(email))
    return res.status(400).json({ error: 'Invalid email address' })

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'An account with this email already exists' })

    const password_hash = await bcrypt.hash(password, 12)
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name.trim(), email.toLowerCase(), password_hash]
    )
    const user = result.rows[0]
    const token = await createSession(user.id)
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to create account' })
  }
})


router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' })

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'No account found with this email' })

    const user = result.rows[0]
    if (!user.password_hash)
      return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid)
      return res.status(401).json({ error: 'Incorrect password' })

    const token = await createSession(user.id)
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Login failed' })
  }
})

router.post('/logout', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (token) await pool.query('DELETE FROM sessions WHERE token = $1', [token]).catch(() => {})
  res.json({ success: true })
})


router.get('/me', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    const session = await pool.query(
      'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()', [token]
    )
    if (session.rows.length === 0) return res.status(401).json({ error: 'Session expired' })
    const userResult = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1', [decoded.userId]
    )
    if (userResult.rows.length === 0) return res.status(401).json({ error: 'User not found' })
    res.json({ user: userResult.rows[0] })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})


router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })

  try {
    const result = await pool.query('SELECT id, name FROM users WHERE email = $1', [email.toLowerCase()])

    if (result.rows.length === 0)
      return res.json({ message: 'If this email exists, a reset link has been sent.' })

    const user = result.rows[0]
    const resetToken = jwt.sign({ userId: user.id, type: 'reset' }, JWT_SECRET, { expiresIn: '15m' })

    await sendPasswordResetEmail(email.toLowerCase(), user.name, resetToken)

    res.json({ message: 'Password reset link sent to your email.' })
  } catch (e) {
    console.error('Email error:', e)
    res.status(500).json({ error: 'Failed to send reset email. Check your Gmail config in .env' })
  }
})


router.post('/reset-password', async (req: Request, res: Response) => {
  const { resetToken, password } = req.body
  if (!resetToken || !password) return res.status(400).json({ error: 'Token and password required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

  try {
    const decoded = jwt.verify(resetToken, JWT_SECRET) as { userId: number; type: string }
    if (decoded.type !== 'reset') return res.status(400).json({ error: 'Invalid reset token' })

    const password_hash = await bcrypt.hash(password, 12)
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, decoded.userId])
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [decoded.userId])
    res.json({ message: 'Password updated successfully' })
  } catch {
    res.status(400).json({ error: 'Reset token is invalid or expired' })
  }
})

export default router