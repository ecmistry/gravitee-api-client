/**
 * Embeddings API (OpenAI). API key passed in by caller.
 */

export interface EmbeddingsResult {
  data: Array<{ embedding: number[]; index: number }>;
  usage?: { prompt_tokens: number; total_tokens: number };
  _raw?: unknown;
}

/**
 * Create embeddings for the given input(s). Input can be a string or array of strings.
 */
export async function createEmbeddings(
  model: string,
  input: string | string[],
  apiKey: string
): Promise<EmbeddingsResult> {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey });
  const res = await client.embeddings.create({
    model,
    input: Array.isArray(input) ? input : [input],
  });
  return {
    data: (res.data ?? []).map((d, i) => ({ embedding: d.embedding, index: d.index ?? i })),
    usage: res.usage ? { prompt_tokens: res.usage.prompt_tokens, total_tokens: res.usage.total_tokens } : undefined,
    _raw: res,
  };
}
