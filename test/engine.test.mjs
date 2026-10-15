import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate, dimensionScores } from "../public/engine/scoring.mjs";
import { QUESTIONS } from "../public/engine/questions.mjs";

// Calibration personas from the harness (dimension-level targets).
const P = (E, C, V, Pp, M, R, RD, F) => ({ E, C, V, P: Pp, M, R, RD, F });
const PERSONAS = [
  { name: "David A — Unproven Expert", d: P(88, 61, 31, 78, 62, 81, 72, 80), urgency: "6–12 months", overall: 65.6, verdict: "VALIDATE_FIRST", patterns: ["X01", "X05", "X10"] },
  { name: "David B — Economic Mismatch", d: P(82, 74, 68, 70, 38, 71, 85, 77), urgency: "12+ months", overall: 68.6, verdict: "REWORK_THE_MODEL", patterns: ["X08"] },
  { name: "David C — Revenue Under Pressure", d: P(85, 58, 42, 51, 32, 48, 28, 73), urgency: "<3 months", overall: 50.6, verdict: "REVENUE_FIRST", gates: ["G2", "G3", "G4"], patterns: ["X07"] },
  { name: "David D — Demand Without Distribution", d: P(76, 83, 81, 72, 75, 34, 69, 78), urgency: "6–12 months", overall: 71.8, verdict: "READY_TO_IMPLEMENT", patterns: ["X03", "X09", "X11"] },
  { name: "David E — Wrong Next Chapter", d: P(92, 80, 74, 70, 77, 89, 90, 31), urgency: "No urgency", overall: 77.9, verdict: "PAUSE_AND_RETHINK", gates: ["G5"], patterns: ["X06"] },
  { name: "Edge A — high average, weak evidence", d: P(90, 72, 30, 85, 75, 80, 75, 80), urgency: "6–12 months", overall: 70.5, verdict: "VALIDATE_FIRST", gates: ["G2"] }, // Calibration sheet shows 73.1, but the stated weights give 70.5
  { name: "Edge B — balanced but not exceptional", d: P(68, 68, 68, 68, 68, 68, 68, 68), urgency: "6–12 months", overall: 68, verdict: "READY_BUT_NARROW" },
];

for (const p of PERSONAS) {
  test(p.name, () => {
    const r = evaluate({ dimensions: p.d, urgency: p.urgency });
    assert.equal(r.overall, p.overall, "weighted overall matches calibration sheet");
    assert.equal(r.verdict.code, p.verdict);
    for (const g of p.gates || []) assert.ok(r.gates.includes(g), `gate ${g} should trigger`);
    for (const x of p.patterns || []) assert.ok(r.patterns.includes(x), `pattern ${x} should trigger`);
  });
}

test("Success criterion: similar overall scores, different verdicts", () => {
  const a = evaluate({ dimensions: PERSONAS[0].d, urgency: "6–12 months" }); // 65.6
  const b = evaluate({ dimensions: PERSONAS[1].d, urgency: "12+ months" });  // 68.6
  const e = evaluate({ dimensions: PERSONAS[6].d, urgency: "6–12 months" }); // 68.0
  assert.ok(Math.abs(b.overall - e.overall) < 1);
  assert.notEqual(b.verdict.code, e.verdict.code);
  assert.notEqual(a.verdict.code, e.verdict.code);
});

test("Urgency only changes the verdict when readiness is low", () => {
  const d = PERSONAS[2].d;
  assert.equal(evaluate({ dimensions: d, urgency: "<3 months" }).verdict.code, "REVENUE_FIRST");
  assert.equal(evaluate({ dimensions: d, urgency: "12+ months" }).verdict.code, "VALIDATE_FIRST");
});

test("Question bank matches the harness: 43 scored items, 3 reverse-scored", () => {
  assert.equal(QUESTIONS.length, 43);
  assert.deepEqual(QUESTIONS.filter((q) => q.reverse).map((q) => q.code), ["C6", "D7", "H5"]);
});

test("Reverse scoring: agreeing with a red-flag statement lowers the score", () => {
  const base = Object.fromEntries(QUESTIONS.map((q) => [q.code, 4]));
  const s1 = dimensionScores({ ...base, C6: 0 });
  const s2 = dimensionScores({ ...base, C6: 4 });
  assert.equal(s1.C, 100);
  assert.ok(s2.C < s1.C);
});

test("Question-level answers drive gates G6 and G7", () => {
  const ans = Object.fromEntries(QUESTIONS.map((q) => [q.code, q.reverse ? 1 : 3]));
  Object.assign(ans, { D1: 1, D2: 1, D3: 0, D4: 0, D5: 2, D6: 1, D7: 4, F6: 0 });
  const r = evaluate({ answers: ans, urgency: "6–12 months" });
  assert.ok(r.dimensions.V < 55);
  assert.ok(r.gates.includes("G6"));
  assert.ok(r.gates.includes("G7"));
  assert.equal(r.verdict.code, "VALIDATE_FIRST");
});
