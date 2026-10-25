import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/socialMetadata.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { getSocialImageUrl } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const productionImage = "https://spacepeople.elelier.com/social-space-people.png";

test("production and local builds keep the canonical social image", () => {
  assert.equal(getSocialImageUrl(), productionImage);
  assert.equal(getSocialImageUrl("main", "https://preview.pages.dev"), productionImage);
});

test("preview builds point the social image at their deployed assets", () => {
  assert.equal(
    getSocialImageUrl("feat/ruta-a-share-og-ga4", "https://abcdef.space-people-counter.pages.dev"),
    "https://abcdef.space-people-counter.pages.dev/social-space-people.png",
  );
});

test("invalid or insecure preview URLs fall back to the canonical image", () => {
  assert.equal(getSocialImageUrl("feature", "not-a-url"), productionImage);
  assert.equal(getSocialImageUrl("feature", "http://example.com"), productionImage);
});
