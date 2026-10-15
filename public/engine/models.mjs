// Business-model suitability for the Encore Diagnostic (blueprint section 6).
// Transparent rule-based scoring: every adjustment carries a reason the report can quote.

export const MODELS = {
  consulting:  "Independent consulting",
  fractional:  "Fractional leadership",
  advisory:    "Advisory or board portfolio",
  productised: "Productised service",
  training:    "Training and facilitation",
  coaching:    "Coaching and mentoring",
  digital:     "Digital product or IP",
  portfolio:   "Portfolio of work",
};

const URGENT = /within 3|<3|3 to 6|3–6|3-6/i;

/**
 * @param {object} p
 *   dims      dimension scores {E,C,V,P,M,R,RD,F}
 *   urgency   urgency label
 *   prefs     { work_mode, engagement, client_count, groups, accountability, avoid: [] }
 *   answers   raw scored answers (uses G4 for appetite to sell)
 *   relationships  label from the route-to-market question
 *   econStatus     "fits" | "tight" | "does_not_fit" | undefined
 */
export function modelFit({ dims = {}, urgency = "", prefs = {}, answers = {}, relationships = "", econStatus } = {}) {
  const s = Object.fromEntries(Object.keys(MODELS).map((k) => [k, { score: 50, reasons: [] }]));
  const add = (k, v, why) => { s[k].score += v; s[k].reasons.push({ v, why }); };
  const avoid = new Set(prefs.avoid || []);
  const urgent = URGENT.test(urgency);

  // Revenue urgency
  if (urgent) {
    add("consulting", 12, "You need income soon, and consulting can earn from existing expertise quickly.");
    add("productised", 8, "A defined service can be sold and delivered quickly.");
    add("fractional", 8, "Fractional roles can bring in regular income fairly fast.");
    add("digital", -20, "Products take time to build an audience and sales; that conflicts with your need for income soon.");
    add("portfolio", -5, "A portfolio takes time to assemble when income is needed soon.");
  } else if (/year|no rush|no urgency/i.test(urgency)) {
    add("digital", 5, "You have time to build something that sells without you.");
    add("portfolio", 5, "You have time to build several compatible strands of work.");
  }

  // How they want to work
  const wm = prefs.work_mode || "";
  if (/hands-on/i.test(wm)) { add("productised", 10, "You want to do the work yourself, which suits a defined service."); add("consulting", 8, "Hands-on delivery suits project consulting."); add("fractional", 5, "Hands-on work fits a part-time leadership role."); }
  if (/inside/i.test(wm)) { add("fractional", 20, "You want to lead inside a client's team: the essence of fractional work."); add("consulting", 5, "Leading change inside organisations also suits consulting."); }
  if (/advis/i.test(wm)) { add("advisory", 20, "You want to advise and guide decisions rather than deliver."); add("consulting", 12, "Advice-led consulting fits how you want to work."); add("coaching", 5, "Guidance-led work overlaps with mentoring."); }
  if (/teach/i.test(wm)) { add("training", 20, "You want to teach others to do it."); add("coaching", 10, "Teaching one-to-one suits coaching and mentoring."); add("digital", 5, "Teachable expertise can become a product later."); }
  if (/without me/i.test(wm)) { add("digital", 20, "You want to create something people can use without you."); add("productised", 5, "A tightly defined service is a step towards that."); }

  const en = prefs.engagement || "";
  if (/ongoing/i.test(en)) { add("fractional", 12, "You prefer ongoing relationships with a few clients."); add("advisory", 10, "Ongoing advisory relationships suit you."); add("coaching", 5, "Ongoing coaching relationships suit you."); }
  if (/project/i.test(en)) { add("consulting", 12, "You prefer defined projects with a start and an end."); add("productised", 8, "Defined projects are the basis of a productised service."); }
  if (/session|workshop/i.test(en)) { add("training", 12, "You prefer sessions and workshops."); add("coaching", 8, "Session-based work suits coaching."); }
  if (/mix/i.test(en)) add("portfolio", 15, "You want a mix of work, which suits a portfolio.");
  if (/product/i.test(en)) add("digital", 15, "You'd like products people buy without you.");

  const g = prefs.groups || "";
  if (/one-to-one/i.test(g)) { add("coaching", 6, "You prefer working one-to-one."); add("advisory", 4, "One-to-one work suits advisory."); add("consulting", 4, "One-to-one work suits consulting."); }
  if (/small group/i.test(g)) add("training", 8, "You enjoy small groups.");
  if (/large/i.test(g)) { add("training", 10, "You're comfortable with large groups."); add("digital", 5, "Large-group teaching scales towards products."); }

  const acc = prefs.accountability || "";
  if (/avoid/i.test(acc)) { add("fractional", -20, "You want to avoid day-to-day accountability, which fractional roles carry."); add("consulting", -5, "Consulting often carries delivery accountability."); add("advisory", 5, "Advisory roles sit above day-to-day accountability."); add("training", 3, "Training carries little operational accountability."); }
  if (/thrive/i.test(acc)) { add("fractional", 12, "You thrive on accountability for results, which fractional roles need."); add("consulting", 5, "Owning results suits consulting."); }

  // Selling appetite and network
  const g4 = Number(answers.G4);
  if (Number.isFinite(g4) && g4 <= 1) { add("consulting", -8, "Consulting depends on direct sales conversations, which you'd rather avoid."); add("coaching", -5, "Coaching also depends on one-to-one selling."); }
  const strongNet = /31|100/.test(relationships) || (dims.R ?? 0) >= 70;
  if (strongNet) { add("advisory", 8, "Your network and reputation suit advisory work."); add("fractional", 8, "Your network can supply fractional roles."); add("consulting", 6, "Your network gives consulting a warm start."); }
  if ((dims.E ?? 0) >= 80 && (dims.R ?? 0) >= 70) add("advisory", 8, "Deep expertise plus visible authority is what advisory buyers look for.");
  if ((dims.V ?? 0) >= 70 && (dims.R ?? 0) >= 60) add("digital", 8, "You have validated demand and reach, which products need.");
  else if ((dims.R ?? 0) < 45) add("digital", -10, "Products need an audience you don't have yet.");
  if ((dims.RD ?? 100) < 35) add("digital", -10, "Your runway is short for a product that takes time to sell.");
  if (econStatus === "does_not_fit") { add("productised", 6, "Your numbers don't fit your time; a defined, higher-value service could fix that."); add("training", 4, "One-to-many delivery can break the link between time and income."); }

  if (avoid.has("Managing people")) add("fractional", -10, "You want to avoid managing people, which fractional leaders usually do.");
  if (avoid.has("Being on call")) add("fractional", -12, "You don't want to be on call, which fractional roles often require.");
  if (avoid.has("Travel")) { add("consulting", -3, "Consulting can involve travel you want to avoid."); add("training", -5, "In-person training means travel you want to avoid."); }
  if (avoid.has("Selling")) { add("consulting", -5, "You want to avoid selling, and consulting relies on it."); add("digital", 3, "Products can sell through content rather than conversations."); }

  const ranked = Object.entries(s)
    .map(([k, v]) => ({ key: k, name: MODELS[k], score: Math.max(0, Math.min(100, v.score)), reasons: v.reasons.sort((a, b) => Math.abs(b.v) - Math.abs(a.v)) }))
    .sort((a, b) => b.score - a.score);
  const primary = ranked[0];
  const secondary = ranked[1].score >= 60 && primary.score - ranked[1].score <= 10 ? ranked[1] : null;
  const rejected = ranked.slice(-2).reverse();
  return { ranked, primary, secondary, rejected };
}
