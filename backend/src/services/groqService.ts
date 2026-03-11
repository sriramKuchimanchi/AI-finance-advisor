import Groq from 'groq-sdk'
import pool from '../db/pool'
import dotenv from 'dotenv'
dotenv.config()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function getFinancialContext(userId: number): Promise<string> {
  try {
    const [expenses, budgets, incomeResult] = await Promise.all([
      pool.query(`
        SELECT category, SUM(amount) as total, COUNT(*) as count
        FROM expenses WHERE user_id=$1
        AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY category ORDER BY total DESC
      `, [userId]),
      pool.query('SELECT category, monthly_limit FROM budgets WHERE user_id=$1', [userId]),
      pool.query(`
        SELECT source, SUM(amount) as total, COUNT(*) as count
        FROM income WHERE user_id=$1
        AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY source ORDER BY total DESC
      `, [userId]),
    ])

    const recentExpenses = await pool.query(
      'SELECT amount, category, description, date FROM expenses WHERE user_id=$1 ORDER BY date DESC LIMIT 10',
      [userId]
    )

    const totalMonthExpenses = expenses.rows.reduce((s: number, r: { total: string }) => s + parseFloat(r.total), 0)
    const totalMonthIncome = incomeResult.rows.reduce((s: number, r: { total: string }) => s + parseFloat(r.total), 0)
    const netBalance = totalMonthIncome - totalMonthExpenses

    let context = `=== THIS MONTH'S FINANCIAL SUMMARY ===\n`
    context += `Total Income: Rs.${totalMonthIncome.toFixed(2)}\n`
    context += `Total Expenses: Rs.${totalMonthExpenses.toFixed(2)}\n`
    context += `Net Balance: Rs.${netBalance.toFixed(2)} (${netBalance >= 0 ? 'surplus' : 'deficit'})\n\n`

    if (incomeResult.rows.length > 0) {
      context += `Income by source this month:\n`
      for (const r of incomeResult.rows)
        context += `- ${r.source}: Rs.${parseFloat(r.total).toFixed(2)} (${r.count} entries)\n`
      context += '\n'
    }

    if (expenses.rows.length > 0) {
      context += `Spending by category this month:\n`
      for (const r of expenses.rows)
        context += `- ${r.category}: Rs.${parseFloat(r.total).toFixed(2)} (${r.count} transactions)\n`
      context += '\n'
    }

    if (budgets.rows.length > 0) {
      context += `Monthly budgets:\n`
      for (const b of budgets.rows) {
        const catSpent = expenses.rows.find((e: { category: string }) => e.category === b.category)
        const spent = catSpent ? parseFloat(catSpent.total) : 0
        const limit = parseFloat(b.monthly_limit)
        const pct = limit > 0 ? ((spent / limit) * 100).toFixed(0) : 0
        const status = spent > limit ? 'OVER BUDGET' : spent / limit >= 0.7 ? 'NEAR LIMIT' : 'OK'
        context += `- ${b.category}: Rs.${spent.toFixed(2)} / Rs.${limit.toFixed(2)} (${pct}% used) [${status}]\n`
      }
      context += '\n'
    }

    if (recentExpenses.rows.length > 0) {
      context += `Recent transactions:\n`
      for (const e of recentExpenses.rows)
        context += `- ${new Date(e.date).toLocaleDateString('en-IN')}: Rs.${parseFloat(e.amount).toFixed(2)} on ${e.category}${e.description ? ` (${e.description})` : ''}\n`
    }

    return context
  } catch {
    return 'No financial data available yet.'
  }
}

export async function getChatReply(
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  userId: number
): Promise<string> {
  const context = await getFinancialContext(userId)

  const systemPrompt = `You are a friendly, knowledgeable AI financial adviser for a college student in India.
You have access to their REAL financial data shown below. Always use this data to give specific, personalised advice.
Be concise, clear, and encouraging. Use Rs. for currency. Keep responses under 200 words unless asked for detail.
If asked about income, savings, or net balance, you HAVE this data so always use it.

${context}`

  const messages = [
    ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: userMessage },
  ]

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 500,
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
}