/**
 * LLM client: OpenAI and Anthropic chat completions (and optional streaming).
 * API keys are passed in by the caller (from env or global vars).
 */

import type { LLMProvider } from '@/types/api';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface LLMCompletionResult {
  content: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  finish_reason?: string;
  _raw?: unknown;
}

export interface LLMStreamChunk {
  content: string;
  done: boolean;
}

/**
 * Create a chat completion (non-streaming). Uses provider SDK with the given API key.
 */
export async function createChatCompletion(
  provider: LLMProvider,
  model: string,
  messages: ChatMessage[],
  options: LLMOptions & { stream?: false },
  apiKey: string
): Promise<LLMCompletionResult> {
  if (provider === 'openai') {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey });
    const res = await client.chat.completions.create({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
      stream: false,
    });
    const choice = res.choices?.[0];
    return {
      content: choice?.message?.content ?? '',
      usage: res.usage as LLMCompletionResult['usage'],
      finish_reason: choice?.finish_reason ?? undefined,
      _raw: res,
    };
  }
  if (provider === 'anthropic') {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });
    const system = messages.find((m) => m.role === 'system')?.content;
    const rest = messages.filter((m) => m.role !== 'system');
    const res = await client.messages.create({
      model,
      max_tokens: options.max_tokens ?? 1024,
      system: system ?? undefined,
      messages: rest.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      temperature: options.temperature ?? 0.7,
    });
    const text = res.content?.find((c) => c.type === 'text');
    const textContent = text?.type === 'text' ? text.text : '';
    return {
      content: textContent,
      usage: res.usage
        ? {
            prompt_tokens: res.usage.input_tokens,
            completion_tokens: res.usage.output_tokens,
            total_tokens: (res.usage.input_tokens ?? 0) + (res.usage.output_tokens ?? 0),
          }
        : undefined,
      _raw: res,
    };
  }
  throw new Error(`Unsupported LLM provider: ${provider}`);
}

/**
 * Create a streaming chat completion (OpenAI only for now; Anthropic can be added similarly).
 */
export async function* createChatCompletionStream(
  provider: LLMProvider,
  model: string,
  messages: ChatMessage[],
  options: LLMOptions,
  apiKey: string
): AsyncGenerator<LLMStreamChunk> {
  if (provider === 'openai') {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey });
    const stream = await client.chat.completions.create({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
      stream: true,
    });
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        yield { content: delta, done: false };
      }
    }
    yield { content: '', done: true };
    return;
  }
  if (provider === 'anthropic') {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });
    const system = messages.find((m) => m.role === 'system')?.content;
    const rest = messages.filter((m) => m.role !== 'system');
    const stream = await client.messages.stream({
      model,
      max_tokens: options.max_tokens ?? 1024,
      system: system ?? undefined,
      messages: rest.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      temperature: options.temperature ?? 0.7,
    });
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield { content: event.delta.text, done: false };
      }
    }
    yield { content: '', done: true };
    return;
  }
  throw new Error(`Unsupported LLM provider: ${provider}`);
}
