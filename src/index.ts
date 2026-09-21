#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "./cli.js";
import { checkForUpdate } from "./update-check.js";

// dist/index.js's own folder, one level up — brain-docgen's own install location, not the
// (unrelated) BrAIn project a run targets. Resolves correctly through an `npm link` symlink too.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INSTALL_ROOT = path.join(__dirname, "..");

/** Fire-and-forget: never blocks or delays a run, never throws (checkForUpdate already swallows
 *  its own failures — offline, no git, no remote, all silently skipped). Runs once per CLI
 *  invocation, which also covers every run started from the GUI (it spawns this same file). */
checkForUpdate(INSTALL_ROOT).then((info) => {
  if (!info) return;
  console.log(
    `\nA newer version of brain-docgen is available (local ${info.local.slice(0, 7)}, origin ${info.remote.slice(0, 7)}).\n` +
      `Update with: git -C "${INSTALL_ROOT}" pull && npm --prefix "${INSTALL_ROOT}" install && npm --prefix "${INSTALL_ROOT}" run build\n`,
  );
});

main().catch((e) => {
  console.error((e as Error).message);
  process.exitCode = 1;
});
