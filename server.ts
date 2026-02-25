import express from "express";
import { createServer as createViteServer } from "vite";
import pg from "pg";
const { Pool } = pg;
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize Database
const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      profile_type TEXT DEFAULT 'assalariado'
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
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
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      name TEXT,
      type TEXT,
      icon TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS goals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      name TEXT,
      target_amount REAL,
      current_amount REAL DEFAULT 0,
      deadline TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
};

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Middleware (Simplified for demo)
  const getUserId = (req: express.Request) => {
    return parseInt(req.headers["x-user-id"] as string) || 1;
  };

  // API Routes
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      let result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      let user = result.rows[0];
      if (!user) {
        await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, password]);
        result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        user = result.rows[0];
      }
      res.json({ id: user.id, username: user.username, profile_type: user.profile_type });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get("/api/profile", async (req, res) => {
    const userId = getUserId(req);
    try {
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.put("/api/profile", async (req, res) => {
    const userId = getUserId(req);
    const { profile_type } = req.body;
    try {
      await pool.query("UPDATE users SET profile_type = $1 WHERE id = $2", [profile_type, userId]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get("/api/transactions", async (req, res) => {
    const userId = getUserId(req);
    try {
      const result = await pool.query("SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC", [userId]);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    const userId = getUserId(req);
    const { type, category, amount, date, description, profile_context, is_recurring, installments } = req.body;
    try {
      const result = await pool.query(`
        INSERT INTO transactions (user_id, type, category, amount, date, description, profile_context, is_recurring, installments)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [userId, type, category, amount, date, description, profile_context, is_recurring ? 1 : 0, installments || 1]);
      res.json({ id: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    const userId = getUserId(req);
    try {
      await pool.query("DELETE FROM transactions WHERE id = $1 AND user_id = $2", [req.params.id, userId]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get("/api/stats", async (req, res) => {
    const userId = getUserId(req);
    try {
      const statsResult = await pool.query(`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions 
        WHERE user_id = $1
      `, [userId]);
      
      const stats = statsResult.rows[0];
      
      const monthlyDataResult = await pool.query(`
        SELECT 
          SUBSTR(date, 1, 7) as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions
        WHERE user_id = $1
        GROUP BY month
        ORDER BY month ASC
        LIMIT 12
      `, [userId]);

      res.json({ 
        total_income: parseFloat(stats.total_income || 0), 
        total_expense: parseFloat(stats.total_expense || 0), 
        monthlyData: monthlyDataResult.rows.map(row => ({
          ...row,
          income: parseFloat(row.income),
          expense: parseFloat(row.expense)
        }))
      });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
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
