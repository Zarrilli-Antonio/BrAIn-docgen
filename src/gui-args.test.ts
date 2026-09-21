import test from "node:test";
import assert from "node:assert/strict";
import { buildCliArgs } from "./gui-args.js";

test("buildCliArgs turns a single-file request into the matching CLI argv", () => {
  const args = buildCliArgs({ target: "src/core/docs.ts", mode: "single", provider: "local", model: "qwen3:8b" });
  assert.deepEqual(args, ["src/core/docs.ts", "--provider", "local", "--model", "qwen3:8b"]);
});

test("buildCliArgs sets --all, --whole, or --sync from mode, and omits all three for single", () => {
  assert.deepEqual(buildCliArgs({ mode: "all" }), ["--all"]);
  assert.deepEqual(buildCliArgs({ mode: "whole", maxChars: 50_000 }), ["--whole", "--max-chars", "50000"]);
  assert.deepEqual(buildCliArgs({ mode: "sync" }), ["--sync"]);
  assert.deepEqual(buildCliArgs({ mode: "single" }), []);
});

test("buildCliArgs passes through openai-provider fields", () => {
  const args = buildCliArgs({
    mode: "single",
    provider: "openai",
    baseUrl: "http://192.168.1.197:8888/v1",
    model: "unsloth/Qwen3.5-9B-GGUF",
    apiKey: "sk-x",
  });
  assert.deepEqual(args, ["--provider", "openai", "--model", "unsloth/Qwen3.5-9B-GGUF", "--base-url", "http://192.168.1.197:8888/v1", "--api-key", "sk-x"]);
});

test("buildCliArgs omits empty/undefined fields", () => {
  assert.deepEqual(buildCliArgs({}), []);
});
