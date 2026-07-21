// public/js/site-config.js
//
// ============================================================
//   EDIT THIS FILE to update owner & contact info site-wide.
//   Every page reads from here — change it once, it updates
//   everywhere (About page, footers, appointment sidebar, etc).
// ============================================================

const SITE_CONFIG = {
  owner: {
    name: "Dr. Sarah Krupa",
    title: "Founder & Chief Dental Surgeon",
    qualifications: "M.D.S. in Prosthodontics, Fellowship in Aesthetic Dentistry",
    experience: "15+ Years Experience",

    // Replace with a real photo URL, or a local path like "images/owner.jpg"
    photo: "pics/pic1.png",

    // One paragraph per array entry — shown in the About page founder section
    bio: [
      "Dr. Sarah Krupa established this hospital with a resolute vision: to bridge the gap between world-class clinical precision and luxurious patient hospitality. With a Master's degree in Prosthodontics and a fellowship in Aesthetic Dentistry from leading international institutes, she brings over 15 years of exceptional clinical expertise.",
      "She is renowned not just for her meticulous attention to detail in smile makeovers and full-mouth rehabilitations, but for her gentle demeanor that puts even the most anxious patients at immediate ease."
    ]
  },

  contact: {
    phone: "7330710764",
    whatsappnumber: "7330710764",
    email: "krupasdentalclinic@gmail.com",
    address: "Dr.no:24-79-3/5, First floor, Sanath nagar, Near Ambedkar statue, Opp. Ambedkar Colony, Gajuwaka, Vsp-530026",
    addressShort: "Sanath nagar, Gajuwaka", // used in tighter spaces
    hoursWeekday: "Mon - Sat: 9:00 AM - 8:00 PM",
    hoursSunday: "Sunday: By Appointment Only"
  }
};
