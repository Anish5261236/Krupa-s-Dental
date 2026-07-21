// server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const appointmentsRouter = require('./routes/appointments');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-this-secret-in-.env',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 4, // 4 hour admin session
      httpOnly: true,
    },
  })
);

// Public site (index.html, appointment.html, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/appointments', appointmentsRouter);
app.use('/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`Krupa's Dental server running at http://localhost:${PORT}`);
});
