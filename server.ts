import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("finance.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    profile_type TEXT DEFAULT 'assalariado'
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'income' or 'expense'
    category TEXT,
    amount REAL,
    date TEXT,
    description TEXT,
    profile_context TEXT, -- 'assalariado', 'autonomo', 'empresario'
    is_recurring INTEGER DEFAULT 0,
    installments INTEGER DEFAULT 1,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    type TEXT,
    icon TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    target_amount REAL,
    current_amount REAL DEFAULT 0,
    deadline TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Migration: Add is_recurring and installments if they don't exist
try {
  db.prepare("ALTER TABLE transactions ADD COLUMN is_recurring INTEGER DEFAULT 0").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE transactions ADD COLUMN installments INTEGER DEFAULT 1").run();
} catch (e) {}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Middleware (Simplified for demo)
  const getUserId = (req: express.Request) => {
    return parseInt(req.headers["x-user-id"] as string) || 1;
  };

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    let user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    if (!user) {
      db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, password);
      user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    }
    res.json({ id: user.id, username: user.username, profile_type: user.profile_type });
  });

  app.get("/api/profile", (req, res) => {
    const userId = getUserId(req);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    res.json(user);
  });

  app.put("/api/profile", (req, res) => {
    const userId = getUserId(req);
    const { profile_type } = req.body;
    db.prepare("UPDATE users SET profile_type = ? WHERE id = ?").run(profile_type, userId);
    res.json({ success: true });
  });

  app.get("/api/transactions", (req, res) => {
    const userId = getUserId(req);
    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC").all(userId);
    res.json(transactions);
  });

  app.post("/api/transactions", (req, res) => {
    const userId = getUserId(req);
    const { type, category, amount, date, description, profile_context, is_recurring, installments } = req.body;
    const result = db.prepare(`
      INSERT INTO transactions (user_id, type, category, amount, date, description, profile_context, is_recurring, installments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, type, category, amount, date, description, profile_context, is_recurring ? 1 : 0, installments || 1);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/transactions/:id", (req, res) => {
    const userId = getUserId(req);
    db.prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?").run(req.params.id, userId);
    res.json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    const userId = getUserId(req);
    const stats = db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
      FROM transactions 
      WHERE user_id = ?
    `).get(userId) as any;
    
    const monthlyData = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE user_id = ?
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `).all(userId);

    res.json({ ...stats, monthlyData });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
