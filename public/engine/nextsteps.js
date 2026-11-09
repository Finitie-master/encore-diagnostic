// "Your next step" block shared by both Encore Scores (Idea and Mettle), on screen and in the PDF.
// Two options: The Encore Diagnostic (£397, buy) and The Encore Programme (book a call, or read about it).
// Plain script (not a module) so the Idea Score's classic script can use it: window.EncoreNext.html({...}).
(function () {
  var CALL_URL = "https://calendar.app.google/BFMnsuQPBoSExbSV6";
  // Change this to the Programme page on the website once there is one.
  var PROGRAMME_URL = "https://theencorepartnership.com";

  var css = "" +
    ".nx{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px;margin-top:36px;background:var(--line);border:1px solid var(--line)}" +
    ".nx>div{background:var(--paper);padding:30px 30px 32px;display:flex;flex-direction:column}" +
    ".nx .price-tag{font-family:var(--f-display);font-size:44px;line-height:1;margin:14px 0 4px}" +
    ".nx h3{font-family:var(--f-display);font-weight:400;font-size:34px;line-height:1.05;margin:10px 0 10px}" +
    ".nx p{margin:0 0 14px;font-size:16px;color:var(--char)}" +
    ".nx ul{list-style:none;padding:0;margin:4px 0 18px;display:grid;gap:9px}" +
    ".nx li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:10px;font-size:15px;color:var(--char)}" +
    ".nx li::before{content:'';width:8px;height:8px;background:var(--red);margin-top:7px}" +
    ".nx li b{font-weight:600;color:var(--ink)}" +
    ".nx .acts{margin-top:auto;display:flex;gap:10px;flex-wrap:wrap}" +
    ".nx .btn-line{display:inline-flex;align-items:center;font:500 13px/1 var(--f-mono);letter-spacing:.08em;text-transform:uppercase;padding:15px 18px;border:1px solid var(--ink);color:var(--ink);text-decoration:none}" +
    ".nx small{display:block;margin-top:14px;font-size:13px;color:var(--stone);line-height:1.5}" +
    ".nx .on{background:#000}.nx .on h3,.nx .on .price-tag{color:#fff}.nx .on p,.nx .on li{color:#D8D4CE}.nx .on li b{color:#fff}" +
    ".nx .on .btn-line{border-color:#8a857e;color:#fff}.nx .on small{color:#A9A39B}" +
    ".nx-h{font-size:clamp(38px,6vw,64px)!important;margin-top:12px}" +
    ".nx-intro{font-size:18px;color:var(--char);max-width:640px;margin:16px 0 0}" +
    "@media (max-width:760px){.nx{grid-template-columns:minmax(0,1fr)}.nx>div{padding:24px}}" +
    "@media print{.nx>div{break-inside:avoid}}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  // opts: { diagUrl, intro, heading }  (heading/intro optional)
  function html(opts) {
    opts = opts || {};
    var heading = opts.heading || "Two ways to go further. <em>Pick yours.</em>";
    var intro = opts.intro || "Go deeper on your own with the full diagnostic, or build it properly with Jo beside you on The Encore Programme.";
    return '<div class="nx-wrap">' +
      '<div class="eyebrow label-red">Your next step</div>' +
      '<h2 class="display nx-h">' + heading + '</h2>' +
      '<p class="nx-intro">' + intro + '</p>' +
      '<div class="nx">' +
        '<div>' +
          '<div class="eyebrow label-red">The Encore Diagnostic™</div>' +
          '<div class="price-tag">£397</div>' +
          '<h3>Get the full verdict on your move</h3>' +
          '<p>30 to 40 minutes of deeper questions, then The Encore Verdict: a 20 to 30 page personal report on whether your move stacks up, what is proven, what is assumed and exactly what to do next.</p>' +
          '<ul>' +
            '<li><span><b>Your Encore Verdict.</b> Back it, adapt it or bin it, with a confidence level.</span></li>' +
            '<li><span><b>Evidence versus assumption.</b> What you know, what you\'re guessing and what to test.</span></li>' +
            '<li><span><b>The right business model.</b> Consulting, fractional, advisory, productised or portfolio.</span></li>' +
            '<li><span><b>Your risk register and 90-day priorities.</b> Plus what not to do yet.</span></li>' +
          '</ul>' +
          '<div class="acts"><a class="btn btn-red" id="buy" href="' + (opts.diagUrl || "/") + '">Get my full diagnostic →</a></div>' +
          '<small>Your Verdict arrives within 24 hours. The £397 is credited in full if you join The Encore Programme within 14 days.</small>' +
        '</div>' +
        '<div class="on">' +
          '<div class="eyebrow label-red">The Encore Programme™</div>' +
          '<div class="price-tag">12 weeks</div>' +
          '<h3>Build it with Jo beside you</h3>' +
          '<p>A private accelerator for experienced professionals. Weekly workshops in a small cohort plus monthly one-to-one time with Jo, from first idea to first paying clients.</p>' +
          '<ul>' +
            '<li><span><b>Evaluate.</b> Find what people will pay you for, and who.</span></li>' +
            '<li><span><b>Build.</b> Your offer and price, and how you'll find buyers, with AI as your intern.</span></li>' +
            '<li><span><b>Grow.</b> Your first clients, your numbers and your next 90 days.</span></li>' +
            '<li><span><b>Diagnostic and Verdict included.</b></span></li>' +
          '</ul>' +
          '<div class="acts"><a class="btn btn-red" href="' + CALL_URL + '" target="_blank" rel="noopener">Book a free half hour →</a><a class="btn-line" href="' + PROGRAMME_URL + '" target="_blank" rel="noopener">About the Programme →</a></div>' +
          '<small>Start with a free half hour, just us, to see whether it\'s right for you. No charge, and definitely no catch.</small>' +
        '</div>' +
      '</div></div>';
  }

  window.EncoreNext = { html: html, CALL_URL: CALL_URL, PROGRAMME_URL: PROGRAMME_URL };
})();
