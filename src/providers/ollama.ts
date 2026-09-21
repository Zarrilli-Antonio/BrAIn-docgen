import { Provider } from "./types.js";

/** Local generation via Ollama's own chat API (localhost:11434) — no API key, nothing leaves the machine. */
export class OllamaProvider implements Provider {
  constructor(
    private host: string,
    private model: string,
  ) {}

  async generate(system: string, user: string): Promise<string> {
    const res = await fetch(`${this.host}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        stream: false,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `Ollama request failed (${res.status}): ${body}\n` +
          `Is Ollama running at ${this.host}, and has "${this.model}" been pulled (ollama pull ${this.model})?`,
      );
    }
    const data = (await res.json()) as { message: { content: string } };
    return data.message.content;
  }
}
