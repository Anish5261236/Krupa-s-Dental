# Krupa's Dental Hospital — Website + Appointment Backend

A Node.js/Express backend for the dental hospital site, with:
- A real appointment booking API (30-minute slots, Mon–Sat 9 AM–8 PM)
- **No two people can ever book the same date + time** (enforced twice: once in
  application logic for a friendly error message, and once at the database
  level with a `UNIQUE` constraint as a hard safety net against race conditions)
- A password-protected admin dashboard showing every booking — who, and at
  what date/time — with the ability to cancel a booking (which frees the slot)

## 1. Install

```bash
npm install
```

## 2. Configure your admin password

A demo password is already set for you to try immediately:
- Username: `admin`
- Password: `admin123`

**Before putting this online, change it.** Generate a new hash:

```bash
npm run hash-password -- "yourNewStrongPassword"
```

Copy the printed line into `.env`, replacing the existing `ADMIN_PASSWORD_HASH`.
Also change `SESSION_SECRET` in `.env` to any long random string.

## 3. Run it

```bash
npm start
```

Then open:
- **Website:** http://localhost:3000
- **Book an appointment:** http://localhost:3000/appointment.html
- **Admin login:** http://localhost:3000/admin/login.html

The database is a single file at `data/dental.db` (SQLite), created
automatically on first run. No separate database server needed.

## How the "no double booking" rule works

1. When a patient picks a date on the booking form, the browser calls
   `GET /api/appointments/slots?date=YYYY-MM-DD`, which returns every
   30-minute slot for that day marked available or already booked.
   Booked slots show as disabled in the dropdown.
2. On submit, the browser calls `POST /api/appointments`. The server
   re-checks that exact date+time isn't already taken (someone else could
   have booked in the few seconds since the page loaded) and rejects with
   a clear message if so.
3. As a final safety net, the `appointments` table itself has a
   `UNIQUE(date, time, status)` constraint, so even simultaneous requests
   at the exact same instant can't both succeed.

## What the admin sees

Log in at `/admin/login.html` to reach the dashboard, which shows:
- Every appointment: **patient name, phone, email, treatment, date, and time**
- Quick stats: total confirmed, today's appointments, upcoming
- Filters by date and status
- A **Cancel** button per booking (frees that time slot back up for others)
- Auto-refreshes every 30 seconds

## Editing owner & contact details (do this once, applies everywhere)

Open **`public/js/site-config.js`** — every owner and contact detail on the
whole site lives in this one file:

- `owner.name`, `owner.title`, `owner.qualifications`, `owner.experience`,
  `owner.photo`, `owner.bio` (array of paragraphs) → shown on the About page
- `contact.phone`, `contact.email`, `contact.address`, `contact.hoursWeekday`,
  `contact.hoursSunday`, WhatsApp/tel links → shown in every page's footer
  and the appointment page's sidebar

Change a value in that file, save, and it updates on every page next time
it's loaded — no need to hunt through 4 HTML files. `public/js/apply-site-config.js`
is the small script that reads the config and fills it in; you shouldn't need
to touch that file.

## Project structure

```
server.js              Express app entrypoint
db.js                   SQLite setup (creates data/dental.db, the appointments table)
slots.js                Clinic hours + 30-min slot generation logic
routes/appointments.js  Public API: check slots, create a booking
routes/admin.js         Admin login/logout + protected booking list/cancel APIs
public/                 Your website (static files, served as-is)
  js/site-config.js        ← EDIT THIS to update owner/contact info everywhere
  js/apply-site-config.js  Applies site-config.js to the page (don't need to edit)
  admin/login.html      Admin login page
  admin/dashboard.html  Admin dashboard
scripts/hash-password.js  Helper to generate a new admin password hash
.env                    Config: PORT, admin credentials, session secret
```

## Deploying

This runs anywhere Node.js runs (a VPS, Render, Railway, a subdomain with
Node support, etc.). Since it uses SQLite (a plain file), there's no separate
database to provision — just make sure the `data/` folder is on persistent
storage (not wiped on every deploy) so bookings aren't lost.

Set the same environment variables from `.env` in your host's dashboard
(`PORT` is usually assigned automatically by the host).

## Fixes made to the original front-end files

- Removed nav/footer links to `doctor.html` and `gallery.html`, which
  didn't exist in the project and were dead links.
- Fixed `.glass` navbar style in `index.html` — it was a fully opaque pale
  yellow instead of a translucent glass effect.
- Fixed the scrollbar track color in `index.html` (was a clashing bright
  lime green, now a neutral tone matching the navy/gold theme).
- Replaced the vague "Morning / Afternoon / Evening" time picker with real,
  live 30-minute time slots that grey out once booked.
- The booking form now actually saves to a database instead of just
  showing a fake success message.
