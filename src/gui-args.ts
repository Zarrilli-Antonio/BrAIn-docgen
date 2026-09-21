export interface RunRequest {
  target?: string;
  mode?: "single" | "all" | "whole" | "sync";
  brainUrl?: string;
  provider?: string;
  model?: string;
  ollamaHost?: string;
  baseUrl?: string;
  apiKey?: string;
  docPath?: string;
  maxChars?: number;
}

/** Turns a JSON request from the GUI into the same argv the CLI already takes — one code path,
 *  no argv-string quoting to get wrong (spawn takes an array, so no shell is involved at all). */
export function buildCliArgs(body: RunRequest): string[] {
  const args: string[] = [];
  if (body.target) args.push(body.target);
  if (body.mode === "all") args.push("--all");
  if (body.mode === "whole") args.push("--whole");
  if (body.mode === "sync") args.push("--sync");
  if (body.brainUrl) args.push("--brain-url", body.brainUrl);
  if (body.provider) args.push("--provider", body.provider);
  if (body.model) args.push("--model", body.model);
  if (body.ollamaHost) args.push("--ollama-host", body.ollamaHost);
  if (body.baseUrl) args.push("--base-url", body.baseUrl);
  if (body.apiKey) args.push("--api-key", body.apiKey);
  if (body.docPath) args.push("--doc-path", body.docPath);
  if (body.maxChars) args.push("--max-chars", String(body.maxChars));
  return args;
}
