# 💰 FinanceAI — Intelligent Personal Finance Advisor

FinanceAI is a full-stack AI-powered financial management platform that helps users track expenses, analyze spending behavior, and receive intelligent financial guidance using LLM-driven insights.

Designed as a **smart finance assistant** combining real-time analytics with AI-based recommendations.

---

## 🚀 Features

### 📊 Financial Dashboard

* Overview of:

  * Total income
  * Total expenses
  * Net balance
* Visual breakdown of spending patterns

---

### 💸 Expense Management (CRUD)

* Add, edit, delete expenses
* Categorize transactions
* Secure, user-specific data handling

---

### 📈 Spending Insights

* Category-wise expense distribution
* Monthly analytics
* Percentage-based breakdowns

---

### 🤖 AI Expense Detection

* Convert natural language into structured expenses
  Example:

  > "Spent 500 on food and 200 on Uber"

* AI extracts:

  * Amounts
  * Categories
  * Descriptions

---

### 🧠 AI Financial Advisor

* Chat-based financial assistant
* Answers questions like:

  * “How much did I spend this month?”
  * “Where can I save money?”
* Context-aware responses based on user data

---

### 📅 Monthly Filtering

* Analyze spending by month
* Track financial trends over time

---

### 🔐 Secure Authentication

* JWT-based authentication
* Session validation via database
* Protected routes and APIs

---

## 🧠 System Architecture (How It Works)

This application combines **traditional backend logic + AI augmentation**:

---

### 🔐 Authentication Flow

1. User logs in
2. Backend generates JWT
3. Token stored in localStorage
4. Each request includes:

   ```
   Authorization: Bearer <token>
   ```
5. Backend verifies:

   * JWT validity
   * Session existence in database

---

### 💸 Expense Flow

1. User adds expense
2. Backend stores in PostgreSQL
3. Data retrieved per user securely

```sql id="sql-expense"
INSERT INTO expenses (user_id, amount, category, description, date)
```

```sql id="sql-fetch"
SELECT * FROM expenses WHERE user_id = $1
```

---

### 📊 Dashboard Logic

* Calculates:

  * Total income & expenses
  * Net balance
  * Category distribution

Example calculation:

```js id="calc"
(d.total / total) * 100
```

---

### 🤖 AI Expense Detection Flow

1. User inputs natural language
2. AI processes input
3. Returns structured JSON:

   * amount
   * category
   * description
4. Stored directly as expense

---

### 💬 AI Advisor Flow

1. User asks financial question
2. Backend fetches user data
3. Sends context to AI (Groq)
4. AI returns personalized advice

---

## ⚙️ Environment Variables

Create `.env` inside `/backend`:

```env id="env-finance"
PORT=5000

DATABASE_URL=

JWT_SECRET=

GROQ_API_KEY=

PINECONE_API_KEY=
PINECONE_INDEX=
```

---

## 🔑 API Key Setup Guide

### ⚡ Groq (REQUIRED)

Used for:

* AI advisor
* Expense detection

Steps:

1. Go to https://console.groq.com
2. Create API key
3. Add to `.env`

```env id="groq-fin"
GROQ_API_KEY=your_key_here
```

---

### 🌲 Pinecone (OPTIONAL)

Used for:

* Semantic memory
* Advanced AI features

Steps:

1. Go to https://www.pinecone.io
2. Create index
3. Copy credentials

```env id="pinecone-fin"
PINECONE_API_KEY=your_key
PINECONE_INDEX=your_index
```

---

## 🗄 Database Setup (PostgreSQL)

### Create Database

```sql id="db1"
CREATE DATABASE financeai;
```

---

### Create Tables

```sql id="db2"
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT
);
```

```sql id="db3"
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token TEXT,
  expires_at TIMESTAMP
);
```

```sql id="db4"
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount NUMERIC,
  category TEXT,
  description TEXT,
  date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🛠 Installation & Setup

### 1. Clone Repository

```bash id="clone-fin"
git clone https://github.com/your-username/finance-ai.git
cd finance-ai
```

---

### 2. Backend Setup

```bash id="backend-fin"
cd backend
npm install
npm run dev
```

Runs on:

```bash id="backend-url-fin"
http://localhost:5000
```

---

### 3. Frontend Setup

```bash id="frontend-fin"
cd frontend
npm install
npm run dev
```

Runs on:

```bash id="frontend-url-fin"
http://localhost:5173
```

---

## 🔌 API Overview

### Auth

* `POST /auth/login`
* `GET /auth/me`

### Expenses

* `POST /expenses`
* `GET /expenses`
* `PUT /expenses/:id`
* `DELETE /expenses/:id`

### AI

* `POST /ai/parse-expense`
* `POST /ai/advisor`

---

## 🔐 Security Architecture

### ✅ Middleware Protection

* Ensures user isolation:

```sql id="secure"
WHERE id=$1 AND user_id=$2
```

---

### ✅ JWT + Session Hybrid

* JWT → fast authentication
* DB sessions → revocable access

---

## 🧩 Key Frontend Components

* **AuthContext**

  * Stores user & token
  * Handles login/logout
  * Fetches `/auth/me`

* **AddExpenseDialog**

  * Controlled form
  * Validates inputs
  * Updates UI instantly

* **CategoryChart**

  * Converts raw data → percentages
  * Dynamic visual rendering

---

## ⚡ UX Highlights

* ⚡ Real-time expense tracking
* 🤖 AI-powered input parsing
* 📊 Clean financial dashboard
* 💬 Interactive financial advisor
* 📱 Modern responsive UI (Tailwind)

---

## 🚀 Future Enhancements

* 📊 Advanced financial graphs (charts & trends)
* 🧠 AI budgeting recommendations
* 📈 Predictive expense forecasting
* 🔔 Smart alerts (overspending warnings)
* 🌐 Deployment (Docker + CI/CD)

---

## 🐛 Common Issues

### ❌ Expenses not loading

✔ Check:

* Token in localStorage
* Authorization header

---

### ❌ 401 Unauthorized

✔ Possible causes:

* Token expired
* Session missing in DB

---

### ❌ Database connection error

✔ Check:

* DATABASE_URL
* PostgreSQL running

---

### ❌ AI not working

✔ Check:

* GROQ_API_KEY
* Backend logs



