// routes/appointments.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const {
  ALL_DAY_SLOTS,
  isDateBookable,
  isDateInFuture,
  isValidSlot,
  formatSlotLabel,
} = require('../slots');

// GET /api/slots?date=YYYY-MM-DD
// Returns every slot for that day, each flagged as available or not,
// so the frontend can grey out/disable already-booked times.
router.get('/slots', (req, res) => {
  const { date } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'A valid date (YYYY-MM-DD) is required.' });
  }
  if (!isDateInFuture(date)) {
    return res.status(400).json({ error: 'Please choose a date from today onward.' });
  }
  if (!isDateBookable(date)) {
    return res.json({ date, bookable: false, message: 'Closed for online booking on Sundays — please call us.', slots: [] });
  }

  const booked = db
    .prepare(`SELECT time FROM appointments WHERE date = ? AND status = 'confirmed'`)
    .all(date)
    .map((r) => r.time);

  const slots = ALL_DAY_SLOTS.map((time) => ({
    time,
    label: formatSlotLabel(time),
    available: !booked.includes(time),
  }));

  res.json({ date, bookable: true, slots });
});

// POST /api/appointments
// Creates a new booking. Rejects if the exact date+time is already taken.
router.post('/', (req, res) => {
  const { name, phone, email, treatment, date, time, notes } = req.body || {};

  // --- Validation ---
  const errors = [];
  if (!name || !name.trim()) errors.push('Full name is required.');
  if (!phone || !phone.trim()) errors.push('Phone number is required.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid email is required.');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('A valid date is required.');
  if (!time || !isValidSlot(time)) errors.push('Please select a valid 30-minute time slot.');
  if (date && !isDateInFuture(date)) errors.push('Please choose a date from today onward.');
  if (date && isDateBookable && !isDateBookable(date)) errors.push('That date is closed for online booking (Sundays are by appointment only — please call us).');

  if (errors.length) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  // --- Double-booking check (application-level, friendly message) ---
  const existing = db
    .prepare(`SELECT id FROM appointments WHERE date = ? AND time = ? AND status = 'confirmed'`)
    .get(date, time);

  if (existing) {
    return res.status(409).json({
      error: 'Sorry, that time slot was just booked by someone else. Please choose another time.',
    });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO appointments (name, phone, email, treatment, date, time, notes)
      VALUES (@name, @phone, @email, @treatment, @date, @time, @notes)
    `);
    const info = stmt.run({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      treatment: treatment || 'Not specified',
      date,
      time,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      id: info.lastInsertRowid,
      message: 'Appointment confirmed!',
    });
  } catch (err) {
    // Race condition safety net: the DB's UNIQUE constraint catches
    // simultaneous requests that slipped past the check above.
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({
        error: 'Sorry, that time slot was just booked by someone else. Please choose another time.',
      });
    }
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
