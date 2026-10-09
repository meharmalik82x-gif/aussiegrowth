// Returning from Stripe: mark it (a receipt comes from Stripe; we never claim payment ourselves).
  if (new URLSearchParams(location.search).has("paid")) { const s = Funnel.get(); if (s.reserved) Funnel.set({ offer: "fast", paid: true }); }
  Funnel.guard("growth");
