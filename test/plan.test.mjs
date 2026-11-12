import { test } from "node:test";
import assert from "node:assert/strict";
import { plan, compareTiers, missing, defaults, SAMPLE, WEEKS_PER_MONTH } from "../public/engine/plan.mjs";

const close = (a, b, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test("worked example: revenue needed, ramp and secured income", () => {
  const p = plan(SAMPLE, "happy");
  close(p.R, (70000 + 400 * 12) / 12);              // £6,233.33 a month at full pace
  assert.equal(p.lag, 1);                            // 6-week cycle ≈ 1 month
  assert.equal(p.T, 9);
  close(p.months[0].revenue, 1500);                  // month 1: only the secured work
  close(p.months[8].revenue, p.R);                   // full pace by month 9
  close(p.months[11].revenue, p.R);
  assert.ok(p.months[4].revenue < p.R && p.months[4].revenue > p.months[3].revenue, "ramps up");
});

test("worked example: offers, clients and days add up", () => {
  const p = plan(SAMPLE, "happy");
  const m = p.months[10];                            // full pace, no secured income
  const sum = m.byOffer.reduce((s, o) => s + o.revenue, 0);
  close(sum, m.fresh);
  close(m.byOffer[0].clients, p.R * 0.4 / 4500);     // one-off projects in the month
  close(m.byOffer[1].clients, p.R * 0.5 / 3000);     // active retainer clients
  close(m.days, m.byOffer[0].clients * 5 + m.byOffer[1].clients * 2 + m.byOffer[2].clients * 0.25);
  close(p.deliveryAvail, (4 - 0.5 - 6 / 7) * 44 / 12);
  assert.ok(!p.flags.some(f => f.id === "capacity"), "sample fits the week");
});

test("conversations lead clients by the sales cycle", () => {
  const p = plan(SAMPLE, "happy");
  const closeRate = 0.5 * 0.5;
  close(p.months[2].conversations, p.months[3].salesClients / closeRate);
  close(p.close, closeRate);
  close(p.full.convPerWeek, p.full.conversations / WEEKS_PER_MONTH);
});

test("retainers count new sign-ups including replacing leavers", () => {
  const A = { ...SAMPLE, offers: [{ name: "Retainer", type: "retainer", price: 2000, days: 1, stay: 4, share: 100 }], securedMonths: 0, cycleWeeks: 0, targetMonth: 1 };
  const p = plan(A, "happy");
  const active = p.R / 2000;
  close(p.months[0].byOffer[0].newClients, active);              // all new in month 1
  close(p.months[1].byOffer[0].newClients, active / 4);          // then replace a quarter each month
});

test("quarters add up to the year", () => {
  const p = plan(SAMPLE, "happy");
  close(p.quarters.reduce((s, q) => s + q.revenue, 0), p.yearRevenue);
  close(p.quarters.reduce((s, q) => s + q.conversations, 0), p.yearConversations);
  assert.equal(p.quarters.length, 4);
  assert.deepEqual(p.quarters[2].quietMonths, ["Aug 2027"]);
});

test("flags: capacity, one big client and an unreachable minimum", () => {
  const tight = { ...SAMPLE, daysPerWeek: 2, offers: [{ name: "Days", type: "oneoff", price: 600, days: 1, share: 100 }] };
  assert.ok(plan(tight).flags.some(f => f.id === "capacity"));
  const big = { ...SAMPLE, offers: [{ name: "Big retainer", type: "retainer", price: 5000, days: 4, stay: 12, share: 100 }] };
  assert.ok(plan(big).flags.some(f => f.id === "one-client"));
  const late = { ...SAMPLE, goalMin: 200000, cycleWeeks: 30, targetMonth: 12 };
  assert.ok(plan(late, "happy").flags.some(f => f.id === "floor"));
});

test("tiers scale and the minimum defaults to the happy figure", () => {
  const t = compareTiers(SAMPLE);
  assert.ok(t[0].R < t[1].R && t[1].R < t[2].R);
  const A = { ...SAMPLE, goalMin: "", goalStretch: "" };
  close(plan(A, "min").R, plan(A, "happy").R);
});

test("missing answers are reported; defaults are a valid starting point", () => {
  assert.equal(missing(SAMPLE).length, 0);
  const d = defaults(new Date(2026, 10, 12));
  assert.equal(d.start, "2026-12");
  assert.ok(missing(d).some(x => x.step === 0));
  assert.ok(missing(d).some(x => x.step === 2));
  assert.doesNotThrow(() => plan({ ...d, goalHappy: 50000, offers: [{ type: "oneoff", price: 2000, days: 2, share: 100 }] }));
});

test("no offers or zero rates don't crash", () => {
  assert.doesNotThrow(() => plan({ ...SAMPLE, offers: [] }));
  assert.doesNotThrow(() => plan({ ...SAMPLE, propRate: 0 }));
});
