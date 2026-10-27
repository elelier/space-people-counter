import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/sharePage.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { sharePage, SHARE_URL } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("successful native share emits one GA4 share event and does not copy", async () => {
  const events = [];
  let payload;
  const result = await sharePage({
    share: async (value) => { payload = value; },
    copy: async () => { throw new Error("should not copy"); },
    track: (method) => events.push(method),
  });

  assert.equal(result, "shared");
  assert.equal(payload.url, SHARE_URL);
  assert.match(payload.title, /espacio ahora/);
  assert.deepEqual(events, ["native"]);
});

test("native share cancellation never copies or reports success to GA4", async () => {
  const events = [];
  let copied = false;
  const result = await sharePage({
    share: async () => { throw Object.assign(new Error("cancel"), { name: "AbortError" }); },
    copy: async () => { copied = true; },
    track: (method) => events.push(method),
  });

  assert.equal(result, "cancelled");
  assert.equal(copied, false);
  assert.deepEqual(events, []);
});

test("unsupported native share copies the canonical URL and reports clipboard only", async () => {
  const events = [];
  let copiedUrl;
  const result = await sharePage({
    copy: async (url) => { copiedUrl = url; },
    track: (method) => events.push(method),
  });

  assert.equal(result, "copied");
  assert.equal(copiedUrl, "https://spacepeople.elelier.com/");
  assert.deepEqual(events, ["clipboard"]);
});

test("failed native share falls back to copy without claiming native success", async () => {
  const events = [];
  const result = await sharePage({
    share: async () => { throw new Error("NotAllowedError"); },
    copy: async () => {},
    track: (method) => events.push(method),
  });

  assert.equal(result, "copied");
  assert.deepEqual(events, ["clipboard"]);
});

test("clipboard rejection and missing capabilities never emit share events", async () => {
  const events = [];
  const failed = await sharePage({
    copy: async () => { throw new Error("permission denied"); },
    track: (method) => events.push(method),
  });
  const unsupported = await sharePage({track: (method) => events.push(method)});

  assert.equal(failed, "error");
  assert.equal(unsupported, "error");
  assert.deepEqual(events, []);
});
