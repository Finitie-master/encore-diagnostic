# The Encore Diagnostic™

Home of the free **Encore Score™** and the paid **Encore Diagnostic™** (£397), which produces **The Encore Verdict** report.
Will be served at `diagnostic.theencorepartnership.com`.

## Current state (v0.1)
- `public/index.html`: the free Encore Score. Answers are scored in the browser.
- Leads are captured with Netlify Forms (form name `encore-score`): name, email, consent, plan, urgency, score, band, profile, strongest area, constraint, dimension scores and raw answers. View them in Netlify under **Forms**.
- Add `#preview` to the URL to show buttons that jump to sample results for the five test personas (David A–E).

## Coming next
- Email each person their result, and pass consenting leads to the email list tool
- Stripe checkout for the £397 diagnostic (with webinar promotion code)
- Paid diagnostic questions, scoring engine (from the calibrated test harness) and The Encore Verdict PDF
- Self-hosted brand fonts (Apéritif Serif, Neue Swiss, IBM Plex Mono)

## Hosting
Netlify. Publish directory: `public` (set in `netlify.toml`).
