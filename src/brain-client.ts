import { TreeNode } from "./tree.js";

/** Thin client for BrAIn's own HTTP API (`brain --mode http`) — the addon reads/writes a project
 *  through BrAIn's already-running server instead of duplicating its file/index logic. */
export class BrainClient {
  constructor(private baseUrl: string) {}

  private async json<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) throw new Error(`BrAIn API ${path} failed: ${res.status} ${await res.text()}`);
    return res.json() as Promise<T>;
  }

  /** Returns the file tree rooted at subpath — a single node with nested `children`, not a flat list. */
  async listFiles(subpath = "."): Promise<TreeNode> {
    return this.json(`/api/files?subpath=${encodeURIComponent(subpath)}`);
  }

  async readFile(path: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/file?path=${encodeURIComponent(path)}`);
    if (!res.ok) throw new Error(`BrAIn API /api/file failed for ${path}: ${res.status} ${await res.text()}`);
    return res.text();
  }

  /** "" instead of throwing — used for memory.md/style-guide.md, which may not exist yet. */
  async readDocOrEmpty(path: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/doc?path=${encodeURIComponent(path)}`);
    return res.ok ? res.text() : "";
  }

  async listDocs(): Promise<string[]> {
    return this.json("/api/docs");
  }

  async writeDoc(path: string, content: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/doc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, content }),
    });
    if (!res.ok) throw new Error(`BrAIn API POST /api/doc failed for ${path}: ${res.status} ${await res.text()}`);
  }

  async deleteDoc(path: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/doc?path=${encodeURIComponent(path)}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`BrAIn API DELETE /api/doc failed for ${path}: ${res.status} ${await res.text()}`);
  }
}
