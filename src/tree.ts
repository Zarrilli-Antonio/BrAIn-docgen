export interface TreeNode {
  name: string;
  type: "file" | "dir";
  path: string;
  children?: TreeNode[];
}

/** Every file path under a tree node, recursively — used by --all to turn one /api/files
 *  response into the list of targets to generate docs for. */
export function flattenFiles(node: TreeNode): string[] {
  if (node.type === "file") return [node.path];
  return (node.children ?? []).flatMap(flattenFiles);
}
