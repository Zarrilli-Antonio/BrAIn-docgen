import test from "node:test";
import assert from "node:assert/strict";
import { buildPrompt, buildWholeCodebaseText, docPathFor } from "./prompt.js";

test("docPathFor swaps the source extension for .md, keeping the folder structure", () => {
  assert.equal(docPathFor("src/core/docs.ts"), "src/core/docs.md");
  assert.equal(docPathFor("README.md"), "README.md");
  assert.equal(docPathFor("Makefile"), "Makefile.md");
});

test("buildPrompt includes target content, and only includes optional sections when non-empty", () => {
  const bare = buildPrompt({ targetPath: "a.ts", targetContent: "export const x = 1;", memory: "", styleGuide: "", existingDocs: [] });
  assert.match(bare.user, /export const x = 1;/);
  assert.doesNotMatch(bare.user, /Project memory/);
  assert.doesNotMatch(bare.user, /Style guide/);

  const full = buildPrompt({
    targetPath: "a.ts",
    targetContent: "code",
    memory: "remember this",
    styleGuide: "use dark mode",
    existingDocs: ["b.md", "c/d.md"],
  });
  assert.match(full.user, /Project memory/);
  assert.match(full.user, /remember this/);
  assert.match(full.user, /Style guide/);
  assert.match(full.user, /use dark mode/);
  assert.match(full.user, /\[\[wikilink\]\]/); // instructed in the existing-docs section header
  assert.match(full.user, /- b\n/);
  assert.match(full.user, /- c\/d\n/);
});

test("buildWholeCodebaseText concatenates every file's content under a path header", () => {
  const { text, included } = buildWholeCodebaseText([
    { path: "a.ts", content: "const a = 1;" },
    { path: "b.ts", content: "const b = 2;" },
  ]);
  assert.equal(included, 2);
  assert.match(text, /--- a\.ts ---\nconst a = 1;/);
  assert.match(text, /--- b\.ts ---\nconst b = 2;/);
});

test("buildWholeCodebaseText stops once maxChars is hit, instead of truncating a file mid-way", () => {
  const files = [
    { path: "a.ts", content: "x".repeat(50) },
    { path: "b.ts", content: "y".repeat(50) },
    { path: "c.ts", content: "z".repeat(50) },
  ];
  const { text, included } = buildWholeCodebaseText(files, 80);
  assert.equal(included, 1);
  assert.match(text, /a\.ts/);
  assert.doesNotMatch(text, /b\.ts/);
});
