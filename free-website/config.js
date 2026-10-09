// ─── Edit this file to change the offer, availability, contact details and testable copy. ───
window.CONFIG = {
  // TEST_MODE: true = nothing is emailed; a banner says so. Set to false before going live.
  TEST_MODE: false,

  // Bookings are saved to the site's own admin dashboard (/api/quote).
  // FORM_EMAIL also gets an email copy via FormSubmit.co on the live domain (skipped on localhost).
  FORM_EMAIL: "meharmalik2026@gmail.com",

  // Availability — real numbers only.
  SPOTS_PER_MONDAY: 2,
  MONTHS_AHEAD: 4,            // customers can book Mondays up to this many months out
  BOOKED: {                   // "YYYY-MM-DD": spots already taken that Monday. Update as bookings come in.
    // "2026-10-19": 1,
  },
  MIN_LEAD_DAYS: 7,           // earliest bookable Monday is at least this many days away

  FREE:  { price: 0,    weeks: "about 1 month", revisions: "3 revisions" },
  FAST:  { price: 1500, weeks: "about 1 week",  revisions: "Unlimited revisions for 30 days" },

  // Stripe Payment Link for the $1,500 fast-track. Leave "" until it exists:
  // the funnel then records the request and says a secure payment link will be sent.
  // In Stripe, set the link's "after payment" redirect to  <your-domain>/growth.html?paid=1
  PAYMENT_LINK: "",
  GROWTH_PRICE_NOTE: "Priced on a quick call. Nothing is charged today.",

  PHONE_DISPLAY: "0493 721 273",
  PHONE_TEL: "+61493721273",
  WHATSAPP: "61493721273",

  // Copy you may want to A/B test. Elements with data-copy="key" get this text.
  COPY: {
    cta: "Get your slot",
    heroLine1: "Built a great business?",
    heroLine2: "Now look like one.",
    fastHook: "Don't want to wait a month?"
  }
};
