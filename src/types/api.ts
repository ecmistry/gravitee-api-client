import type { AuthConfig } from './auth';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  folders: Folder[];
  requests: ApiRequest[];
  /** Auth inherited by requests that choose "Inherit from Parent" */
  auth?: AuthConfig;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  requests: ApiRequest[];
  /** Auth inherited by requests (overrides collection auth when set) */
  auth?: AuthConfig;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type BodyType = 'none' | 'json' | 'xml' | 'text' | 'html' | 'form-data' | 'form-urlencoded';

/** Request type: HTTP, WebSocket, SSE, Socket.IO, GraphQL, MCP, LLM, or AI */
export type RequestType = 'http' | 'websocket' | 'sse' | 'socketio' | 'graphql' | 'mcp' | 'llm' | 'ai';

/** MCP server transport: stdio (via bridge) or HTTP/SSE */
export type McpTransportType = 'stdio' | 'http';

/** LLM provider for chat completions */
export type LLMProvider = 'openai' | 'anthropic';

/** AI capability sub-type (when requestType is 'ai') */
export type AISubType = 'embeddings' | 'image';

/** Auth inheritance: use own auth, or inherit from folder/collection */
export type AuthInheritance = 'inherit' | 'none'; // inherit = use parent, none = use request's own auth

export interface ApiRequest {
  id: string;
  name: string;
  description?: string;
  /** Request type: HTTP, WebSocket, or SSE. Default http for backwards compat. */
  requestType?: RequestType;
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
  bodyType: BodyType;
  /** Key-value pairs for form-urlencoded or form-data */
  formData?: KeyValuePair[];
  /** Auth config for this request (used when authInherit !== 'inherit') */
  auth?: AuthConfig;
  /** 'inherit' = use folder auth or collection auth; 'none' = use request.auth */
  authInherit?: AuthInheritance;
  /** JavaScript run before request (pm.environment.set, pm.globals.set) */
  preRequestScript?: string;
  /** JavaScript run after response (pm.test, pm.expect, pm.response) */
  testScript?: string;
  /** GraphQL variables (JSON string). Used when requestType is graphql. */
  graphqlVariables?: string;
  /** GraphQL operation name. Used when requestType is graphql. */
  graphqlOperationName?: string;
  /** MCP: transport type. Used when requestType is mcp. */
  mcpTransport?: McpTransportType;
  /** MCP: for stdio, command to spawn (e.g. npx -y @modelcontextprotocol/server-filesystem). */
  mcpCommand?: string;
  /** MCP: for stdio, optional args array as JSON string. */
  mcpArgs?: string;
  /** MCP: for http, server URL. */
  mcpServerUrl?: string;
  /** MCP: selected tool name when invoking. */
  mcpToolName?: string;
  /** MCP: tool call arguments as JSON string. */
  mcpToolArgs?: string;
  /** LLM: provider. Used when requestType is llm. */
  llmProvider?: LLMProvider;
  /** LLM: model id (e.g. gpt-4o, claude-3-5-sonnet). */
  llmModel?: string;
  /** LLM: system message. */
  llmSystemMessage?: string;
  /** LLM: user message(s); for MVP single message in body or here. */
  llmUserMessage?: string;
  /** LLM: temperature 0–2. */
  llmTemperature?: number;
  /** LLM: max tokens. */
  llmMaxTokens?: number;
  /** LLM: stream response. */
  llmStream?: boolean;
  /** AI: sub-type (embeddings | image). Used when requestType is ai. */
  aiSubType?: AISubType;
  /** AI: provider (e.g. openai). */
  aiProvider?: 'openai';
  /** AI: model (e.g. text-embedding-3-small, dall-e-3). */
  aiModel?: string;
  /** AI embeddings: input text(s); body or comma/newline separated. */
  aiEmbeddingInput?: string;
  /** AI image: prompt for generation. */
  aiImagePrompt?: string;
  /** AI image: size (e.g. 1024x1024). */
  aiImageSize?: string;
  /** AI image: n (number of images). */
  aiImageN?: number;
}

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
  size: number;
}

/** MCP tool call result (content parts, isError). Shown in response viewer when data is this shape. */
export interface McpToolResult {
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
  _raw?: unknown;
}

/** LLM chat completion response (choices, usage). */
export interface LLMCompletionResponse {
  choices?: Array<{ message?: { role: string; content: string }; delta?: { content?: string }; finish_reason?: string }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  _raw?: unknown;
}

/** Embeddings API response (data array of embedding objects). */
export interface EmbeddingResponse {
  data?: Array<{ embedding: number[]; index?: number }>;
  _raw?: unknown;
}

/** Image generation response (url or b64). */
export interface ImageGenerationResponse {
  data?: Array<{ url?: string; b64_json?: string }>;
  _raw?: unknown;
}

export const METHOD_COLORS: Record<string, string> = {
  GET: 'text-method-get',
  POST: 'text-method-post',
  PUT: 'text-method-put',
  DELETE: 'text-method-delete',
  PATCH: 'text-method-patch',
  HEAD: 'text-method-head',
  OPTIONS: 'text-method-options',
};

export const METHOD_BG_COLORS: Record<string, string> = {
  GET: 'bg-method-get/15 text-method-get',
  POST: 'bg-method-post/15 text-method-post',
  PUT: 'bg-method-put/15 text-method-put',
  DELETE: 'bg-method-delete/15 text-method-delete',
  PATCH: 'bg-method-patch/15 text-method-patch',
  HEAD: 'bg-method-head/15 text-method-head',
  OPTIONS: 'bg-method-options/15 text-method-options',
};
