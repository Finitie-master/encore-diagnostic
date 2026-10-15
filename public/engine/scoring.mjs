// The Encore Diagnostic™ scoring engine.
// A direct port of the calibrated test harness (v2): dimension scores, weighted overall,
// commercial gates G1–G7, cross-score patterns X01–X12 and the verdict precedence.
// Pure functions, no dependencies: runs in the browser and in Netlify functions.

import { QUESTIONS } from "./questions.mjs";

export const DIMENSIONS = {
  E:  { name: "Expertise & Transferable Value",  weight: 0.12, critical: false },
  C:  { name: "Customer & Problem Clarity",      weight: 0.16, critical: true },
  V:  { name: "Evidence & Market Validation",    weight: 0.18, critical: true },
  P:  { name: "Proposition & Differentiation",   weight: 0.14, critical: false },
  M:  { name: "Commercial Model & Economics",    weight: 0.15, critical: true },
  R:  { name: "Route to Market & Authority",     weight: 0.12, critical: false },
  RD: { name: "Practical & Financial Readiness", weight: 0.08, critical: false },
  F:  { name: "Founder Fit & Commitment",        weight: 0.05, critical: false },
};

export const BANDS = [
  { name: "Strong",    min: 80 },
  { name: "Promising", min: 65 },
  { name: "Unproven",  min: 45 },
  { name: "Weak",      min: 25 },
  { name: "Critical",  min: 0 },
];
export const band = (score) => BANDS.find((b) => score >= b.min).name;

// Public-facing verdict language (blueprint decision: "Proceed" becomes "Ready to Implement").
export const VERDICTS = {
  PAUSE_AND_RETHINK: { label: "Pause & Rethink",
    note: "Multiple critical issues or a founder-fit conflict mean the current concept should not receive material investment yet." },
  REVENUE_FIRST: { label: "Revenue First",
    note: "Protect runway. Lead with the simplest high-value service that can create paid evidence quickly." },
  VALIDATE_FIRST: { label: "Validate First",
    note: "The opportunity is not evidenced strongly enough yet. Test the problem, buyer and willingness to pay before building further." },
  REWORK_THE_MODEL: { label: "Rework the Model",
    note: "Demand may exist, but the pricing, capacity or commercial mechanics need redesign." },
  REPOSITION: { label: "Reposition",
    note: "There is useful experience here, but the customer/problem/proposition combination needs sharpening." },
  READY_BUT_NARROW: { label: "Ready to Implement, but Narrow",
    note: "There is enough evidence to move forward, but the initial customer/problem/offer should be narrowed." },
  READY_TO_IMPLEMENT: { label: "Ready to Implement",
    note: "The critical commercial dimensions are sufficiently evidenced to move into disciplined implementation." },
};

const URGENT = new Set(["<3 months", "within 3 months", "3–6 months", "3-6 months", "in 3 to 6 months"]);
export const isUrgent = (urgency) => URGENT.has(String(urgency || "").trim().toLowerCase().replace("–", "–"))
  || URGENT.has(String(urgency || "").trim().toLowerCase());

/** answers: { B1: 0..4, C6: 0..4, ... } keyed by question code. Returns 0–100 per dimension. */
export function dimensionScores(answers, questions = QUESTIONS) {
  const sums = {}, counts = {};
  for (const q of questions) {
    counts[q.dim] = (counts[q.dim] || 0) + 1;
    const raw = answers[q.code];
    if (raw === undefined || raw === null || raw === "") continue; // unanswered counts as 0, as in the harness
    const v = Math.max(0, Math.min(4, Number(raw)));
    sums[q.dim] = (sums[q.dim] || 0) + (q.reverse ? 4 - v : v);
  }
  const out = {};
  for (const k of Object.keys(DIMENSIONS)) out[k] = round1(((sums[k] || 0) / ((counts[k] || 1) * 4)) * 100);
  return out;
}

export function weightedOverall(d) {
  return round1(Object.entries(DIMENSIONS).reduce((t, [k, x]) => t + (d[k] || 0) * x.weight, 0));
}

/** raw: optional raw answers, needed for G6 (F6) and G7 (D3). */
export function gates(d, { urgency, raw = {} } = {}) {
  const has = (c) => raw[c] !== undefined && raw[c] !== null && raw[c] !== "";
  return {
    G1: { on: d.C < 40, reason: "Customer/problem score below 40" },
    G2: { on: d.V < 45, reason: "Validation score below 45" },
    G3: { on: d.M < 45, reason: "Commercial model score below 45" },
    G4: { on: d.RD < 35 && isUrgent(urgency), reason: "Low readiness plus urgent revenue need" },
    G5: { on: d.F < 40, reason: "Founder fit below 40" },
    G6: { on: has("F6") && Number(raw.F6) <= 1 && d.V < 55, reason: "Build-before-sale risk" },
    G7: { on: has("D3") && d.V < 55 && Number(raw.D3) <= 1, reason: "Positive interest without willingness-to-pay evidence" },
  };
}

export function patterns(d, overall, { urgency } = {}) {
  const urgent = isUrgent(urgency);
  return {
    X01: { on: d.E >= 75 && d.V < 45, name: "The Unproven Expert" },
    X02: { on: d.E >= 75 && d.V >= 60 && d.P < 50, name: "Value trapped in poor packaging" },
    X03: { on: d.V >= 70 && d.R < 45, name: "Demand without distribution" },
    X04: { on: d.R >= 70 && d.C < 45, name: "Network without focus" },
    X05: { on: d.P >= 70 && d.V < 45, name: "Polished assumption" },
    X06: { on: overall >= 65 && d.F < 40, name: "Commercially plausible, personally wrong" },
    X07: { on: d.RD < 35 && d.E >= 70 && urgent, name: "Revenue-first pathway" },
    X08: { on: d.M < 50 && overall >= 55, name: "Potential economic mismatch" },
    X09: { on: d.R < 45 && d.V >= 70, name: "Acquisition challenge" },
    X10: { on: d.R >= 70 && d.E >= 75 && d.V < 60, name: "Warm-market validation opportunity" },
    X11: { on: d.C >= 70 && d.V >= 70 && d.M >= 70 && d.P >= 70, name: "Proceed with disciplined execution" },
    X12: { on: d.C < 40 && d.V < 40 && d.P < 45, name: "Rethink before building" },
  };
}

/** Verdict precedence exactly as the calibrated harness (Dashboard!A22). */
export function verdictCode(d, { urgency } = {}) {
  if (d.F < 40 || (d.C < 40 && d.V < 40 && d.P < 45)) return "PAUSE_AND_RETHINK";
  if (d.RD < 35 && isUrgent(urgency) && d.E >= 70) return "REVENUE_FIRST";
  if (d.V < 55) return "VALIDATE_FIRST";
  if (d.M < 45) return "REWORK_THE_MODEL";
  if (d.C < 40) return "REPOSITION";
  if (d.C >= 65 && d.V >= 60 && d.P >= 65 && d.M >= 65) {
    return d.C < 70 || d.P < 70 ? "READY_BUT_NARROW" : "READY_TO_IMPLEMENT";
  }
  return "REPOSITION";
}

/** Full evaluation from dimension scores (for calibration) or from raw answers. */
export function evaluate({ answers, dimensions, urgency, questions }) {
  const d = dimensions ? { ...dimensions } : dimensionScores(answers, questions);
  const overall = weightedOverall(d);
  const code = verdictCode(d, { urgency });
  const g = gates(d, { urgency, raw: answers || {} });
  const x = patterns(d, overall, { urgency });
  return {
    dimensions: d,
    bands: Object.fromEntries(Object.keys(DIMENSIONS).map((k) => [k, band(d[k])])),
    overall,
    overallBand: band(overall),
    gates: Object.keys(g).filter((k) => g[k].on),
    gateDetail: g,
    patterns: Object.keys(x).filter((k) => x[k].on),
    patternDetail: x,
    verdict: { code, ...VERDICTS[code] },
  };
}

function round1(n) { return Math.round(n * 10) / 10; }
