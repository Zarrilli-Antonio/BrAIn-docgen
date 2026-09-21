import { Provider } from "./types.js";

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";
const MAX_TOKENS = 4096;

/** Cloud generation via the Anthropic Messages API — needs an API key, nothing runs locally. */
export class AnthropicProvider implements Provider {
  constructor(
    private apiKey: string,
    private model: string,
  ) {}

  async generate(system: string, user: string): Promise<string> {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": API_VERSION,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: MAX_TOKENS,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic API request failed (${res.status}): ${await res.text()}`);
    const data = (await res.json()) as { content: { type: string; text?: string }[] };
    return data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("");
  }
}
