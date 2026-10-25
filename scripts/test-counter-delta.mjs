import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/services/counterDelta.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText;
const { getRosterDelta } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const live = (number) => ({ number, status: "live", isFallback: false });
const fallback = (number) => ({ number, status: "fallback", isFallback: true });

test("first real API response never creates an artificial increase or decrease", () => {
  assert.equal(getRosterDelta(null, live(10)), null);
});

test("switching between stale fallback and live data never creates a false change", () => {
  assert.equal(getRosterDelta(fallback(12), live(10)), null);
  assert.equal(getRosterDelta(live(10), fallback(12)), null);
});

test("only subsequent real changes generate a signed delta", () => {
  assert.equal(getRosterDelta(live(10), live(11)), 1);
  assert.equal(getRosterDelta(live(10), live(9)), -1);
  assert.equal(getRosterDelta(live(10), live(10)), null);
});
