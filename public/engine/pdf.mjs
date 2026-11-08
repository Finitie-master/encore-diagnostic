// Turns the on-screen result into a downloadable A4 PDF that looks like the screen.
// Used by both Encore Scores (Idea at /score, Mettle at /mettle).
// The page is rendered at desktop width whatever device it's on, cut into A4 pages at
// sensible points, and every page gets a footer with the website and booking links.
// Links in the report (buttons) stay clickable in the PDF.

export const SITE_URL = "https://theencorepartnership.com";
export const SITE_LABEL = "theencorepartnership.com";
export const CALL_URL = "https://calendar.app.google/BFMnsuQPBoSExbSV6";

const W = 1100;            // render width in CSS px (desktop layout)
const SCALE = 1.5;         // canvas pixels per CSS px (keeps iPhones under their canvas limit)
const MM_W = 210, MM_H = 297, FOOT_MM = 13, TOP_MM = 9;
const PX_PER_MM = W / MM_W;
const PAGE_PX = Math.floor((MM_H - FOOT_MM) * PX_PER_MM);          // first page
const NEXT_PX = Math.floor((MM_H - FOOT_MM - TOP_MM) * PX_PER_MM); // later pages have a top margin

// Places it's tidy to start a new page.
const BREAKS = "section, .topbar, .interp p, .pillars, .pair, .action, .routes .route, .callout, .qs li, .flags, .next, .prog, " +
  ".dims-grid, .dim, .grid > *, .cards > *, .teaser ul, .teaser li, .res-grid, .scale, .sect-lede, .eyebrow, .print-foot, .pdf-end";
// Blocks that should never be split across two pages.
const KEEP = ".pdf-end, .action, .route, .pair, .pillars, .next, .scorebox, .qs li, .flags, .res-grid, .callout";

// Styles for the closing panel that appears only in the PDF.
const PDF_CSS = ".pdf-end{background:#000;color:#fff;padding:56px 64px 60px;margin:0}" +
  ".pdf-end .eyebrow{color:#DD1D13}" +
  ".pdf-end h2{font-family:var(--f-display);font-weight:400;text-transform:uppercase;font-size:56px;line-height:.95;margin:14px 0 18px;color:#fff}" +
  ".pdf-end h2 em{font-style:italic;text-transform:none;color:#DD1D13}" +
  ".pdf-end p{font-size:18px;line-height:1.55;color:#D8D4CE;max-width:760px;margin:0 0 26px}" +
  ".pdf-end .pdf-links{display:flex;gap:16px;flex-wrap:wrap}" +
  ".pdf-end .pdf-links a{display:inline-block;font-family:var(--f-mono);text-transform:uppercase;letter-spacing:.08em;font-size:15px;padding:16px 22px;text-decoration:none}" +
  ".pdf-end .pdf-links a.main{background:#DD1D13;color:#fff}" +
  ".pdf-end .pdf-links a.alt{border:1px solid #5F5C57;color:#fff}";

// The closing panel, added to the end of the report in the PDF only.
export const PDF_END_HTML = `<section class="pdf-end">
  <div class="eyebrow">The Encore Programme™</div>
  <h2>Ready to turn this <em>into a business?</em></h2>
  <p>The Encore Programme is a private accelerator for experienced professionals: 12 weeks in a small cohort, with Jo beside you from first idea to first paying clients. Find out more and book your place at theencorepartnership.com.</p>
  <div class="pdf-links"><a class="main" href="${SITE_URL}">theencorepartnership.com →</a><a class="alt" href="${CALL_URL}">Book a free half hour →</a></div>
</section>`;

function loadScript(src) {
  return new Promise((ok, fail) => {
    if (document.querySelector(`script[src="${src}"]`)) return ok();
    const s = document.createElement("script");
    s.src = src; s.onload = ok; s.onerror = () => fail(new Error("Could not load " + src));
    document.head.appendChild(s);
  });
}

export async function downloadPdf({ filename, root = document.body }) {
  await Promise.all([loadScript("/vendor/html2canvas.min.js"), loadScript("/vendor/jspdf.umd.min.js")]);
  if (document.fonts && document.fonts.ready) await document.fonts.ready;

  let breaks = [], links = [], totalH = 0;
  const canvas = await window.html2canvas(root, {
    scale: SCALE, useCORS: true, backgroundColor: "#ffffff", logging: false,
    windowWidth: W, width: W, x: 0, y: 0, scrollX: 0, scrollY: 0,
    onclone: (doc) => {
      const st = doc.createElement("style");
      st.textContent = "*{animation:none!important;transition:none!important}" +
        ".no-print,#proto,form[hidden],.proto{display:none!important}" +
        ".print-foot{display:block!important;margin-top:28px;padding-top:14px;border-top:1px solid #ccc;font-size:12px;color:#555;line-height:1.6}" +
        PDF_CSS +
        "html,body{width:" + W + "px!important;overflow:visible!important}";
      doc.head.appendChild(st);
      const app = doc.getElementById("app") || doc.body;
      app.insertAdjacentHTML("beforeend", PDF_END_HTML);
      const body = doc.body, top0 = body.getBoundingClientRect().top;
      totalH = Math.ceil(body.scrollHeight);
      breaks = [...new Set([...body.querySelectorAll(BREAKS)]
        .filter((el) => el.offsetParent !== null)
        .map((el) => Math.round(el.getBoundingClientRect().top - top0)))]
        .filter((y) => y > 0).sort((a, b) => a - b);
      const keep = [...body.querySelectorAll(KEEP)].map((el) => { const r = el.getBoundingClientRect(); return [r.top - top0, r.bottom - top0]; });
      breaks = breaks.filter((y) => !keep.some(([a, b]) => y > a + 1 && y < b - 1));
      // A heading label (eyebrow) should start the page with its heading: drop breaks just below an eyebrow.
      const eyebrowBottoms = [...body.querySelectorAll(".eyebrow")].map((el) => el.getBoundingClientRect().bottom - top0);
      breaks = breaks.filter((y) => !eyebrowBottoms.some((b) => y >= b - 2 && y - b < 40));
      links = [...body.querySelectorAll("a[href]")].filter((a) => a.offsetParent !== null).map((a) => {
        const r = a.getBoundingClientRect();
        return { url: a.href, x: r.left, y: r.top - top0, w: r.width, h: r.height };
      }).filter((l) => /^https?:|^mailto:/.test(l.url) && l.w > 0);
    },
  });

  const H = Math.min(totalH || canvas.height / SCALE, canvas.height / SCALE);
  // Work out where each page starts.
  const starts = [0];
  const room = () => (starts.length === 1 ? PAGE_PX : NEXT_PX);
  while (starts[starts.length - 1] + room() < H) {
    const s = starts[starts.length - 1], limit = s + room();
    const ok = breaks.filter((y) => y > s + room() * 0.45 && y <= limit);
    starts.push(ok.length ? ok[ok.length - 1] : limit);
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  const slice = document.createElement("canvas");
  starts.forEach((s, i) => {
    const e = i + 1 < starts.length ? starts[i + 1] : H;
    const hPx = Math.max(1, Math.round((e - s) * SCALE));
    slice.width = canvas.width; slice.height = hPx;
    const ctx = slice.getContext("2d");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, Math.round(s * SCALE), canvas.width, hPx, 0, 0, canvas.width, hPx);
    const top = i > 0 ? TOP_MM : 0;
    if (i > 0) {
      pdf.addPage();
      // Fill the top margin with the colour the page's content starts on.
      const [r, g, b] = ctx.getImageData(4, 0, 1, 1).data;
      pdf.setFillColor(r, g, b); pdf.rect(0, 0, MM_W, top + 0.5, "F");
    }
    pdf.addImage(slice.toDataURL("image/jpeg", 0.9), "JPEG", 0, top, MM_W, (e - s) / PX_PER_MM);

    links.filter((l) => l.y >= s && l.y + l.h <= e).forEach((l) => {
      pdf.link(l.x / PX_PER_MM, top + (l.y - s) / PX_PER_MM, l.w / PX_PER_MM, l.h / PX_PER_MM, { url: l.url });
    });

    // Footer on every page: website, booking link, page number.
    const fy = MM_H - FOOT_MM;
    pdf.setFillColor(0, 0, 0); pdf.rect(0, fy, MM_W, FOOT_MM, "F");
    pdf.setFillColor(221, 29, 19); pdf.rect(0, fy, MM_W, 0.8, "F");
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(255, 255, 255);
    pdf.textWithLink(SITE_LABEL, 12, fy + 8, { url: SITE_URL });
    pdf.setFont("helvetica", "normal"); pdf.setTextColor(226, 217, 204);
    const book = "Book a free half hour with Jo  >";
    const bw = pdf.getTextWidth(book);
    pdf.textWithLink(book, (MM_W - bw) / 2, fy + 8, { url: CALL_URL });
    pdf.setTextColor(170, 166, 160);
    const pg = `${i + 1} / ${starts.length}`;
    pdf.text(pg, MM_W - 12 - pdf.getTextWidth(pg), fy + 8);
  });

  pdf.setProperties({ title: filename.replace(/\.pdf$/, ""), author: "The Encore Partnership", creator: SITE_LABEL });
  pdf.save(filename.endsWith(".pdf") ? filename : filename + ".pdf");
}

// Wires a button: shows progress, falls back to the print dialog if anything fails.
export function wirePdfButton(btn, getFilename) {
  if (!btn) return;
  const label = btn.textContent;
  btn.onclick = async () => {
    btn.disabled = true; btn.textContent = "Preparing your PDF…";
    try { await downloadPdf({ filename: getFilename() }); }
    catch (e) { console.error(e); window.print(); }
    finally { btn.disabled = false; btn.textContent = label; }
  };
}
