
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS income (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  source TEXT NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  monthly_limit NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, category)
);


CREATE TABLE IF NOT EXISTS chat_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_sessions_user_id 
ON sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_token 
ON sessions(token);


CREATE INDEX IF NOT EXISTS idx_expenses_user_id 
ON expenses(user_id);

CREATE INDEX IF NOT EXISTS idx_expenses_date 
ON expenses(date);

CREATE INDEX IF NOT EXISTS idx_expenses_category 
ON expenses(category);


CREATE INDEX IF NOT EXISTS idx_income_user_id 
ON income(user_id);

CREATE INDEX IF NOT EXISTS idx_income_date 
ON income(date);


CREATE INDEX IF NOT EXISTS idx_budgets_user_id 
ON budgets(user_id);


CREATE INDEX IF NOT EXISTS idx_chat_history_user_id 
ON chat_history(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_history_created_at 
ON chat_history(created_at);