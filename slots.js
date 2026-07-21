// slots.js
// Single source of truth for what counts as a valid, bookable time slot.
// Clinic hours (from the site footer): Mon-Sat 9:00 AM - 8:00 PM.
// Sunday is "by appointment only" so it's excluded from online self-booking.

const OPEN_HOUR = 9;   // 9:00 AM
const CLOSE_HOUR = 20; // 8:00 PM (last slot must END by this time)
const SLOT_MINUTES = 30;

function pad(n) {
  return String(n).padStart(2, '0');
}

// Returns ["09:00","09:30",...,"19:30"]
function generateDaySlots() {
  const slots = [];
  let totalMinutes = OPEN_HOUR * 60;
  const closeMinutes = CLOSE_HOUR * 60;
  while (totalMinutes + SLOT_MINUTES <= closeMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    slots.push(`${pad(h)}:${pad(m)}`);
    totalMinutes += SLOT_MINUTES;
  }
  return slots;
}

const ALL_DAY_SLOTS = generateDaySlots();

// date is 'YYYY-MM-DD'. Returns true if that weekday is open for
// online booking (Mon-Sat). Sunday (getDay() === 0) is closed online.
function isDateBookable(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return false;
  const day = d.getDay(); // 0 = Sunday
  return day !== 0;
}

// Don't allow booking a date in the past.
function isDateInFuture(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() >= today.getTime();
}

function isValidSlot(timeStr) {
  return ALL_DAY_SLOTS.includes(timeStr);
}

function formatSlotLabel(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${pad(m)} ${period}`;
}

module.exports = {
  ALL_DAY_SLOTS,
  isDateBookable,
  isDateInFuture,
  isValidSlot,
  formatSlotLabel,
};
