const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

// ✅ Use PostgreSQL URI from Supabase (Connection Pooling)
const pool = new Pool({
  connectionString: 'postgresql://postgres.xxotzadlcmmromgruaoi:Vimalboss@45@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Create 'events' table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT
  )
`, (err) => {
  if (err) {
    console.error('❌ Error creating table:', err.message);
  } else {
    console.log('✅ Events table ready.');
  }
});

// 🔹 GET all events
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 POST create new event
app.post('/api/events', async (req, res) => {
  const { title, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO events (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 PUT update event
app.put('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE events SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 DELETE event
app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM events WHERE id = $1', [id]);
    res.json({ message: '✅ Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔸 Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
