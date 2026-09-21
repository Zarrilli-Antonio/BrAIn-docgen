#!/usr/bin/env node
import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCliArgs } from "./gui-args.js";
import { PAGE } from "./gui-page.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.join(__dirname, "index.js");

/** Backs the GUI's model dropdowns: asks the provider itself which models it actually has,
 *  instead of a hardcoded guess. `local` hits Ollama's own /api/tags; `openai` hits the
 *  OpenAI-compatible /models endpoint any such server exposes (this is how "what models does
 *  your local llama.cpp/vLLM/unsloth server have loaded" gets answered generically). */
async function fetchModels(url: URL): Promise<string[]> {
  const provider = url.searchParams.get("provider");
  if (provider === "local") {
    const host = (url.searchParams.get("host") || "http://localhost:11434").replace(/\/$/, "");
    const res = await fetch(`${host}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
    const data = (await res.json()) as { models?: { name: string }[] };
    return (data.models ?? []).map((m) => m.name);
  }
  if (provider === "openai") {
    const baseUrl = url.searchParams.get("baseUrl")?.replace(/\/$/, "");
    if (!baseUrl) throw new Error("baseUrl required");
    const apiKey = url.searchParams.get("apiKey") || undefined;
    const res = await fetch(`${baseUrl}/models`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`Endpoint returned ${res.status}`);
    const data = (await res.json()) as { data?: { id: string }[] };
    return (data.data ?? []).map((m) => m.id);
  }
  throw new Error(`Unknown provider "${provider}"`);
}

/** Local GUI for brain-docgen: a form that posts to /api/run, which spawns the already-built CLI
 *  (dist/index.js) as a child process and streams its stdout/stderr straight to the response —
 *  no duplicated generation logic, the GUI is just a front end for the same CLI. */
function startServer(port: number, attemptsLeft = 20): void {
  const server = http.createServer((req, res) => {
    if (req.method === "GET" && (req.url === "/" || req.url === "")) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(PAGE);
      return;
    }
    if (req.method === "GET" && req.url?.startsWith("/api/models")) {
      const url = new URL(req.url, "http://localhost");
      fetchModels(url)
        .then((models) => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ models }));
        })
        .catch((e) => {
          // A dropdown with no suggestions yet (offline server, wrong URL, not started) isn't an
          // error state for the page — it's still a plain text input, just without hints.
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ models: [], error: String((e as Error).message ?? e) }));
        });
      return;
    }
    if (req.method === "POST" && req.url === "/api/run") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(body || "{}");
        } catch {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Invalid JSON body");
          return;
        }
        const args = buildCliArgs(parsed as Parameters<typeof buildCliArgs>[0]);
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.write(`$ brain-docgen ${args.map((a) => (a.includes(" ") ? `"${a}"` : a)).join(" ")}\n\n`);
        const child = spawn(process.execPath, [CLI_PATH, ...args]);
        req.on("close", () => child.kill());
        child.stdout.on("data", (d) => res.write(d));
        child.stderr.on("data", (d) => res.write(d));
        child.on("error", (e) => res.write(`\nFailed to start: ${e.message}\n`));
        child.on("close", (code) => {
          if (!res.writableEnded) {
            res.write(`\n[exit ${code}]\n`);
            res.end();
          }
        });
      });
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  });
  server.listen(port, () => console.log(`brain-docgen GUI at http://localhost:${port}`));
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && attemptsLeft > 0) {
      startServer(port + 1, attemptsLeft - 1);
      return;
    }
    throw err;
  });
}

const port = Number(process.argv[2] ?? process.env.PORT ?? 4174);
startServer(port);
