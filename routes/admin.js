// routes/admin.js
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // set in .env, see README

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Not authenticated.' });
}

function requireAuthPage(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.redirect('/admin/login.html');
}

// --- Auth ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!ADMIN_PASSWORD_HASH) {
    return res.status(500).json({ error: 'Admin password is not configured on the server (see .env / README).' });
  }
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const validUser = username === ADMIN_USERNAME;
  const validPass = validUser && (await bcrypt.compare(password, ADMIN_PASSWORD_HASH));

  if (!validUser || !validPass) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }

  req.session.isAdmin = true;
  res.json({ success: true });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get('/session', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// --- Protected: serve the dashboard HTML only if logged in ---
router.get('/', requireAuthPage, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'dashboard.html'));
});
router.get('/dashboard.html', requireAuthPage, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'dashboard.html'));
});

// --- Protected: data APIs ---
// GET /admin/api/appointments?date=YYYY-MM-DD&status=confirmed
router.get('/api/appointments', requireAuth, (req, res) => {
  const { date, status } = req.query;

  let query = 'SELECT * FROM appointments WHERE 1=1';
  const params = [];

  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY date ASC, time ASC';

  const rows = db.prepare(query).all(...params);
  res.json({ appointments: rows });
});

// POST /admin/api/appointments/:id/cancel
router.post('/api/appointments/:id/cancel', requireAuth, (req, res) => {
  const { id } = req.params;
  const result = db
    .prepare(`UPDATE appointments SET status = 'cancelled' WHERE id = ? AND status = 'confirmed'`)
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Appointment not found or already cancelled.' });
  }
  res.json({ success: true });
});

module.exports = router;
