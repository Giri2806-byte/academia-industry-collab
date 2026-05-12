// Lightweight proxy server for OpenAI requests
// Usage: set OPENAI_API_KEY in environment, then `npm start`

const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET || 'dev-secret', resave: false, saveUninitialized: false }));

const PORT = process.env.PORT || 3000;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set. Proxy AI endpoint will return 400 for AI requests.');
}

// In-memory user store for demo (replace with DB in production)
const users = {}; // { username: { passwordHash, created } }

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });
  if (users[username]) return res.status(409).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  users[username] = { passwordHash: hash, created: Date.now() };
  req.session.user = username;
  res.json({ ok: true, user: username });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });
  const u = users[username];
  if (!u) return res.status(404).json({ error: 'User not found' });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid password' });
  req.session.user = username;
  res.json({ ok: true, user: username });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/session', (req, res) => {
  res.json({ user: req.session.user || null });
});

// AI proxy endpoint
app.post('/api/ai', async (req, res) => {
  if (!OPENAI_KEY) return res.status(400).json({ error: 'OPENAI_API_KEY not configured on server' });
  try {
    const payload = req.body;
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error('Proxy error', err);
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
