/**
 * Image generation API (OpenAI DALL·E). API key passed in by caller.
 */

export interface ImageGenerationResult {
  data: Array<{ url?: string; b64_json?: string }>;
  _raw?: unknown;
}

/**
 * Create image(s) from a prompt using DALL·E.
 */
export async function createImage(
  model: string,
  prompt: string,
  options: { n?: number; size?: string },
  apiKey: string
): Promise<ImageGenerationResult> {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey });
  const res = await client.images.generate({
    model,
    prompt,
    n: options.n ?? 1,
    size: (options.size as '1024x1024' | '1792x1024' | '1024x1792') ?? '1024x1024',
    response_format: 'url',
  });
  return {
    data: (res.data ?? []).map((d) => ({ url: d.url, b64_json: d.b64_json })),
    _raw: res,
  };
}
