// Adds an Encore Score respondent to MailerLite. Handles both scores:
//  - The Encore Score: Idea (/score, the default when no "quiz" is sent): joins "Encore Score results".
//  - The Encore Score: Mettle (/mettle, sends quiz: "mettle"): joins "Encore Mettle Score results".
// Each results group triggers its own result email (set up as an automation in MailerLite).
// Only people who ticked the consent box also go into the "Newsletter" group.
// Needs the MAILERLITE_API_KEY environment variable in Netlify.

const API = "https://connect.mailerlite.com/api";
const NEWSLETTER_GROUP = "Newsletter";
const clip = (v, n = 1000) => String(v ?? "").slice(0, n);

const QUIZZES = {
  idea: {
    group: "Encore Score results",
    fields: {
      encore_score: "number", encore_band: "text", encore_profile: "text", encore_strongest: "text",
      encore_constraint: "text", encore_action: "text", encore_building: "text", encore_urgency: "text",
      encore_source: "text",
    },
    map: (d) => ({
      encore_score: Number(d.score) || 0,
      encore_band: clip(d.band, 40),
      encore_profile: clip(d.profile, 100),
      encore_strongest: clip(d.strongest, 100),
      encore_constraint: clip(d.constraint, 100),
      encore_action: clip(d.action, 500),
      encore_building: clip(d.building, 300),
      encore_urgency: clip(d.urgency, 40),
      encore_source: clip(d.source, 60),
    }),
  },
  mettle: {
    group: "Encore Mettle Score results",
    fields: {
      mettle_score: "number", mettle_band: "text", mettle_profile: "text", mettle_route: "text",
      mettle_strongest: "text", mettle_constraint: "text", mettle_action: "text", mettle_stage: "text",
      encore_source: "text",
    },
    map: (d) => ({
      mettle_score: Number(d.score) || 0,
      mettle_band: clip(d.band, 40),
      mettle_profile: clip(d.profile, 100),
      mettle_route: clip(d.route, 100),
      mettle_strongest: clip(d.strongest, 100),
      mettle_constraint: clip(d.constraint, 100),
      mettle_action: clip(d.action, 500),
      mettle_stage: clip(d.stage, 120),
      encore_source: clip(d.source, 60),
    }),
  },
};

const cache = {}; // group ids per quiz, kept while the function stays warm

async function ml(path, key, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`MailerLite ${path} ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

async function groupId(name, key) {
  const found = await ml(`/groups?filter[name]=${encodeURIComponent(name)}&limit=50`, key);
  const g = (found.data || []).find((x) => x.name === name);
  if (g) return g.id;
  const made = await ml("/groups", key, { method: "POST", body: JSON.stringify({ name }) });
  return made.data.id;
}

async function setup(quiz, key) {
  if (cache[quiz]) return cache[quiz];
  const cfg = QUIZZES[quiz];
  const existing = await ml("/fields?limit=100", key);
  const have = new Set((existing.data || []).map((f) => f.key));
  for (const [k, type] of Object.entries(cfg.fields)) {
    if (!have.has(k)) {
      await ml("/fields", key, { method: "POST", body: JSON.stringify({ name: k, type }) }).catch(() => {});
    }
  }
  cache[quiz] = { results: await groupId(cfg.group, key), newsletter: await groupId(NEWSLETTER_GROUP, key) };
  return cache[quiz];
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const key = process.env.MAILERLITE_API_KEY;
  if (!key) return Response.json({ ok: false, error: "not_configured" }, { status: 503 });

  let d;
  try { d = await req.json(); } catch { return Response.json({ ok: false, error: "bad_json" }, { status: 400 }); }
  if (d.bot) return Response.json({ ok: true }); // honeypot
  const email = String(d.email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ ok: false, error: "bad_email" }, { status: 400 });
  const quiz = d.quiz === "mettle" ? "mettle" : "idea";

  try {
    const ids = await setup(quiz, key);
    const groups = [ids.results];
    if (d.consent === true) groups.push(ids.newsletter);
    await ml("/subscribers", key, {
      method: "POST",
      body: JSON.stringify({ email, fields: { name: clip(d.first_name, 100), ...QUIZZES[quiz].map(d) }, groups }),
    });
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "mailerlite_error" }, { status: 502 });
  }
};

export const config = { path: "/api/subscribe" };
