// public/js/apply-site-config.js
//
// Reads SITE_CONFIG (from site-config.js) and fills in any matching
// element on the current page. You never need to edit this file —
// just edit site-config.js. Missing elements are silently skipped,
// so it's safe to include this script on every page even if a page
// doesn't have every field (e.g. only about.html has the owner bio).

document.addEventListener('DOMContentLoaded', () => {
  if (typeof SITE_CONFIG === 'undefined') return;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el && value !== undefined) el.textContent = value;
  };
  const setHtml = (id, value) => {
    const el = document.getElementById(id);
    if (el && value !== undefined) el.innerHTML = value;
  };
  const setAttr = (id, attr, value) => {
    const el = document.getElementById(id);
    if (el && value !== undefined) el.setAttribute(attr, value);
  };

  const { owner, contact } = SITE_CONFIG;

  // --- Owner / founder details (about.html) ---
  if (owner) {
    setText('owner-name', owner.name);
    setText('owner-name-2', owner.name); // second spot the name appears (image caption)
    setText('owner-title', owner.title);
    setText('owner-qualifications', owner.qualifications);
    setText('owner-experience', owner.experience);
    setAttr('owner-photo', 'src', owner.photo);
    setAttr('owner-photo', 'alt', owner.name);

    if (Array.isArray(owner.bio)) {
      owner.bio.forEach((paragraph, i) => setText(`owner-bio-${i + 1}`, paragraph));
    }
  }

  // --- Contact details (footers, appointment sidebar, floating buttons) ---
  if (contact) {
    // Every element that shows the phone number (footer, sidebar, etc.)
    document.querySelectorAll('[data-config="contact-phone"]').forEach(el => {
      el.textContent = contact.phone;
    });
    document.querySelectorAll('[data-config="contact-email"]').forEach(el => {
      el.textContent = contact.email;
    });
    document.querySelectorAll('[data-config="contact-address"]').forEach(el => {
      el.textContent = contact.address;
    });
    document.querySelectorAll('[data-config="contact-address-short"]').forEach(el => {
      el.innerHTML = contact.addressShort;
    });
    document.querySelectorAll('[data-config="hours-weekday"]').forEach(el => {
      el.textContent = contact.hoursWeekday;
    });
    document.querySelectorAll('[data-config="hours-sunday"]').forEach(el => {
      el.textContent = contact.hoursSunday;
    });

    // Links (need to set href, not textContent)
    document.querySelectorAll('[data-config-href="tel"]').forEach(el => {
      el.setAttribute('href', contact.phoneHref);
    });
    document.querySelectorAll('[data-config-href="whatsapp"]').forEach(el => {
      el.setAttribute('href', contact.whatsappHref);
    });
  }
});
