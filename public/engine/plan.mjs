// The Encore Plan: works backwards from an income goal to offers, clients, sales conversations,
// marketing activity and time, then lays it out as a 12-month plan in four 90-day sections.
// Pure functions only (no DOM), so it can be unit tested. Used by /plan.
//
// Every number it produces is a model built from the person's own answers plus the starting
// assumptions below. The starting assumptions are deliberately visible and editable on the page.

export const NAME = "The Encore Plan";
export const WEEKS_PER_MONTH = 52 / 12;          // 4.33
export const HOURS_PER_CONVERSATION = 1.5;       // a sales conversation plus preparation and follow-up
export const RECURRING_TARGET = 0.3;             // flag when less than 30% of income at full pace repeats
export const ONE_CLIENT_LIMIT = 0.5;             // flag when one client would be more than half of monthly income

export const TIERS = [
  { id: "min", label: "Minimum", long: "the minimum you need" },
  { id: "happy", label: "Happy", long: "the income you'd be happy with" },
  { id: "stretch", label: "Stretch", long: "your stretch figure" },
];

export const OFFER_TYPES = {
  oneoff:   { label: "One-off project or package", price: "Price per project (£)", days: "Your days to deliver one", sells: true },
  retainer: { label: "Monthly retainer or fractional role", price: "Fee per month (£)", days: "Your days per client each month", sells: true },
  group:    { label: "Group programme or workshop (per place)", price: "Price per place (£)", days: "Your days per place (e.g. 0.5)", sells: true },
  product:  { label: "Digital product or course", price: "Price per sale (£)", days: "Your days per sale (often 0)", sells: false },
};

// Starting assumptions for "how many of these does it take to get one sales conversation".
// They're placeholders for people with no history yet: the page asks them to replace each one
// with their own experience as soon as they have it.
export const CHANNELS = [
  { id: "warm",      label: "Warm outreach to people who know your work", unit: "personal messages", perConv: 5 },
  { id: "referrals", label: "Referrals and referral partners",            unit: "catch-ups with referrers", perConv: 3 },
  { id: "linkedin",  label: "LinkedIn posts and comments",                unit: "posts", perConv: 4 },
  { id: "speaking",  label: "Talks, webinars and podcasts",               unit: "appearances", perConv: 0.5 },
  { id: "events",    label: "Networking events",                          unit: "events", perConv: 1 },
  { id: "other",     label: "Something else",                             unit: "actions", perConv: 2 },
];

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const num = (v, d = 0) => { const n = typeof v === "string" ? parseFloat(v.replace(/[£,\s]/g, "")) : Number(v); return Number.isFinite(n) ? n : d; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function defaults(today = new Date()) {
  const start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return {
    name: "", goalMin: "", goalHappy: "", goalStretch: "", tier: "happy",
    targetMonth: 9, start: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
    otherIncome: 0, costs: 0,
    daysPerWeek: 4, weeksPerYear: 44, adminDays: 0.5, fixed: "",
    offers: [{ name: "", type: "oneoff", price: "", days: "", stay: 6, share: 100 }],
    securedMonthly: 0, securedMonths: 0, network: "", advisees: "", audience: "", partners: "",
    cycleWeeks: 4, propRate: 5, winRate: 4, comfort: 3,
    marketingHours: 6, budget: 0,
    channels: { warm: { on: true, share: 60, perConv: 5 }, referrals: { on: true, share: 40, perConv: 3 } },
    quiet: [], wontDo: "",
  };
}

// What still needs answering before a plan can be built ("" when fine).
export function missing(A) {
  const out = [];
  if (num(A.goalHappy) <= 0) out.push({ step: 0, text: "the income you'd be happy with" });
  if (num(A.daysPerWeek) <= 0 || num(A.weeksPerYear) <= 0) out.push({ step: 1, text: "the days and weeks you want to work" });
  const offers = (A.offers || []).filter(o => num(o.price) > 0);
  if (!offers.length) out.push({ step: 2, text: "at least one offer with a price" });
  if (num(A.propRate) <= 0 || num(A.winRate) <= 0) out.push({ step: 4, text: "how often conversations turn into clients" });
  return out;
}

function normaliseShares(list, key = "share") {
  const total = list.reduce((s, x) => s + Math.max(0, num(x[key])), 0);
  return list.map(x => total > 0 ? Math.max(0, num(x[key])) / total : 1 / list.length);
}

function monthLabels(start, n) {
  const [y, m] = String(start || "").split("-").map(Number);
  const y0 = Number.isFinite(y) ? y : new Date().getFullYear(), m0 = Number.isFinite(m) ? m - 1 : new Date().getMonth();
  return Array.from({ length: n }, (_, i) => { const k = m0 + i; return { label: `${MONTHS[k % 12]} ${y0 + Math.floor(k / 12)}`, month: k % 12 }; });
}

// The core model for one income tier.
export function plan(A, tierId = A.tier || "happy") {
  const goal = { min: num(A.goalMin), happy: num(A.goalHappy), stretch: num(A.goalStretch) };
  if (!goal.min) goal.min = goal.happy; if (!goal.stretch) goal.stretch = goal.happy;
  const costsYear = num(A.costs) * 12, other = num(A.otherIncome);
  const need = t => Math.max(0, goal[t] - other + costsYear);       // revenue needed a year at full pace
  const annual = need(tierId), R = annual / 12;                      // monthly revenue at full pace

  const lag = Math.max(0, Math.round(num(A.cycleWeeks) / WEEKS_PER_MONTH));
  const T = clamp(Math.round(num(A.targetMonth, 9)), lag + 1, 12);
  const H = 12 + lag + 1;                                            // months modelled (sales started now pay later)
  const ramp = m => m <= lag ? 0 : Math.min(1, (m - lag) / Math.max(1, T - lag));
  const secured = m => m <= num(A.securedMonths) ? num(A.securedMonthly) : 0;

  const offers = (A.offers || []).filter(o => num(o.price) > 0).map(o => ({ ...o, type: OFFER_TYPES[o.type] ? o.type : "oneoff", price: num(o.price), days: Math.max(0, num(o.days)), stay: Math.max(1, num(o.stay, 6)) }));
  const shares = normaliseShares(offers);
  offers.forEach((o, i) => o.weight = shares[i]);

  const close = clamp(num(A.propRate) / 10, 0, 1) * clamp(num(A.winRate) / 10, 0, 1);
  const deliveryAvail = Math.max(0, num(A.daysPerWeek) - num(A.adminDays) - num(A.marketingHours) / 7) * num(A.weeksPerYear) / 12;
  const quiet = new Set((A.quiet || []).map(Number));
  const labels = monthLabels(A.start, H);

  const months = [], active = offers.map(() => 0);
  for (let m = 1; m <= H; m++) {
    const sec = secured(m);
    const total = Math.max(R * ramp(m), sec);
    const fresh = Math.max(0, total - sec);
    const row = { m, label: labels[m - 1].label, calMonth: labels[m - 1].month, quiet: quiet.has(labels[m - 1].month), revenue: total, secured: sec, fresh, byOffer: [], newClients: 0, salesClients: 0, days: 0 };
    offers.forEach((o, i) => {
      const r = fresh * o.weight;
      let clients, newOnes, days;
      if (o.type === "retainer") {
        clients = r / o.price;                                     // active retainer clients needed
        newOnes = Math.max(0, clients - active[i] + active[i] / o.stay);
        active[i] = clients; days = clients * o.days;
      } else {
        clients = newOnes = r / o.price; days = newOnes * o.days;
      }
      row.byOffer.push({ revenue: r, clients, newClients: newOnes, days });
      row.newClients += newOnes; row.days += days;
      if (OFFER_TYPES[o.type].sells) row.salesClients += newOnes;
    });
    months.push(row);
  }
  // A client won in month m needs a conversation `lag` months earlier.
  months.forEach((row, k) => {
    const later = months[k + lag];
    row.conversations = close > 0 && later ? later.salesClients / close : 0;
  });
  const year = months.slice(0, 12);

  // Channels: share of conversations and activity needed per week.
  const chosen = CHANNELS.filter(c => A.channels && A.channels[c.id] && A.channels[c.id].on)
    .map(c => ({ ...c, share: num(A.channels[c.id].share), perConv: num(A.channels[c.id].perConv, c.perConv), unit: (A.channels[c.id].unit || c.unit) }));
  const cShares = normaliseShares(chosen);
  const channels = chosen.map((c, i) => ({ ...c, weight: cShares[i] }));
  const activityFor = conv => channels.map(c => ({ id: c.id, label: c.label, unit: c.unit, perWeek: conv * c.weight * c.perConv / WEEKS_PER_MONTH }));

  // Full-pace picture (the first month at 100% of the target, or month 12).
  const full = year.find(r => r.m >= T) || year[11];
  const fullConv = full.conversations;
  const recurring = offers.reduce((s, o, i) => s + (o.type === "retainer" ? full.byOffer[i].revenue : 0), 0);
  const effRateNeeded = deliveryAvail > 0 ? R / deliveryAvail : Infinity;
  const offerRate = offers.reduce((s, o) => s + (o.days > 0 ? o.weight * o.price / o.days : 0), 0) / Math.max(1e-9, offers.reduce((s, o) => s + (o.days > 0 ? o.weight : 0), 0));

  // Quarters.
  const quarters = [0, 1, 2, 3].map(q => {
    const rows = year.slice(q * 3, q * 3 + 3);
    const conv = rows.reduce((s, r) => s + r.conversations, 0);
    return {
      q: q + 1, from: rows[0].label, to: rows[2].label,
      revenue: rows.reduce((s, r) => s + r.revenue, 0),
      secured: rows.reduce((s, r) => s + r.secured, 0),
      byOffer: offers.map((o, i) => ({ name: o.name || `Offer ${i + 1}`, type: o.type, newClients: rows.reduce((s, r) => s + r.byOffer[i].newClients, 0), activeEnd: o.type === "retainer" ? rows[2].byOffer[i].clients : null })),
      newClients: rows.reduce((s, r) => s + r.newClients, 0),
      conversations: conv,
      convPerWeek: conv / (3 * WEEKS_PER_MONTH),
      activity: activityFor(conv / 3),
      daysPerMonth: rows.reduce((s, r) => s + r.days, 0) / 3,
      quietMonths: rows.filter(r => r.quiet).map(r => r.label),
      endPace: rows[2].revenue,
    };
  });

  const flags = [];
  const over = year.filter(r => r.days > deliveryAvail + 0.05);
  if (over.length) flags.push({ id: "capacity", level: "serious", title: "Your goal needs more days than you've got",
    text: `At full pace the plan needs about ${round1(full.days)} delivery days a month, and you have about ${round1(deliveryAvail)}. To fit it in your week, your work needs to earn about ${gbp(effRateNeeded)} for every delivery day; your offers currently average ${Number.isFinite(offerRate) && offerRate > 0 ? gbp(offerRate) : "less"}. Raise prices, add a group or product offer, or reduce the days each client takes.` });
  const convHours = fullConv / WEEKS_PER_MONTH * HOURS_PER_CONVERSATION;
  if (convHours > num(A.marketingHours) && fullConv > 0) flags.push({ id: "selling-time", level: "warning", title: "Selling needs more hours than you've set aside",
    text: `At full pace you need about ${round1(fullConv / WEEKS_PER_MONTH)} sales conversations a week. Allowing about ${HOURS_PER_CONVERSATION} hours each with preparation and follow-up, that's around ${Math.ceil(convHours)} hours a week, more than the ${num(A.marketingHours)} you've set aside. Improve how many conversations turn into clients, raise your price, or find more time.` });
  const bigClient = offers.find(o => o.type === "retainer" && R > 0 && o.price > ONE_CLIENT_LIMIT * R);
  if (bigClient) flags.push({ id: "one-client", level: "warning", title: "One client would be more than half your income",
    text: `A single "${bigClient.name || "retainer"}" client at ${gbp(bigClient.price)} a month is over half of the ${gbp(R)} a month you need. If they leave, half your income goes with them. Plan for at least one more client than the numbers say.` });
  const lumpy = offers.find(o => o.type === "oneoff" && R > 0 && o.price > R) ;
  if (lumpy && R > 0) flags.push({ id: "lumpy", level: "info", title: "Expect income to arrive in lumps",
    text: `One "${lumpy.name || "project"}" at ${gbp(lumpy.price)} is more than a month's target, so some months will be big and some empty. The plan smooths this out; your bank balance won't. Keep a buffer, or ask for staged payments.` });
  if (R > 0 && recurring / R < RECURRING_TARGET) flags.push({ id: "recurring", level: "info", title: "Not much of your income repeats",
    text: `At full pace about ${Math.round(100 * recurring / R)}% of your income comes from clients who pay every month. Repeat income makes a year far calmer, because you don't start every month from zero. Consider a retainer or membership version of what you do.` });
  const floor = need("min") / 12;
  const coverMonth = year.find(r => r.revenue >= floor - 0.5);
  if (floor > 0 && !coverMonth) flags.push({ id: "floor", level: "serious", title: "This plan doesn't reach your minimum within 12 months",
    text: `You need about ${gbp(floor)} a month for your minimum, and this plan gets to ${gbp(year[11].revenue)} by month 12. Bring your target month forward, start selling sooner, or look at whether your costs or minimum can change.` });
  if (lag >= 2) flags.push({ id: "lag", level: "info", title: "Your sales take a while to land",
    text: `With a sales cycle of about ${num(A.cycleWeeks)} weeks, conversations you have this month turn into income around ${lag} months later. That's why the plan starts conversations before it shows any new income.` });
  if (close > 0 && close < 0.15) flags.push({ id: "close", level: "info", title: "The plan leans on a lot of conversations",
    text: `About ${Math.round(close * 100)} in 100 conversations become clients on your figures. Small improvements here (a sharper offer, better-matched conversations) cut the workload more than anything else.` });
  if (!channels.length) flags.push({ id: "channels", level: "warning", title: "No route to clients chosen yet", text: "Choose at least one way you'll find clients, so the plan can turn conversations into weekly activity." });

  return {
    tier: tierId, annual, R, lag, T, close, deliveryAvail, effRateNeeded, offerRate, recurring,
    floorMonth: coverMonth ? coverMonth.m : null, floor,
    yearRevenue: year.reduce((s, r) => s + r.revenue, 0),
    yearClients: year.reduce((s, r) => s + r.newClients, 0),
    yearConversations: year.reduce((s, r) => s + r.conversations, 0),
    full: { revenue: full.revenue, conversations: fullConv, convPerWeek: fullConv / WEEKS_PER_MONTH, days: full.days, activity: activityFor(fullConv), month: full.m },
    offers: offers.map((o, i) => ({ name: o.name || `Offer ${i + 1}`, type: o.type, price: o.price, days: o.days, weight: o.weight, yearNew: year.reduce((s, r) => s + r.byOffer[i].newClients, 0), activeFull: o.type === "retainer" ? full.byOffer[i].clients : null })),
    channels, months: year, quarters, flags,
    focus: focusFor(quarters, flags, lag),
  };
}

export function focusFor(quarters, flags, lag) {
  const has = id => flags.some(f => f.id === id);
  return [
    { title: "Test and win your first clients", text: lag >= 1 ? "Most of your new income in this quarter comes from conversations you start straight away. Get them in the diary in week one." : "Talk to people who match your buyer, test your price out loud, and win the first clients who prove the offer works." },
    { title: "Make the offer and the pipeline steady", text: "Turn what worked in the first quarter into a repeatable offer and a weekly rhythm of conversations, so new clients stop depending on luck." },
    has("recurring") ? { title: "Add repeat income", text: "Introduce a retainer, membership or ongoing version of your offer, so the last quarter starts with income already in place." }
                     : { title: "Protect your time", text: "Keep the weekly rhythm going, and use your waiting list or busiest weeks as the evidence to raise your prices." },
    has("capacity") ? { title: "Raise prices or productise before adding clients", text: "Your goal doesn't fit your week at today's prices. Put prices up for new clients, or package your know-how so it earns without your days." }
                    : { title: "Grow, or raise prices", text: "Decide whether next year is about more clients, higher prices or more time off, and set the next 90 days against it." },
  ];
}

export function compareTiers(A) {
  return TIERS.map(t => { const p = plan(A, t.id); return { ...t, annual: p.annual, R: p.R, yearClients: p.yearClients, convPerWeek: p.full.convPerWeek, days: p.full.days, fits: !p.flags.some(f => f.id === "capacity"), floorMonth: p.floorMonth }; });
}

export function gbp(n) { if (!Number.isFinite(n)) return "–"; return "£" + Math.round(n).toLocaleString("en-GB"); }
export function round1(n) { return Number.isFinite(n) ? (Math.round(n * 10) / 10).toLocaleString("en-GB") : "–"; }
export function whole(n) { return Number.isFinite(n) ? Math.max(0, Math.ceil(n - 1e-9)).toLocaleString("en-GB") : "–"; }

// A worked example for the page's "see a sample" button and for tests.
export const SAMPLE = {
  name: "David", goalMin: 40000, goalHappy: 70000, goalStretch: 100000, tier: "happy",
  targetMonth: 9, start: "2026-12", otherIncome: 0, costs: 400,
  daysPerWeek: 4, weeksPerYear: 44, adminDays: 0.5, fixed: "Fridays with my grandson",
  offers: [
    { name: "Operations review", type: "oneoff", price: 4500, days: 5, stay: 6, share: 40 },
    { name: "Fractional ops director", type: "retainer", price: 3000, days: 2, stay: 8, share: 50 },
    { name: "Leadership workshop place", type: "group", price: 450, days: 0.25, stay: 6, share: 10 },
  ],
  securedMonthly: 1500, securedMonths: 3, network: 120, advisees: 8, audience: 2400, partners: 2,
  cycleWeeks: 6, propRate: 5, winRate: 5, comfort: 3, marketingHours: 6, budget: 50,
  channels: { warm: { on: true, share: 50, perConv: 5 }, referrals: { on: true, share: 30, perConv: 3 }, linkedin: { on: true, share: 20, perConv: 4 } },
  quiet: [7], wontDo: "Anything that needs me in London every week",
};
