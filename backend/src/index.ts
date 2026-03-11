import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import expensesRouter from './routes/expenses'
import budgetsRouter from './routes/budgets'
import dashboardRouter from './routes/dashboard'
import chatRouter from './routes/chat'
import incomeRouter from './routes/income'
import authRouter from './routes/auth'
import parserRouter from './routes/parser'
import { authMiddleware } from './middleware/auth'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter)

app.use('/api/expenses', authMiddleware, expensesRouter)
app.use('/api/budgets', authMiddleware, budgetsRouter)
app.use('/api/dashboard', authMiddleware, dashboardRouter)
app.use('/api/chat', authMiddleware, chatRouter)
app.use('/api/income', authMiddleware, incomeRouter)
app.use('/api/ai', authMiddleware, parserRouter)

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`)
})