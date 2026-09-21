import { BrainClient } from "./brain-client.js";
import { buildPrompt, buildWholeCodebaseText, docPathFor, FileContent, WHOLE_CODEBASE_CHAR_BUDGET } from "./prompt.js";
import { flattenFiles } from "./tree.js";
import { Provider } from "./providers/types.js";
import { OllamaProvider } from "./providers/ollama.js";
import { AnthropicProvider } from "./providers/anthropic.js";
import { OpenAICompatibleProvider } from "./providers/openai-compatible.js";

const VALUE_FLAGS = ["--target", "--brain-url", "--provider", "--model", "--ollama-host", "--api-key", "--doc-path", "--base-url", "--max-chars", "--concurrency"];
const BOOLEAN_FLAGS = ["--all", "--whole", "--sync", "--dry-run"];

// Docs not tied 1:1 to a source file — --sync's stale-doc cleanup must never touch these.
const PROTECTED_DOCS = new Set(["memory.md", "style-guide.md", "overview.md"]);

export function parseArgs(args: string[] = process.argv.slice(2)) {
  const values = new Map<string, string>();
  let positional: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (VALUE_FLAGS.includes(a)) {
      values.set(a, args[++i]);
    } else if (BOOLEAN_FLAGS.includes(a)) {
      // no value to consume
    } else if (!a.startsWith("--") && positional === undefined) {
      positional = a;
    }
  }
  return {
    target: values.get("--target") ?? positional,
    all: args.includes("--all"),
    whole: args.includes("--whole"),
    sync: args.includes("--sync"),
    dryRun: args.includes("--dry-run"),
    concurrency: Number(values.get("--concurrency") ?? 1),
    brainUrl: values.get("--brain-url") ?? "http://localhost:4173",
    provider: values.get("--provider") ?? "local",
    model: values.get("--model"),
    ollamaHost: values.get("--ollama-host") ?? "http://localhost:11434",
    baseUrl: values.get("--base-url"),
    apiKey: values.get("--api-key") ?? process.env.ANTHROPIC_API_KEY ?? process.env.OPENAI_API_KEY,
    docPath: values.get("--doc-path"),
    maxChars: values.has("--max-chars") ? Number(values.get("--max-chars")) : WHOLE_CODEBASE_CHAR_BUDGET,
  };
}

function providerLabel(provider: string): string {
  return provider === "local" ? "Ollama" : provider === "openai" ? "OpenAI-compatible API" : "Anthropic API";
}

function makeProvider(opts: ReturnType<typeof parseArgs>): Provider {
  switch (opts.provider) {
    case "local":
      return new OllamaProvider(opts.ollamaHost, opts.model ?? "qwen2.5-coder:14b");
    case "api": // kept as an alias for "anthropic" — the name this tool shipped with first
    case "anthropic":
      if (!opts.apiKey) throw new Error(`--provider ${opts.provider} needs --api-key or ANTHROPIC_API_KEY set`);
      return new AnthropicProvider(opts.apiKey, opts.model ?? "claude-sonnet-5");
    case "openai":
      if (!opts.baseUrl) throw new Error('--provider openai needs --base-url (e.g. https://api.openai.com/v1, or any OpenAI-compatible endpoint — including a local server)');
      if (!opts.model) throw new Error("--provider openai needs --model");
      return new OpenAICompatibleProvider(opts.baseUrl, opts.apiKey, opts.model);
    default:
      throw new Error(`Unknown --provider "${opts.provider}". Use "local" (Ollama), "anthropic", or "openai" (any OpenAI-compatible endpoint).`);
  }
}

/** Reads the target as a file; if it's actually a folder (readFile throws), falls back to a
 *  shallow (one-level) listing so a folder can be documented without needing every file's content. */
async function readTarget(brain: BrainClient, target: string): Promise<string> {
  try {
    return await brain.readFile(target);
  } catch {
    try {
      const node = await brain.listFiles(target);
      return (node.children ?? []).map((e) => `${e.type === "dir" ? "dir " : "file"}  ${e.path}`).join("\n");
    } catch {
      throw new Error(`"${target}" doesn't exist in this project — check the path (relative to the project root passed to --brain-url's server).`);
    }
  }
}

async function generateOne(brain: BrainClient, provider: Provider, target: string, docPathOverride?: string): Promise<string> {
  const [targetContent, memory, styleGuide, existingDocs] = await Promise.all([
    readTarget(brain, target),
    brain.readDocOrEmpty("memory.md"),
    brain.readDocOrEmpty("style-guide.md"),
    brain.listDocs(),
  ]);
  const { system, user } = buildPrompt({ targetPath: target, targetContent, memory, styleGuide, existingDocs });
  const content = await provider.generate(system, user);
  const docPath = docPathOverride ?? (target === "." ? "overview.md" : docPathFor(target));
  await brain.writeDoc(docPath, content);
  return docPath;
}

/** One doc per file, generated and written one at a time — full coverage regardless of size,
 *  unlike --whole which is bounded by a char budget. Used by both --all and --sync. */
async function generateAllFiles(brain: BrainClient, provider: Provider, targets: string[], concurrency = 1): Promise<{ done: number; failed: number }> {
  let done = 0;
  let failed = 0;
  let next = 0;
  async function worker(): Promise<void> {
    for (;;) {
      const i = next++;
      if (i >= targets.length) return;
      const target = targets[i];
      try {
        const docPath = await generateOne(brain, provider, target);
        done++;
        console.log(`[${i + 1}/${targets.length}] ${target} -> ${docPath}`);
      } catch (e) {
        failed++;
        console.error(`[${i + 1}/${targets.length}] ${target}: ${(e as Error).message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrency, targets.length)) }, worker));
  return { done, failed };
}

interface DocStore {
  listDocs(): Promise<string[]>;
  deleteDoc(path: string): Promise<void>;
}

/** Removes docs that no longer have a matching source file — e.g. a file was renamed or deleted
 *  since the last --sync. Never touches memory.md/style-guide.md/overview.md (not derived from a
 *  single source file), and — when scoped to a subfolder — never touches a doc outside that
 *  subfolder either, since `targets` (and so `currentDocPaths`) only cover what was scanned.
 *  Takes just the two methods it needs (not the full BrainClient) so it's testable with a fake,
 *  no real BrAIn server required. */
export async function removeStaleDocs(brain: DocStore, targets: string[], scope: string | undefined, dryRun = false): Promise<{ removed: number; failed: number }> {
  const currentDocPaths = new Set(targets.map(docPathFor));
  const scopePrefix = scope && scope !== "." ? `${scope}/` : undefined;
  const existingDocs = await brain.listDocs();
  const stale = existingDocs.filter((d) => (!scopePrefix || d.startsWith(scopePrefix)) && !currentDocPaths.has(d) && !PROTECTED_DOCS.has(d));
  let removed = 0;
  let failed = 0;
  for (const doc of stale) {
    if (dryRun) {
      console.log(`Would remove stale doc: ${doc}`);
      removed++;
      continue;
    }
    try {
      await brain.deleteDoc(doc);
      removed++;
      console.log(`Removed stale doc: ${doc}`);
    } catch (e) {
      failed++;
      console.error(`Failed to remove stale doc ${doc}: ${(e as Error).message}`);
    }
  }
  return { removed, failed };
}

/** One generation pass over the whole codebase (or everything under `scope`) instead of one call
 *  per file — the model sees every file together, so it can describe how they relate instead of
 *  N isolated summaries that don't know about each other. Writes a single doc. */
async function generateWhole(brain: BrainClient, provider: Provider, scope: string | undefined, docPathOverride: string | undefined, maxChars: number, dryRun = false): Promise<{ docPath: string; included: number; total: number }> {
  const targets = flattenFiles(await brain.listFiles(scope ?? "."));
  const docPath = docPathOverride ?? "overview.md";
  if (dryRun) {
    // No char budget can be computed without reading file content, so a dry run reports the
    // candidate file count only — the real run may include fewer if --max-chars cuts it short.
    return { docPath, included: targets.length, total: targets.length };
  }
  const files = (
    await Promise.all(
      targets.map(async (path): Promise<FileContent | null> => {
        try {
          return { path, content: await brain.readFile(path) };
        } catch {
          return null; // unreadable (e.g. binary) — skip rather than fail the whole run
        }
      }),
    )
  ).filter((f): f is FileContent => f !== null);

  const { text, included } = buildWholeCodebaseText(files, maxChars);
  const [memory, styleGuide, existingDocs] = await Promise.all([brain.readDocOrEmpty("memory.md"), brain.readDocOrEmpty("style-guide.md"), brain.listDocs()]);
  const { system, user } = buildPrompt({ targetPath: `entire project (${included} files)`, targetContent: text, memory, styleGuide, existingDocs }, maxChars);
  const content = await provider.generate(system, user);
  await brain.writeDoc(docPath, content);
  return { docPath, included, total: targets.length };
}

export async function main(): Promise<void> {
  const opts = parseArgs();
  const brain = new BrainClient(opts.brainUrl);
  const provider = makeProvider(opts);
  const via = providerLabel(opts.provider);

  if (opts.whole) {
    const { docPath, included, total } = await generateWhole(brain, provider, opts.target, opts.docPath, opts.maxChars, opts.dryRun);
    const note = included < total ? ` (${included}/${total} files fit the --max-chars budget)` : ` (${included} files)`;
    console.log(`${opts.dryRun ? "Would write" : "Doc written"}: ${docPath} (via ${via})${note}`);
    return;
  }

  if (opts.all || opts.sync) {
    const targets = flattenFiles(await brain.listFiles(opts.target ?? "."));
    console.log(`${targets.length} file${targets.length === 1 ? "" : "s"} to document (via ${via}).`);

    if (opts.dryRun) {
      for (const t of targets) console.log(`  ${t} -> ${docPathFor(t)}`);
      if (opts.sync) {
        const { removed } = await removeStaleDocs(brain, targets, opts.target, true);
        console.log(`Sync: ${removed} stale doc${removed === 1 ? "" : "s"} would be removed.`);
      }
      return;
    }

    const { done, failed: genFailed } = await generateAllFiles(brain, provider, targets, opts.concurrency);
    console.log(`Done: ${done} written, ${genFailed} failed.`);
    let failed = genFailed;

    if (opts.sync) {
      const { removed, failed: removeFailed } = await removeStaleDocs(brain, targets, opts.target);
      console.log(`Sync: ${removed} stale doc${removed === 1 ? "" : "s"} removed, ${removeFailed} failed to remove.`);
      failed += removeFailed;
    }

    if (failed > 0) process.exitCode = 1;
    return;
  }

  const target = opts.target ?? ".";
  const docPath = opts.docPath ?? (target === "." ? "overview.md" : docPathFor(target));
  if (opts.dryRun) {
    console.log(`Would write: ${docPath} (via ${via})`);
    return;
  }
  await generateOne(brain, provider, target, opts.docPath);
  console.log(`Doc written: ${docPath} (via ${via})`);
}
