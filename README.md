# The Encore Diagnostic™

Home of the two free **Encore Scores** (**Idea** at `/score` and **Mettle** at `/mettle`) and the paid **Encore Diagnostic™** (£397), which produces **The Encore Verdict** report.
Will be served at `diagnostic.theencorepartnership.com`.

## Pages
- `/` (`public/index.html`): **The Encore Diagnostic™** sales page (£397). Link to this from the main website. Paste the Stripe Payment Link into `CHECKOUT_URL` at the bottom of the file.
- `/start` (`public/start/index.html`): the live paid diagnostic (premium v3). Stripe redirects here after payment. Welcome screen, twelve sections in human wording (`engine/questions.mjs`), a live numbers calculator (`engine/economics.mjs`), an evidence log, and business-model fit (`engine/models.mjs`). Progress saves in the browser. On submit it scores everything and sends it to Netlify Forms (form `encore-diagnostic`) for Jo to produce the Encore Verdict within 24 hours. The original v1 page is in git history; `engine/questions_v1.mjs` is kept for its reverse-scoring test.
- `/preview/start/` redirects to `/start/` (the v3 review address before launch).
- `/score` (`public/score/index.html`): the free **Encore Score™** landing page, for sharing from socials, webinars and emails. Not linked from the main site. Add `?src=webinar` (or any `utm_source`) to a shared link to record where leads came from. Answers are scored in the browser.
- Leads are captured with Netlify Forms (form name `encore-score`): name, email, consent, plan, urgency, score, band, profile, strongest area, constraint, dimension scores and raw answers. View them in Netlify under **Forms**.
- Add `#preview` to the Encore Score URL to show buttons that jump to sample results for the five test personas (David A–E).

- `netlify/functions/subscribe.mjs` (`/api/subscribe`): adds each respondent to MailerLite. Everyone joins the **Encore Score results** group (which triggers the result email); people who tick the consent box also join **Newsletter**. Groups and custom fields (`encore_score`, `encore_band`, `encore_profile`, `encore_strongest`, `encore_constraint`, `encore_action`, `encore_building`, `encore_urgency`) are created automatically on first use.
- `/mettle` (`public/mettle/index.html`): the free **Encore Score: Mettle**, the partner to the Idea Score. The Idea Score tests the idea; Mettle tests the person: aptitude (self-direction, comfort with uncertainty), ability (selling yourself, commercial range, reach) and tenacity (bounce-back, staying power). 20 questions: one context question, 14 statements (three reverse-scored) and five scenario questions. Gives a 0 to 100 Mettle score with five bands, one of 11 named profiles, pillar and dimension scores, strongest area and what to work on first, a "Do this week" action, five routes ranked (own business, fractional or portfolio, partnering up, interim, salary plus something of your own) with a test for the top two, two challenge questions, flags where answers contradict each other, PDF download, and a close to the Idea Score and a free call. Scoring lives in `public/engine/mettle.mjs` (tested in `test/mettle.test.mjs`). `#preview` shows David A to E samples. `?src=` works the same as on `/score`.
- Mettle leads: Netlify Forms (form name `encore-mettle`) and MailerLite via `/api/subscribe` with `quiz: "mettle"`: everyone joins **Encore Mettle Score results**, consenters also join **Newsletter**. Fields `mettle_score`, `mettle_band`, `mettle_profile`, `mettle_route`, `mettle_strongest`, `mettle_constraint`, `mettle_action`, `mettle_stage` (and the shared `encore_source`) are created on first use. The result email is a MailerLite automation triggered by joining that group: set it up in MailerLite.
- To show the Next Move webinar in the Mettle close, set `WEBINAR_URL` near the top of the script in `public/mettle/index.html`.
- PDF results (both scores): the "Download my results (PDF)" button builds a real A4 PDF in the browser (`public/engine/pdf.mjs`, using jsPDF and html2canvas hosted in `public/vendor/`, MIT). It renders the result at desktop width on any device, breaks pages between blocks, keeps buttons clickable, ends with the shared "Your next step" block (Diagnostic and Programme, from `public/engine/nextsteps.js`) and puts theencorepartnership.com and the booking link in a footer on every page. If anything fails it falls back to the print dialog.
- Requires the `MAILERLITE_API_KEY` environment variable in Netlify. Without it, Netlify Forms still captures every lead.

- `public/engine/`: the paid Encore Diagnostic scoring engine, a direct port of the calibrated test harness (v2): 43 scored questions, eight weighted dimensions, gates G1–G7, patterns X01–X12 and the verdict precedence. Public verdict language uses "Ready to Implement" in place of "Proceed".
- `test/`: run `npm test`. Checks every calibration persona (David A–E, Edge A–B) against its expected verdict, plus reverse scoring, urgency and question-level gates.

## Coming next
- Stripe checkout for the £397 diagnostic (with webinar promotion code)
- Paid diagnostic questions, scoring engine (from the calibrated test harness) and The Encore Verdict PDF
- Self-hosted brand fonts (Apéritif Serif, Neue Swiss, IBM Plex Mono)

## Hosting
Netlify. Publish directory: `public` (set in `netlify.toml`).

## Demo mode (for showing the diagnostic to people)

Open `https://diagnostic.theencorepartnership.com/start/?demo=encore-show-jo`. A dark bar appears at the bottom of the page: nothing is required, you can jump to any section, "Fill sample answers" loads a worked example, and the last step shows what Jo would receive instead of submitting. Nothing is sent to Netlify Forms. Demo answers are stored separately from real ones, and demo mode lasts until "Exit demo" or the tab is closed. To change the code, edit `DEMO_CODE` in `public/start/index.html`. It hides the bar from ordinary visitors; it isn't a security control, as there's nothing private behind it.
