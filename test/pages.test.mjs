import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Catch syntax errors in the browser scripts that the other tests don't load.
test("nextsteps.js parses and builds the block", () => {
  const src = readFileSync(new URL("../public/engine/nextsteps.js", import.meta.url), "utf8");
  const ctx = { window: {}, document: { createElement: () => ({}), head: { appendChild() {} } } };
  vm.runInNewContext(src, ctx);
  const html = ctx.window.EncoreNext.html({ diagUrl: "/?src=x" });
  assert.ok(html.includes("Get my full diagnostic") && html.includes("Book a free half hour"));
});

test("inline scripts on every page parse", () => {
  for (const page of ["score", "mettle", "start", "free", "plan"]) {
    const html = readFileSync(new URL(`../public/${page}/index.html`, import.meta.url), "utf8");
    const scripts = [...html.matchAll(/<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/g)];
    assert.ok(scripts.length > 0, page);
    for (const [, attrs, code] of scripts) {
      if (attrs.includes("module")) {
        // strip import lines so it parses as a plain script
        new vm.Script(code.replace(/^import .*$/gm, ""));
      } else new vm.Script(code);
    }
  }
});
