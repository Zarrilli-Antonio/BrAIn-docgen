import test from "node:test";
import assert from "node:assert/strict";
import { parseArgs, removeStaleDocs } from "./cli.js";

function fakeDocStore(initialDocs: string[]) {
  const docs = new Set(initialDocs);
  const deleted: string[] = [];
  return {
    listDocs: async () => [...docs],
    deleteDoc: async (path: string) => {
      if (!docs.has(path)) throw new Error(`${path} does not exist`);
      docs.delete(path);
      deleted.push(path);
    },
    deleted,
  };
}

test("parseArgs doesn't mistake a flag's value for the positional target", () => {
  // Regression: --provider local used to leak "local" into `target` because the old parser
  // just grabbed the first token not starting with "--", with no notion of flag arity.
  const opts = parseArgs(["--all", "--provider", "local", "--model", "qwen3:8b"]);
  assert.equal(opts.target, undefined);
  assert.equal(opts.all, true);
  assert.equal(opts.provider, "local");
  assert.equal(opts.model, "qwen3:8b");
});

test("parseArgs reads a real positional target alongside flags", () => {
  const opts = parseArgs(["src/core", "--all", "--provider", "api", "--api-key", "sk-x"]);
  assert.equal(opts.target, "src/core");
  assert.equal(opts.all, true);
  assert.equal(opts.provider, "api");
  assert.equal(opts.apiKey, "sk-x");
});

test("parseArgs defaults", () => {
  const opts = parseArgs([]);
  assert.equal(opts.target, undefined);
  assert.equal(opts.all, false);
  assert.equal(opts.whole, false);
  assert.equal(opts.brainUrl, "http://localhost:4173");
  assert.equal(opts.provider, "local");
  assert.equal(opts.ollamaHost, "http://localhost:11434");
});

test("parseArgs reads --whole, --base-url, and --max-chars for the openai provider", () => {
  const opts = parseArgs(["--whole", "--provider", "openai", "--base-url", "https://api.groq.com/openai/v1", "--model", "llama-3.3-70b", "--max-chars", "50000"]);
  assert.equal(opts.whole, true);
  assert.equal(opts.provider, "openai");
  assert.equal(opts.baseUrl, "https://api.groq.com/openai/v1");
  assert.equal(opts.model, "llama-3.3-70b");
  assert.equal(opts.maxChars, 50_000);
});

test("parseArgs reads --sync", () => {
  assert.equal(parseArgs(["--sync"]).sync, true);
  assert.equal(parseArgs([]).sync, false);
});

test("removeStaleDocs deletes a doc whose source file is gone, leaves current and protected docs alone", async () => {
  const store = fakeDocStore(["src/a.md", "src/b.md", "memory.md", "overview.md"]);
  // src/b.ts (-> src/b.md) no longer exists; only src/a.ts remains.
  const result = await removeStaleDocs(store, ["src/a.ts"], undefined);
  assert.deepEqual(result, { removed: 1, failed: 0 });
  assert.deepEqual(store.deleted, ["src/b.md"]);
  assert.deepEqual(await store.listDocs(), ["src/a.md", "memory.md", "overview.md"]);
});

test("removeStaleDocs scoped to a subfolder never touches a doc outside it", async () => {
  const store = fakeDocStore(["src/core/a.md", "src/http/gone.md"]);
  // Scoped to src/core: src/http/gone.md's source is also gone, but it's out of scope — must survive.
  const result = await removeStaleDocs(store, ["src/core/a.ts"], "src/core");
  assert.deepEqual(result, { removed: 0, failed: 0 });
  assert.deepEqual(await store.listDocs(), ["src/core/a.md", "src/http/gone.md"]);
});
