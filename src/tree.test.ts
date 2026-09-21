import test from "node:test";
import assert from "node:assert/strict";
import { flattenFiles } from "./tree.js";

test("flattenFiles collects every file path, recursively, skipping directory nodes themselves", () => {
  const tree = {
    name: "root",
    type: "dir" as const,
    path: ".",
    children: [
      { name: "a.ts", type: "file" as const, path: "a.ts" },
      {
        name: "src",
        type: "dir" as const,
        path: "src",
        children: [
          { name: "b.ts", type: "file" as const, path: "src/b.ts" },
          { name: "empty", type: "dir" as const, path: "src/empty", children: [] },
        ],
      },
    ],
  };
  assert.deepEqual(flattenFiles(tree), ["a.ts", "src/b.ts"]);
});

test("flattenFiles on a lone file node returns just that file", () => {
  assert.deepEqual(flattenFiles({ name: "a.ts", type: "file", path: "a.ts" }), ["a.ts"]);
});
