export interface Provider {
  generate(system: string, user: string): Promise<string>;
}
