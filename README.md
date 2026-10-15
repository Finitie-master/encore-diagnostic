# The Encore Diagnostic™

Home of the free **Encore Score™** and the paid **Encore Diagnostic™** (£397), which produces **The Encore Verdict** report.
Will be served at `diagnostic.theencorepartnership.com`.

## Pages
- `/` (`public/index.html`): **The Encore Diagnostic™** sales page (£397). Link to this from the main website. Paste the Stripe Payment Link into `CHECKOUT_URL` at the bottom of the file.
- `/score` (`public/score/index.html`): the free **Encore Score™** landing page, for sharing from socials, webinars and emails. Not linked from the main site. Add `?src=webinar` (or any `utm_source`) to a shared link to record where leads came from. Answers are scored in the browser.
- Leads are captured with Netlify Forms (form name `encore-score`): name, email, consent, plan, urgency, score, band, profile, strongest area, constraint, dimension scores and raw answers. View them in Netlify under **Forms**.
- Add `#preview` to the Encore Score URL to show buttons that jump to sample results for the five test personas (David A–E).

- `netlify/functions/subscribe.mjs` (`/api/subscribe`): adds each respondent to MailerLite. Everyone joins the **Encore Score results** group (which triggers the result email); people who tick the consent box also join **Newsletter**. Groups and custom fields (`encore_score`, `encore_band`, `encore_profile`, `encore_strongest`, `encore_constraint`, `encore_action`, `encore_building`, `encore_urgency`) are created automatically on first use.
- Requires the `MAILERLITE_API_KEY` environment variable in Netlify. Without it, Netlify Forms still captures every lead.

- `src/engine/`: the paid Encore Diagnostic scoring engine, a direct port of the calibrated test harness (v2): 43 scored questions, eight weighted dimensions, gates G1–G7, patterns X01–X12 and the verdict precedence. Public verdict language uses "Ready to Implement" in place of "Proceed".
- `test/`: run `npm test`. Checks every calibration persona (David A–E, Edge A–B) against its expected verdict, plus reverse scoring, urgency and question-level gates.

## Coming next
- Stripe checkout for the £397 diagnostic (with webinar promotion code)
- Paid diagnostic questions, scoring engine (from the calibrated test harness) and The Encore Verdict PDF
- Self-hosted brand fonts (Apéritif Serif, Neue Swiss, IBM Plex Mono)

## Hosting
Netlify. Publish directory: `public` (set in `netlify.toml`).
