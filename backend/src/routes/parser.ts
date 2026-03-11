import { Router, Response } from 'express'
import Groq from 'groq-sdk'
import { AuthRequest } from '../middleware/auth'
import dotenv from 'dotenv'
dotenv.config()

const router = Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.post('/parse-expenses', async (req: AuthRequest, res: Response) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'Text is required' })

  const prompt = `You are a financial data parser. Extract ALL expense transactions from the user's text.

Return ONLY a valid JSON array, no explanation, no markdown, no backticks.

Each item must have:
- "description": short label (string)
- "amount": number (INR, no currency symbols)
- "category": one of exactly: "Food & Dining", "Transport", "Shopping", "Entertainment", "Health", "Education", "Utilities", "Rent", "Other"
- "date": today's date in YYYY-MM-DD format: ${new Date().toISOString().split('T')[0]}

User text: "${text}"

Return only the JSON array like: [{"description":"Lunch","amount":120,"category":"Food & Dining","date":"2026-03-11"}]`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.1,
    })

    const raw = completion.choices[0]?.message?.content || '[]'
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    if (!Array.isArray(parsed)) return res.status(422).json({ error: 'Could not parse expenses from text' })
    res.json({ items: parsed })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to parse expenses' })
  }
})

router.post('/parse-income', async (req: AuthRequest, res: Response) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'Text is required' })

  const prompt = `You are a financial data parser. Extract ALL income transactions from the user's text.

Return ONLY a valid JSON array, no explanation, no markdown, no backticks.

Each item must have:
- "description": short label (string)
- "amount": number (INR, no currency symbols)
- "source": one of exactly: "Salary", "Freelance", "Part-time Job", "Allowance", "Business", "Investment", "Gift", "Other"
- "date": today's date in YYYY-MM-DD format: ${new Date().toISOString().split('T')[0]}

User text: "${text}"

Return only the JSON array like: [{"description":"Monthly salary","amount":30000,"source":"Salary","date":"2026-03-11"}]`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.1,
    })

    const raw = completion.choices[0]?.message?.content || '[]'
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    if (!Array.isArray(parsed)) return res.status(422).json({ error: 'Could not parse income from text' })
    res.json({ items: parsed })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to parse income' })
  }
})

export default router