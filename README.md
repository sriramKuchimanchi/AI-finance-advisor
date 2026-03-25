💰 FinanceAI – Smart Financial Advisor

A full-stack AI-powered personal finance management application that helps users track expenses, analyze spending patterns, and get intelligent financial insights.

🚀 Features
📊 Dashboard with financial overview
💸 Expense tracking (CRUD)
📈 Insights & category breakdown
🤖 AI Expense Detection (natural language → structured data)
🧠 AI Financial Advisor (chat-based)
🔐 JWT Authentication with session validation
📅 Monthly filtering & analytics
🧱 Tech Stack
Frontend
React + TypeScript
Vite
TailwindCSS
Context API (Auth state)
Backend
Node.js + Express
TypeScript
PostgreSQL
JWT Authentication
AI / External Services
Groq API (LLaMA 3)
Pinecone (vector embeddings – optional/advanced)
📁 Project Structure
finance-advisor/
│
├── backend/
│   ├── src/
│   │   ├── db/              # Database connection
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes (expenses, auth, etc.)
│   │   ├── services/        # AI + embedding logic
│   │   └── index.ts         # Server entry
│   │
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Pages (Dashboard, Expenses, etc.)
│   │   ├── context/         # Auth Context
│   │   ├── services/        # API calls
│   │   └── App.tsx
│   │
│   └── package.json
│
└── README.md
🧠 How the App Works (Beginner Explanation)
🔐 Authentication Flow
User logs in → backend generates JWT
Token stored in localStorage

Every request includes:

Authorization: Bearer <token>
Backend middleware verifies:
JWT validity
Session exists in DB

👉 Code reference: authMiddleware

🧾 Expense Flow
Add Expense

Frontend → API → Database

INSERT INTO expenses (user_id, amount, category, description, date)
Fetch Expenses
SELECT * FROM expenses WHERE user_id = $1
Update/Delete
Protected by user_id (security)
📊 Dashboard Logic
Total income
Total expenses
Net balance
Category breakdown

Example from your code:


👉 It calculates percentage like:

(d.total / total) * 100
🤖 AI Expense Detection

User input:

"Spent 500 on food, 200 on Uber"

AI:

Extracts amounts
Maps to categories
Returns structured JSON
💬 AI Advisor
Uses Groq (LLaMA 3)
Takes user financial data
Answers queries like:
"How much did I spend?"
"How can I save more?"
⚙️ Environment Variables

Create .env inside /backend:

PORT=5000
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret_key

GROQ_API_KEY=your_groq_key

PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=your_index_name
🛠️ How to Run the Project
1️⃣ Clone the repo
git clone <your-repo-url>
cd finance-advisor
2️⃣ Setup Backend
cd backend
npm install
Run server:
npm run dev

Server runs on:

http://localhost:5000
3️⃣ Setup Frontend
cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173
🗄️ Database Setup (PostgreSQL)
Create Database
CREATE DATABASE financeai;
Create Tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token TEXT,
  expires_at TIMESTAMP
);

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount NUMERIC,
  category TEXT,
  description TEXT,
  date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
🔑 How to Get API Keys
🧠 1. Groq API (Required)
Go to: https://console.groq.com
Sign up / login
Go to API Keys
Create new key
Add to .env:
GROQ_API_KEY=your_key_here
📦 2. Pinecone (Optional but Advanced)
Go to: https://www.pinecone.io
Create account
Create an index
Copy:
API Key
Index Name
PINECONE_API_KEY=your_key
PINECONE_INDEX=your_index

👉 Used for:

Semantic search
AI memory (future scaling)
🔐 Important Security Concepts
✅ Middleware Protection
WHERE id=$1 AND user_id=$2

➡️ Prevents users accessing others’ data

✅ JWT + Session Hybrid
JWT = fast auth
DB session = revocable login
📦 Key Components Explained
AuthContext (Frontend)
Stores user + token
Handles login/logout
Fetches /auth/me on load
AddExpenseDialog
Controlled form
Validates amount
Calls API
Updates UI instantly
CategoryChart
Converts raw data → percentage bars
Dynamic width rendering
🧪 Common Issues & Fixes
❌ Expenses not loading
Check token in localStorage
Check Authorization header
❌ 401 Unauthorized
Token expired
Session missing in DB
❌ DB connection error
Check DATABASE_URL
Ensure PostgreSQL running
❌ AI not working
Check GROQ_API_KEY
Check backend logs
