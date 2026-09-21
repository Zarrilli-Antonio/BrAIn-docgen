import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkForUpdate } from "./update-check.js";

test("checkForUpdate returns null (never throws) for a plain folder that isn't a git repo", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "brain-docgen-update-check-"));
  assert.equal(await checkForUpdate(dir), null);
});
