import { test } from "node:test";
import assert from "node:assert/strict";
import { Q, DIMS, PROFILES, ROUTES, SAMPLES, SAMPLE_EXPECT, score, outcome, profile, band } from "../public/engine/mettle.mjs";

test("every sample persona lands on its expected profile", () => {
  for (const [k, s] of Object.entries(SAMPLES)) {
    const o = outcome({ stage: s.stage, ...s.a });
    assert.equal(o.pk, SAMPLE_EXPECT[k], `David ${k} got ${o.pk} (scores ${JSON.stringify(o.d)}, overall ${o.overall})`);
  }
});

test("all answers at the top score 95+ and land as a Natural Soloist", () => {
  const ans = {};
  for (const q of Q) {
    if (q.type === "rate") ans[q.id] = q.rev ? 0 : 4;
    else if (q.id !== "stage") ans[q.id] = 0;
  }
  const o = outcome(ans);
  assert.ok(o.overall >= 95, String(o.overall));
  assert.equal(o.pk, "natural");
  assert.equal(o.band, "Built for it");
});

test("all answers at the bottom score 0 and land as Not This Route, Yet", () => {
  const ans = {};
  for (const q of Q) {
    if (q.type === "rate") ans[q.id] = q.rev ? 4 : 0;
    else if (q.id !== "stage") ans[q.id] = 3;
  }
  const o = outcome(ans);
  assert.equal(o.overall, 0);
  assert.equal(o.pk, "notyet");
});

test("reverse-scored items count against the dimension", () => {
  const base = { s1: 4, s2: 0 }, flipped = { s1: 4, s2: 4 };
  assert.ok(score(base).d.SD > score(flipped).d.SD);
});

test("contradictory pairs raise a flag", () => {
  const o = outcome({ s1: 4, s2: 4 });
  assert.ok(o.flags.some((f) => f.includes("slow Tuesday")));
});

test("route preference moves the route ranking", () => {
  const s = SAMPLES.B.a;
  const solo = score({ ...s, sc3: 0 }).routes[0].key;
  const partner = score({ ...s, sc3: 2, sc5: 4 }).routes.findIndex((r) => r.key === "partner");
  assert.equal(solo, "solo");
  assert.ok(partner <= 1);
});

test("every profile, dimension and route has copy", () => {
  for (const P of Object.values(PROFILES)) { assert.equal(P.text.length, 3); assert.ok(P.action); }
  for (const D of Object.values(DIMS)) { assert.ok(D.strong && D.weak); }
  for (const R of Object.values(ROUTES)) { assert.ok(R.what && R.test); }
});

test("strongest and constraint always differ", () => {
  for (const s of Object.values(SAMPLES)) {
    const o = outcome(s.a);
    assert.notEqual(o.strongest, o.constraint);
  }
});

test("no em dashes in any copy", () => {
  const all = JSON.stringify({ Q, DIMS, PROFILES, ROUTES });
  assert.ok(!all.includes("—"), "found an em dash");
});

test("bands cover 0 to 100", () => {
  for (let n = 0; n <= 100; n++) assert.ok(band(n));
});
