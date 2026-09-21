export const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>BrAIn-docgen — Documentation Generator</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTQiIGZpbGw9IiMwMDAwMDAiLz4KICA8ZGVmcz4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iZ2xvdyIgY3g9IjUwJSIgY3k9IjUwJSIgcj0iNTAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmOGEwMCIgc3RvcC1vcGFjaXR5PSIwLjU1Ii8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2ZmOGEwMCIgc3RvcC1vcGFjaXR5PSIwIi8+CiAgICA8L3JhZGlhbEdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJicmFpblN0cm9rZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjhhMDAiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjYzc5MmZmIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIyNiIgZmlsbD0idXJsKCNnbG93KSIvPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyLDEyKSBzY2FsZSgxLjY2NjcpIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjYnJhaW5TdHJva2UpIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CiAgICA8cGF0aCBkPSJNMTIgMThWNSIgLz4KICAgIDxwYXRoIGQ9Ik0xNSAxM2E0LjE3IDQuMTcgMCAwIDEtMy00IDQuMTcgNC4xNyAwIDAgMS0zIDQiIC8+CiAgICA8cGF0aCBkPSJNMTcuNTk4IDYuNUEzIDMgMCAxIDAgMTIgNWEzIDMgMCAxIDAtNS41OTggMS41IiAvPgogICAgPHBhdGggZD0iTTE3Ljk5NyA1LjEyNWE0IDQgMCAwIDEgMi41MjYgNS43NyIgLz4KICAgIDxwYXRoIGQ9Ik0xOCAxOGE0IDQgMCAwIDAgMi03LjQ2NCIgLz4KICAgIDxwYXRoIGQ9Ik0xOS45NjcgMTcuNDgzQTQgNCAwIDEgMSAxMiAxOGE0IDQgMCAxIDEtNy45NjctLjUxNyIgLz4KICAgIDxwYXRoIGQ9Ik02IDE4YTQgNCAwIDAgMS0yLTcuNDY0IiAvPgogICAgPHBhdGggZD0iTTYuMDAzIDUuMTI1YTQgNCAwIDAgMC0yLjUyNiA1Ljc3IiAvPgogIDwvZz4KPC9zdmc+Cg==" />
<style>
  /* Copied wholesale from BrAIn's own GUI (public/index.html) — same glass panel, floating
     lights, tabs, header input, toolbar/label/input pattern, focus/scrollbar treatment. Only the
     data changed: --green (BrAIn's single accent) is split into --orange (primary, used the same
     way BrAIn uses green — as filled background on active/hover state) and --purple (secondary),
     and the light blobs are recolored to match. */
  :root {
    --bg:#000000; --text:#fdece0; --muted:#a68f7d; --orange:#ff8a00; --purple:#c792ff;
    --glass:rgba(10,6,3,0.30); --glass-border:rgba(255,138,0,0.20); --glass-hover:rgba(255,138,0,0.12);
    --radius:4px;
  }
  * { box-sizing: border-box; }
  html, body { height:100%; }
  body {
    margin:0; font-family: system-ui, sans-serif; color:var(--text); display:flex; gap:16px; padding:16px;
    overflow:hidden auto; position:relative; background:var(--bg); min-height:100%;
  }
  .lights { position:fixed; inset:0; z-index:-1; overflow:hidden; pointer-events:none; }
  .light {
    position:absolute; border-radius:50%; filter:blur(70px); will-change:transform;
    animation-timing-function:ease-in-out; animation-iteration-count:infinite;
  }
  .light.l1 { top:calc(20vh - 630px); left:-622px; width:1260px; height:1260px; opacity:.8;
    background:radial-gradient(circle, rgba(255,138,0,0.8), transparent 58%);
    animation-name:drift1; animation-duration:22s; }
  .light.l2 { top:-532px; left:calc(60vw - 540px); width:1080px; height:1080px; opacity:.78;
    background:radial-gradient(circle, rgba(199,146,255,0.8), transparent 58%);
    animation-name:drift2; animation-duration:27s; animation-delay:-6s; }
  .light.l3 { top:calc(75vh - 720px); left:calc(100vw - 728px); width:1440px; height:1440px; opacity:.72;
    background:radial-gradient(circle, rgba(255,138,0,0.72), transparent 58%);
    animation-name:drift3; animation-duration:19s; animation-delay:-11s; }
  .light.l4 { top:calc(100vh - 458px); left:calc(20vw - 450px); width:900px; height:900px; opacity:.78;
    background:radial-gradient(circle, rgba(230,110,0,0.8), transparent 58%);
    animation-name:drift1; animation-duration:25s; animation-delay:-4s; }
  .light.l5 { top:calc(55vh - 390px); left:-86px; width:780px; height:780px; opacity:.72;
    background:radial-gradient(circle, rgba(210,170,255,0.75), transparent 58%);
    animation-name:drift2; animation-duration:16s; animation-delay:-9s; }
  .light.l6 { top:calc(15vh - 330px); left:-26px; width:660px; height:660px; opacity:.68;
    background:radial-gradient(circle, rgba(255,138,0,0.7), transparent 58%);
    animation-name:drift3; animation-duration:21s; animation-delay:-14s; }
  @keyframes drift1 {
    0%   { transform:translate(0, 0) scale(1); }
    25%  { transform:translate(6%, 8%) scale(1.12); }
    55%  { transform:translate(-4%, 12%) scale(0.94); }
    80%  { transform:translate(-8%, -3%) scale(1.05); }
    100% { transform:translate(0, 0) scale(1); }
  }
  @keyframes drift2 {
    0%   { transform:translate(0, 0) scale(1); }
    30%  { transform:translate(-9%, 5%) scale(1.08); }
    60%  { transform:translate(-3%, -10%) scale(0.92); }
    85%  { transform:translate(7%, 4%) scale(1.1); }
    100% { transform:translate(0, 0) scale(1); }
  }
  @keyframes drift3 {
    0%   { transform:translate(0, 0) scale(1); }
    20%  { transform:translate(5%, -7%) scale(0.95); }
    50%  { transform:translate(10%, 6%) scale(1.1); }
    75%  { transform:translate(-6%, 9%) scale(1); }
    100% { transform:translate(0, 0) scale(1); }
  }
  @media (prefers-reduced-motion: reduce) { .light { animation:none; } }
  main {
    max-width:760px; margin:0 auto; flex:1; display:flex; flex-direction:column; overflow:hidden;
    background:var(--glass); backdrop-filter: blur(28px) saturate(140%); -webkit-backdrop-filter: blur(28px) saturate(140%);
    border:1px solid var(--glass-border); border-radius:var(--radius);
    box-shadow: 0 24px 60px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,138,0,0.08);
  }
  header { padding:12px 20px; border-bottom:1px solid var(--glass-border); display:flex; gap:12px; align-items:center; }
  header input {
    flex:1; background:#000000; border:1px solid var(--glass-border); color:var(--text);
    padding:8px 16px; border-radius:var(--radius); font-size:13px; font-family:ui-monospace,monospace;
    transition:border-color .15s ease, box-shadow .15s ease;
  }
  header input:focus { outline:none; border-color:var(--orange); box-shadow:0 0 0 3px rgba(255,138,0,0.15); }
  ::selection { background:rgba(255,138,0,0.35); color:var(--text); }
  ::placeholder { color:var(--muted); opacity:1; }
  input, select { caret-color:var(--orange); }
  html { scrollbar-color:var(--glass-border) transparent; scrollbar-width:thin; }
  .tab:focus-visible, .toolbar button:focus-visible { outline:2px solid var(--orange); outline-offset:2px; }
  .tabs { display:flex; gap:6px; padding:14px 16px 0; flex-wrap:wrap; }
  .tab {
    padding:8px 16px; border-radius:var(--radius); cursor:pointer; color:var(--muted); font-size:13px; font-weight:500;
    border:1px solid transparent; white-space:nowrap; flex:none;
    transition:background .2s ease, color .2s ease, border-color .2s ease;
  }
  .tab:hover { background:var(--glass-hover); color:var(--text); }
  .tab.active { background:var(--orange); color:#000000; border-color:var(--orange); }
  #content { flex:1; overflow:auto; padding:20px; font-family: system-ui, sans-serif; font-size:13px; }
  label { display:block; font-size:13px; color:var(--muted); margin:0 0 14px; }
  label > span { color:var(--purple); text-transform:uppercase; font-size:11px; letter-spacing:.04em; display:block; margin-bottom:6px; }
  select, label input {
    display:block; width:100%; background:#000000; border:1px solid var(--glass-border);
    color:var(--text); padding:8px 12px; border-radius:var(--radius); font-size:13px; font-family:ui-monospace,monospace;
  }
  select:focus, label input:focus { outline:none; border-color:var(--orange); box-shadow:0 0 0 3px rgba(255,138,0,0.15); }
  .hint { color:var(--purple); font-size:12px; margin:-8px 0 14px; }
  .toolbar { display:flex; gap:8px; margin-bottom:14px; }
  .toolbar button {
    background:#000000; border:1px solid var(--glass-border); color:var(--text);
    padding:10px 16px; border-radius:var(--radius); cursor:pointer; font-size:13px; font-weight:600; font-family:system-ui,sans-serif;
    flex:1; transition:background .15s ease, color .15s ease, border-color .15s ease, transform .1s ease;
  }
  .toolbar button:hover { background:var(--orange); color:#000000; border-color:var(--orange); }
  .toolbar button:active { transform:scale(0.98); }
  .toolbar button:disabled { opacity:.5; cursor:default; }
  .toolbar button:disabled:hover { background:#000000; color:var(--text); border-color:var(--glass-border); }
  .toolbar input {
    flex:1; min-width:0; background:#000000; border:1px solid var(--glass-border); color:var(--text);
    padding:8px 12px; border-radius:var(--radius); font-size:13px; font-family:ui-monospace,monospace;
  }
  .toolbar input:focus { outline:none; border-color:var(--orange); box-shadow:0 0 0 3px rgba(255,138,0,0.15); }
  #progress { height:6px; border-radius:3px; background:var(--glass-border); overflow:hidden; margin:0 0 10px; }
  #progressBar { height:100%; width:100%; transform:scaleX(0); transform-origin:left; background:var(--orange); transition:transform 200ms ease-out; }
  #out {
    background:#000000; border:1px solid var(--glass-border); border-radius:var(--radius); padding:12px;
    font-family:ui-monospace,monospace; font-size:12px; white-space:pre-wrap; min-height:120px; max-height:360px; overflow:auto;
  }
  @keyframes savedFlash {
    0% { box-shadow:0 0 0 3px rgba(255,138,0,0.35); }
    100% { box-shadow:0 0 0 3px rgba(255,138,0,0); }
  }
  .saved-flash { animation:savedFlash 450ms ease-out; }
  @media (prefers-reduced-motion: reduce) { .saved-flash { animation:none; } }
  ::-webkit-scrollbar { width:10px; height:10px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--glass-border); border-radius:var(--radius); }
  ::-webkit-scrollbar-thumb:hover { background:var(--orange); }
  @media (max-width: 860px) { body { padding:8px; gap:8px; } }
  @media (pointer: coarse) { .tab, .toolbar button { min-height:44px; } }
</style>
</head>
<body>
<div class="lights" aria-hidden="true">
  <span class="light l1"></span>
  <span class="light l2"></span>
  <span class="light l3"></span>
  <span class="light l4"></span>
  <span class="light l5"></span>
  <span class="light l6"></span>
</div>
<main>
  <div class="tabs" role="tablist" aria-label="Mode" id="modes">
    <div class="tab active" data-mode="single" role="tab" aria-selected="true" tabindex="0">Single file/folder</div>
    <div class="tab" data-mode="all" role="tab" aria-selected="false" tabindex="-1">All files (--all)</div>
    <div class="tab" data-mode="whole" role="tab" aria-selected="false" tabindex="-1">Whole codebase (--whole)</div>
    <div class="tab" data-mode="sync" role="tab" aria-selected="false" tabindex="-1">Full sync (--sync)</div>
  </div>
  <header>
    <input id="target" placeholder="Target path (relative to project root, blank = whole project)" />
  </header>
  <div id="content">
    <p class="hint" id="syncHint" style="display:none">One doc per file, full coverage, plus removes any doc whose source file no longer exists.</p>
    <div class="toolbar" id="docPathRow">
      <input id="docPath" placeholder="Doc path override (optional, leave blank to derive from target)" />
    </div>
    <div class="toolbar" id="maxCharsRow" style="display:none">
      <input id="maxChars" type="number" value="200000" placeholder="Max chars (--whole only)" />
    </div>
    <div class="toolbar" id="concurrencyRow" style="display:none">
      <label><span>Concurrency</span><input id="concurrency" type="number" min="1" value="1" /></label>
    </div>
    <label id="dryRunRow"><input id="dryRun" type="checkbox" /> <span>Dry run (list what would happen, no API calls)</span></label>

    <label><span>BrAIn server</span><input id="brainUrl" value="http://localhost:4173" /></label>

    <label><span>Provider</span>
      <select id="provider">
        <option value="local">Local (Ollama)</option>
        <option value="anthropic">Anthropic</option>
        <option value="openai">OpenAI-compatible (any endpoint)</option>
      </select>
    </label>

    <div data-provider="local">
      <label><span>Ollama host</span><input id="ollamaHost" value="http://localhost:11434" /></label>
      <label><span>Model</span><input id="modelLocal" list="modelLocalOptions" value="qwen3:8b" /></label>
      <datalist id="modelLocalOptions"></datalist>
    </div>

    <div data-provider="anthropic" style="display:none">
      <label><span>Model</span><input id="modelAnthropic" list="modelAnthropicOptions" value="claude-sonnet-5" /></label>
      <datalist id="modelAnthropicOptions">
        <option value="claude-sonnet-5"></option>
        <option value="claude-opus-5"></option>
        <option value="claude-fable-5-1"></option>
        <option value="claude-haiku-4-5-20251001"></option>
      </datalist>
      <label><span>API key</span><input id="apiKeyAnthropic" type="password" placeholder="leave blank to use $ANTHROPIC_API_KEY on the server" /></label>
    </div>

    <div data-provider="openai" style="display:none">
      <label><span>Base URL</span><input id="baseUrl" placeholder="http://192.168.1.x:8888/v1" /></label>
      <label><span>Model</span>
        <div class="toolbar">
          <input id="modelOpenai" list="modelOpenaiOptions" placeholder="unsloth/Qwen3.5-9B-GGUF" />
          <button type="button" id="fetchOpenaiModels" style="flex:none">Fetch models</button>
        </div>
      </label>
      <p class="hint">Fill in Base URL (and API key, if needed) first, then Fetch models.</p>
      <datalist id="modelOpenaiOptions"></datalist>
      <label><span>API key</span><input id="apiKeyOpenai" type="password" placeholder="optional for a keyless server" /></label>
    </div>

    <div class="toolbar"><button id="run">Generate</button><button type="button" id="stop" style="display:none">Stop</button></div>
    <div id="progress" style="display:none"><div id="progressBar"></div></div>
    <pre id="out"></pre>
  </div>
</main>

<script>
  const $ = (id) => document.getElementById(id);
  const modesEl = $("modes");
  let mode = "single";

  modesEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab[data-mode]");
    if (!btn) return;
    mode = btn.dataset.mode;
    [...modesEl.children].forEach((b) => {
      const active = b === btn;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
      b.tabIndex = active ? 0 : -1;
    });
    $("docPathRow").style.display = mode === "all" || mode === "sync" ? "none" : "";
    $("maxCharsRow").style.display = mode === "whole" ? "" : "none";
    $("concurrencyRow").style.display = mode === "all" || mode === "sync" ? "" : "none";
    $("syncHint").style.display = mode === "sync" ? "" : "none";
  });

  $("provider").addEventListener("change", () => {
    const p = $("provider").value;
    document.querySelectorAll("[data-provider]").forEach((el) => {
      el.style.display = el.dataset.provider === p ? "" : "none";
    });
    if (p === "local") refreshLocalModels();
  });

  async function populateDatalist(datalistId, url) {
    const dl = $(datalistId);
    try {
      const res = await fetch(url);
      const data = await res.json();
      dl.innerHTML = "";
      for (const m of data.models || []) {
        const opt = document.createElement("option");
        opt.value = m;
        dl.appendChild(opt);
      }
    } catch {
      // offline / unreachable — leave whatever options are already there (or none); the model
      // field is still a plain text input either way, nothing breaks.
    }
  }

  function refreshLocalModels() {
    populateDatalist("modelLocalOptions", "/api/models?provider=local&host=" + encodeURIComponent($("ollamaHost").value));
  }
  $("ollamaHost").addEventListener("change", refreshLocalModels);

  $("fetchOpenaiModels").addEventListener("click", () => {
    const params = new URLSearchParams({ provider: "openai", baseUrl: $("baseUrl").value });
    if ($("apiKeyOpenai").value) params.set("apiKey", $("apiKeyOpenai").value);
    populateDatalist("modelOpenaiOptions", "/api/models?" + params.toString());
  });

  // Remembers everything except API keys — plain per-browser convenience, not a secrets store.
  const REMEMBER = ["target", "docPath", "brainUrl", "provider", "ollamaHost", "modelLocal", "modelAnthropic", "baseUrl", "modelOpenai"];
  for (const id of REMEMBER) {
    try {
      const saved = localStorage.getItem("brain-docgen:" + id);
      if (saved !== null) $(id).value = saved;
    } catch {}
  }
  $("provider").dispatchEvent(new Event("change"));

  function currentBody() {
    const provider = $("provider").value;
    const body = { target: $("target").value || undefined, mode, brainUrl: $("brainUrl").value || undefined, provider };
    if (mode === "whole") body.maxChars = Number($("maxChars").value) || undefined;
    if (mode === "all" || mode === "sync") body.concurrency = Number($("concurrency").value) || undefined;
    body.dryRun = $("dryRun").checked || undefined;
    if (mode !== "all" && mode !== "sync") body.docPath = $("docPath").value || undefined;
    if (provider === "local") {
      body.ollamaHost = $("ollamaHost").value || undefined;
      body.model = $("modelLocal").value || undefined;
    } else if (provider === "anthropic") {
      body.model = $("modelAnthropic").value || undefined;
      body.apiKey = $("apiKeyAnthropic").value || undefined;
    } else {
      body.baseUrl = $("baseUrl").value || undefined;
      body.model = $("modelOpenai").value || undefined;
      body.apiKey = $("apiKeyOpenai").value || undefined;
    }
    return body;
  }

  let controller = null;

  $("stop").addEventListener("click", () => {
    if (controller) controller.abort();
  });

  $("run").addEventListener("click", async () => {
    for (const id of REMEMBER) {
      try { localStorage.setItem("brain-docgen:" + id, $(id).value); } catch {}
    }
    const runBtn = $("run");
    const stopBtn = $("stop");
    const out = $("out");
    const progress = $("progress");
    const progressBar = $("progressBar");
    runBtn.disabled = true;
    stopBtn.style.display = "";
    out.textContent = "";
    progress.style.display = "none";
    progressBar.style.transform = "scaleX(0)";
    controller = new AbortController();
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentBody()),
        signal: controller.signal,
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        out.textContent += chunk;
        out.scrollTop = out.scrollHeight;
        const matches = [...chunk.matchAll(/\[(\d+)\/(\d+)\]/g)];
        if (matches.length) {
          const [, done_, total_] = matches[matches.length - 1];
          progress.style.display = "";
          progressBar.style.transform = "scaleX(" + Number(done_) / Number(total_) + ")";
        }
      }
      out.classList.remove("saved-flash");
      void out.offsetWidth;
      out.classList.add("saved-flash");
    } catch (e) {
      out.textContent += "\\n" + (e.name === "AbortError" ? "[stopped]" : e.message);
    } finally {
      runBtn.disabled = false;
      stopBtn.style.display = "none";
      controller = null;
    }
  });
</script>
</body>
</html>
`;
