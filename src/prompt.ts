export interface PromptInput {
  targetPath: string;
  targetContent: string;
  memory: string;
  styleGuide: string;
  existingDocs: string[];
}

const SYSTEM_PROMPT = `You are a documentation writer for the BrAIn project explorer. You write concise, accurate
Markdown docs describing a codebase — either one file/folder, or (when given several files marked
"--- path ---") the whole project, in which case you should describe how the pieces relate, not
just list them one by one. Rules:
- Output only the Markdown body of the doc — no surrounding commentary, no code fences around the whole thing.
- Link to related existing docs with [[wikilink]] syntax when relevant (use the doc name without the .md extension).
- Be concrete: name real functions, files, and behavior you were given — never invent APIs that aren't in the source.
- Keep it short: what this code is for, how it fits the rest of the project, anything a future reader would
  otherwise have to re-derive by reading the source.`;

/** Pure prompt builder, kept separate from any network call so it's testable without hitting a
 *  real model or a real BrAIn server. `maxTargetChars` guards a single file's prompt from
 *  blowing the context by accident; whole-codebase mode passes its own (much larger) budget,
 *  already enforced by buildWholeCodebaseText, so it isn't re-truncated here. */
export function buildPrompt(input: PromptInput, maxTargetChars = 20_000): { system: string; user: string } {
  const sections = [`# Target: ${input.targetPath}`, "", "```", input.targetContent.slice(0, maxTargetChars), "```"];
  if (input.memory.trim()) sections.push("", "# Project memory (always keep in mind)", input.memory.trim());
  if (input.styleGuide.trim()) sections.push("", "# Style guide", input.styleGuide.trim());
  if (input.existingDocs.length) sections.push("", "# Existing docs (link to these with [[wikilink]] where relevant)", input.existingDocs.map((d) => `- ${d.replace(/\.md$/i, "")}`).join("\n"));
  sections.push("", "Write the documentation for the target above.");
  return { system: SYSTEM_PROMPT, user: sections.join("\n") };
}

/** Where the generated doc for a given source file lives under `.brain/docs` — same relative
 *  path, `.md` instead of the source extension, so a project's doc tree mirrors its source tree. */
export function docPathFor(targetPath: string): string {
  return targetPath.replace(/\.[^./\\]+$/, "") + ".md";
}

export interface FileContent {
  path: string;
  content: string;
}

// ponytail: files are included in whatever order the tree walk gave them, until the budget runs
// out — no ranking by size/importance. Fine for small-to-medium projects; if a large project
// routinely loses relevant files off the end, sort `files` by importance before calling this.
export const WHOLE_CODEBASE_CHAR_BUDGET = 200_000;

/** Concatenates file contents into one blob for --whole mode, stopping once maxChars is hit —
 *  a hard budget instead of trying to fit an unbounded codebase into one prompt. */
export function buildWholeCodebaseText(files: FileContent[], maxChars = WHOLE_CODEBASE_CHAR_BUDGET): { text: string; included: number } {
  const parts: string[] = [];
  let used = 0;
  let included = 0;
  for (const f of files) {
    const chunk = `\n\n--- ${f.path} ---\n${f.content}`;
    if (used + chunk.length > maxChars) break;
    parts.push(chunk);
    used += chunk.length;
    included++;
  }
  return { text: parts.join(""), included };
}
