import { test } from "node:test";
import assert from "node:assert/strict";

// Fake MailerLite: records calls, knows no groups or fields yet.
function fakeFetch(log) {
  let n = 0;
  return async (url, opts = {}) => {
    const path = url.replace("https://connect.mailerlite.com/api", "");
    const body = opts.body ? JSON.parse(opts.body) : null;
    log.push({ path, method: opts.method || "GET", body });
    let data = {};
    if (path.startsWith("/groups?")) data = { data: [] };
    else if (path === "/groups") data = { data: { id: "g" + ++n, name: body.name } };
    else if (path.startsWith("/fields?")) data = { data: [] };
    return { ok: true, json: async () => data };
  };
}

async function call(payload) {
  const log = [];
  global.fetch = fakeFetch(log);
  process.env.MAILERLITE_API_KEY = "test";
  const mod = await import("../netlify/functions/subscribe.mjs?" + Math.random());
  const res = await mod.default(new Request("http://x/api/subscribe", { method: "POST", body: JSON.stringify(payload) }));
  return { res: await res.json(), log };
}

test("Idea Score payload (no quiz) keeps the original group and fields", async () => {
  const { res, log } = await call({ email: "a@b.co", first_name: "Ann", consent: true, score: 61, band: "Unproven", building: "x", source: "webinar" });
  assert.equal(res.ok, true);
  const groups = log.filter((l) => l.path === "/groups").map((l) => l.body.name);
  assert.deepEqual(groups, ["Encore Score results", "Newsletter"]);
  const sub = log.find((l) => l.path === "/subscribers").body;
  assert.equal(sub.fields.encore_score, 61);
  assert.equal(sub.fields.encore_source, "webinar");
  assert.equal(sub.groups.length, 2);
});

test("Mettle payload goes to its own group with mettle fields", async () => {
  const { res, log } = await call({ quiz: "mettle", email: "a@b.co", first_name: "Ann", consent: false, score: 72, band: "Ready, with backup", route: "Partnering up", stage: "Recently left or made redundant", source: "instagram" });
  assert.equal(res.ok, true);
  const groups = log.filter((l) => l.path === "/groups").map((l) => l.body.name);
  assert.deepEqual(groups, ["Encore Mettle Score results", "Newsletter"]);
  const sub = log.find((l) => l.path === "/subscribers").body;
  assert.equal(sub.fields.mettle_score, 72);
  assert.equal(sub.fields.mettle_route, "Partnering up");
  assert.equal(sub.fields.encore_source, "instagram");
  assert.equal(sub.groups.length, 1, "no consent, so no Newsletter group");
  const made = log.filter((l) => l.path === "/fields" && l.method === "POST").map((l) => l.body.name);
  assert.ok(made.includes("mettle_route") && !made.includes("encore_building"));
});
