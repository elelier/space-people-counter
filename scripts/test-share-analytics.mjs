import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/analytics.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { recordShareEvent, getGaBootstrapScript } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

const canonicalUrl = "https://spacepeople.elelier.com/";

test("records an immediate share when GA4 is ready, without double counting", () => {
  const calls = [];
  const target = { gtag: (...args) => calls.push(args) };
  recordShareEvent(target, "native", canonicalUrl);

  assert.deepEqual(calls, [["event", "share", {
    method: "native", content_type: "website", item_id: canonicalUrl,
  }]]);
  assert.equal(target.__spcPendingShareEvents, undefined);
});

test("a share before GA4 initialization is flushed once, after config", () => {
  const target = {};
  recordShareEvent(target, "clipboard", canonicalUrl);

  assert.deepEqual(target.__spcPendingShareEvents, [{
    method: "clipboard", content_type: "website", item_id: canonicalUrl,
  }]);

  runInNewContext(getGaBootstrapScript("G-8KTLDRRQTP"), { window: target, Date });
  const commands = Array.from(target.dataLayer, (args) => Array.from(args));

  assert.deepEqual(commands.map(([command]) => command), ["js", "config", "event"]);
  assert.equal(commands[1][1], "G-8KTLDRRQTP");
  assert.equal(commands[2][1], "share");
  assert.equal(commands[2][2].method, "clipboard");
  assert.equal(commands[2][2].item_id, canonicalUrl);
  assert.equal(target.__spcPendingShareEvents.length, 0);
});
