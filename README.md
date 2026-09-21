# brain-docgen

Generates BrAIn-format documentation for a project, using a local model (Ollama), a cloud API key
(Anthropic), or any OpenAI-compatible endpoint (OpenAI, Groq, Together, DeepSeek, a local
llama.cpp/vLLM/LM Studio server, ...). It's a client of BrAIn's own HTTP API — it doesn't read/write
project files directly, and BrAIn itself needs no changes to support it.

## Requires

A BrAIn HTTP server running for the target project:

```
brain --mode http --root /path/to/your/project
```

Plus one of:

- **Local**: [Ollama](https://ollama.com) running (`ollama serve`), with a model pulled (e.g. `ollama pull qwen2.5-coder:14b`) — or just run the setup script below, which does both.
- **Anthropic**: an API key (`ANTHROPIC_API_KEY` env var, or `--api-key`).
- **Any OpenAI-compatible endpoint**: its base URL (`--base-url`) and, if it needs one, an API key
  (`--api-key`, or `OPENAI_API_KEY`). This covers OpenAI itself, most other hosted providers, and a
  local server (llama.cpp, vLLM, LM Studio, or even Ollama's own `/v1` endpoint) — "any model" goes
  through this one path.

## Install

**Windows:** double-click **`Install BrAIn-docgen.bat`**.
**macOS/Linux:** run **`./install.sh`**.

Either one installs, builds, links the global `brain-docgen`/`brain-docgen-gui` commands, and adds them to your shell's `PATH` if they aren't already there.

Or by hand:

```
npm install
npm run build
npm link
```

<details><summary>"brain-docgen: command not found" after installing?</summary>

Your terminal's `PATH` doesn't include npm's global folder yet — the installer above fixes this automatically. By hand: Windows — `setx PATH "%PATH%;%APPDATA%\npm"`; macOS/Linux — add `export PATH="$PATH:$(npm config get prefix)/bin"` to your shell's rc file (`~/.zshrc` or `~/.bashrc`). Either way, open a **new** terminal afterward.
</details>

### Local model setup (optional)

```
npm run setup:ollama            # installs Ollama if missing, starts it, pulls qwen3:8b
npm run setup:ollama -- gemma3  # or pull a different model instead
```

macOS/Linux only (installs via Ollama's own official installer script); on Windows, grab it from
[ollama.com/download](https://ollama.com/download) and run `ollama pull <model>` yourself. Safe to
re-run — it skips whatever's already installed/running and only pulls what's missing.

## Use

```
brain-docgen <path> [options]
```

`<path>` is a file or folder inside the target project (relative to its root) — the doc gets
written to the same relative path under `.brain/docs`, with a `.md` extension. Omit it to write
a project-wide `overview.md`.

**Three multi-file modes**, for different needs:

- `--all` — one doc **per file**, generated and written one call at a time, with progress printed
  as it goes. A failure on one file doesn't stop the rest; failures are listed and the process
  exits non-zero if any happened. Good for a doc tree that mirrors the source tree.
- `--sync` — everything `--all` does, plus removes any doc under `<path>` (or the whole project)
  whose source file no longer exists — for re-running after files were deleted or moved, so stale
  docs don't linger. Never touches `memory.md`, `style-guide.md`, or `overview.md`, since those
  aren't generated from a single source file to begin with.
- `--whole` — **one** doc for the whole project (or everything under `<path>`, if given) in a
  single generation pass, with every file's content given to the model together — so it can
  describe how the pieces fit, instead of N isolated per-file summaries that don't know about each
  other. Bounded by `--max-chars` (default 200,000): files are included in tree order until the
  budget runs out, so a very large project may not fit in one pass — lower `--max-chars` and scope
  with `<path>` to document it in sections instead.

| Option | Default | Meaning |
|---|---|---|
| `--all` | off | One doc per file, for every file under `<path>` (or the whole project) |
| `--sync` | off | Same as `--all`, plus deletes docs whose source file is gone |
| `--whole` | off | One doc for everything under `<path>` (or the whole project), generated in a single pass |
| `--max-chars` | `200000` | `--whole` only: character budget for how much source is fed to the model in one call |
| `--brain-url` | `http://localhost:4173` | Where the target project's BrAIn HTTP server is listening |
| `--provider` | `local` | `local` (Ollama), `anthropic`, or `openai` (any OpenAI-compatible endpoint) |
| `--model` | `qwen2.5-coder:14b` (local) / `claude-sonnet-5` (anthropic) / *required* (openai) | Model name |
| `--ollama-host` | `http://localhost:11434` | Ollama's API, `--provider local` only |
| `--base-url` | — | *Required* for `--provider openai` — the endpoint's base URL |
| `--api-key` | `$ANTHROPIC_API_KEY` / `$OPENAI_API_KEY` | Not needed for a keyless local server |
| `--doc-path` | derived from `<path>` (or `overview.md` for `--whole`) | Override where the doc gets written (`--all` ignores this) |

Examples:

```
brain-docgen src/core/docs.ts --provider local
brain-docgen src/core --provider anthropic --model claude-sonnet-5
brain-docgen --provider anthropic
brain-docgen --all --provider local --model qwen2.5-coder:14b
brain-docgen --sync --provider local --model qwen2.5-coder:14b   # regenerate + drop docs for deleted files
brain-docgen --whole --provider local --model qwen2.5-coder:14b
brain-docgen --whole --provider openai --base-url https://api.openai.com/v1 --model gpt-4.1 --api-key sk-...
brain-docgen --provider openai --base-url http://localhost:11434/v1 --model qwen3:8b   # Ollama via its OpenAI-compatible endpoint
```

The generated doc follows BrAIn's own conventions: plain Markdown, `[[wikilink]]`s to related
existing docs, and it's built with the project's `memory.md` and `style-guide.md` (if present) as
context, so it stays consistent with what's already there.

## GUI

A local web form for everything above, instead of flags:

```
brain-docgen-gui [port]   # default 4174
```

Open `http://localhost:4174` (if taken, it tries the next port up, same as BrAIn's own server). Pick a mode (single / `--all` / `--whole` / `--sync`), fill in the
BrAIn URL and model settings, hit Generate — output streams live as it runs. It's a thin front
end: the GUI server spawns the same `brain-docgen` CLI as a child process and streams its
stdout/stderr to the page, so there's no separate generation logic to keep in sync. Non-secret
fields (URLs, provider, model) are remembered per-browser via `localStorage`; API keys are not.

**Model dropdowns are populated live**, not guessed: the Local (Ollama) model field lists whatever
`ollama_host/api/tags` actually reports pulled — refreshes automatically when you change the
Ollama host or switch to that provider. The OpenAI-compatible field has a "Fetch models" button
that queries the given Base URL's `/models` endpoint (works for any server that exposes it —
that's how the model list for your own local endpoint gets populated). Anthropic's is a short
static list of current model IDs, since those aren't something to query for. All three are
`<input list>` + `<datalist>` — still plain text fields, so an unlisted model name works too.

## Staying up to date

Every run (CLI or GUI — the GUI spawns the same CLI) checks, via a quick silent `git` comparison against `origin`, whether your local clone is behind. If it is, it prints an update notice (with the exact `git pull` / `npm install` / `npm run build` command) alongside the normal output. Never blocks or delays a run, and prints nothing if you're offline, not a git repo, or already current.

## How it fits together

```
brain-docgen  --(reads/writes)-->  BrAIn HTTP API (/api/file, /api/doc, ...)  -->  project files
     |
     '--(prompts)--> Ollama (local), Anthropic API, or any OpenAI-compatible endpoint
```

No new BrAIn tools, no BrAIn core changes — this only talks to the `/api/...` surface BrAIn
already exposes for "anything else, like a browser or a custom integration."
