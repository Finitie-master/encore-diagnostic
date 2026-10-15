import { test } from "node:test";
import assert from "node:assert/strict";
import { economics } from "../public/engine/economics.mjs";
import { modelFit } from "../public/engine/models.mjs";

test("Economics: David B (two days a week, £100k, £750 a day) does not add up", () => {
  const r = economics({ targetIncome: 100000, annualCosts: 10000, price: 750, daysPerSale: 1, daysPerWeek: 2 });
  assert.equal(r.complete, true);
  assert.equal(r.salesNeeded, 147);
  assert.equal(r.status, "does_not_fit");
  assert.ok(r.priceThatFits > 750);
});

test("Economics: a defined £6k project at 6 days, 3 days a week, fits for £60k but is tight for £80k", () => {
  const a = economics({ targetIncome: 60000, annualCosts: 8000, price: 6000, daysPerSale: 6, daysPerWeek: 3 });
  assert.equal(a.salesNeeded, 12);
  assert.equal(a.status, "fits");
  const b = economics({ targetIncome: 80000, annualCosts: 8000, price: 6000, daysPerSale: 6, daysPerWeek: 3 });
  assert.equal(b.status, "tight");
});

test("Economics: incomplete inputs return complete=false", () => {
  assert.equal(economics({ targetIncome: 50000 }).complete, false);
});

test("Models: David E (ex-CEO, avoids day-to-day accountability, wants freedom) points to advisory, not fractional", () => {
  const r = modelFit({
    dims: { E: 92, C: 80, V: 74, P: 70, M: 77, R: 89, RD: 90, F: 31 },
    urgency: "There's no rush",
    prefs: { work_mode: "Advising and guiding decisions", engagement: "Ongoing relationships with a few clients", accountability: "I'd rather avoid it", avoid: ["Managing people", "Being on call"] },
    relationships: "100+",
  });
  assert.equal(r.primary.key, "advisory");
  const frac = r.ranked.find((m) => m.key === "fractional");
  assert.ok(frac.score < r.primary.score);
});

test("Models: David C (urgent income, short runway) puts consulting or a defined service first and products last", () => {
  const r = modelFit({
    dims: { E: 85, C: 58, V: 42, P: 51, M: 32, R: 48, RD: 28, F: 73 },
    urgency: "Within 3 months",
    prefs: { work_mode: "Doing it hands-on myself", engagement: "Defined projects with a start and an end" },
  });
  assert.ok(["consulting", "productised"].includes(r.primary.key));
  assert.equal(r.ranked.at(-1).key, "digital");
  assert.ok(r.primary.reasons.length > 0);
});
