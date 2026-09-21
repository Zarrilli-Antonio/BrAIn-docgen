import { Provider } from "./types.js";

/** Any OpenAI-compatible chat-completions endpoint — OpenAI itself, Groq, Together, DeepSeek,
 *  Mistral, a local llama.cpp/vLLM/LM Studio server, or Ollama's own /v1 endpoint. One
 *  implementation covers all of them since they share the same request/response shape. */
export class OpenAICompatibleProvider implements Provider {
  constructor(
    private baseUrl: string,
    private apiKey: string | undefined,
    private model: string,
  ) {}

  async generate(system: string, user: string): Promise<string> {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI-compatible API request failed (${res.status}): ${await res.text()}`);
    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    return data.choices[0].message.content;
  }
}
