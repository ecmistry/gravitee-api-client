import { useState, useCallback } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { createChatCompletion, createChatCompletionStream } from '@/lib/llmClient';
import type { ApiRequest, ApiResponse, KeyValuePair } from '@/types/api';
import type { LLMProvider } from '@/types/api';
import type { Environment } from '@/lib/variables';

const PROVIDER_KEYS: Record<LLMProvider, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
};

const OPENAI_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
const ANTHROPIC_MODELS = ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'];

interface LLMClientProps {
  request: ApiRequest;
  setRequest: (r: ApiRequest) => void;
  setResponse: (r: ApiResponse | null) => void;
  activeEnvId: string | null;
  environments: Environment[];
  globalVars: KeyValuePair[];
}

function getApiKey(
  provider: LLMProvider,
  activeEnvId: string | null,
  environments: Environment[],
  globalVars: KeyValuePair[]
): string {
  const keyName = PROVIDER_KEYS[provider];
  for (const v of globalVars) {
    if (v.enabled && v.key?.trim() === keyName) return v.value;
  }
  if (activeEnvId) {
    const env = environments.find((e) => e.id === activeEnvId);
    for (const v of env?.variables ?? []) {
      if (v.enabled && v.key?.trim() === keyName) return v.value;
    }
  }
  return '';
}

export function LLMClient({
  request,
  setRequest,
  setResponse,
  activeEnvId,
  environments,
  globalVars,
}: LLMClientProps) {
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const provider = (request.llmProvider ?? 'openai') as LLMProvider;
  const model = request.llmModel ?? (provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-5-sonnet-20241022');
  const systemMessage = request.llmSystemMessage ?? '';
  const userMessage = request.llmUserMessage ?? request.body ?? '';
  const temperature = request.llmTemperature ?? 0.7;
  const maxTokens = request.llmMaxTokens ?? 1024;
  const stream = request.llmStream ?? false;

  const apiKey = getApiKey(provider, activeEnvId, environments, globalVars);

  const handleSend = useCallback(async () => {
    if (!userMessage.trim() || !apiKey.trim()) return;
    setLoading(true);
    setStreamingContent('');
    const start = Date.now();
    const messages = [
      ...(systemMessage.trim() ? [{ role: 'system' as const, content: systemMessage.trim() }] : []),
      { role: 'user' as const, content: userMessage.trim() },
    ];
    try {
      if (stream) {
        let full = '';
        for await (const chunk of createChatCompletionStream(
          provider,
          model,
          messages,
          { temperature, max_tokens: maxTokens },
          apiKey
        )) {
          if (chunk.content) {
            full += chunk.content;
            setStreamingContent(full);
          }
        }
        setResponse({
          status: 200,
          statusText: 'OK',
          headers: {},
          data: { content: full, streamed: true },
          time: Date.now() - start,
          size: full.length,
        });
      } else {
        const result = await createChatCompletion(
          provider,
          model,
          messages,
          { temperature, max_tokens: maxTokens, stream: false },
          apiKey
        );
        setResponse({
          status: 200,
          statusText: 'OK',
          headers: {},
          data: result,
          time: Date.now() - start,
          size: result.content?.length ?? 0,
        });
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        data: { error: err },
        time: Date.now() - start,
        size: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [provider, model, systemMessage, userMessage, temperature, maxTokens, stream, apiKey, setResponse]);

  const models = provider === 'openai' ? OPENAI_MODELS : ANTHROPIC_MODELS;

  return (
    <div className="flex-1 flex flex-col border-b border-border bg-card min-h-0">
      <div className="px-5 py-3 border-b border-border flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Provider</Label>
          <select
            value={provider}
            onChange={(e) => setRequest({ ...request, llmProvider: e.target.value as LLMProvider })}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs min-w-[120px]"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Model</Label>
          <select
            value={model}
            onChange={(e) => setRequest({ ...request, llmModel: e.target.value })}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs min-w-[200px] font-mono"
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Temperature</Label>
          <Slider
            value={[temperature]}
            onValueChange={([v]) => setRequest({ ...request, llmTemperature: v })}
            min={0}
            max={2}
            step={0.1}
            className="w-24"
          />
          <span className="text-xs text-muted-foreground w-6">{temperature}</span>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Max tokens</Label>
          <Input
            type="number"
            value={maxTokens}
            onChange={(e) => setRequest({ ...request, llmMaxTokens: Number(e.target.value) || 1024 })}
            className="h-9 w-20 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="llm-stream"
            checked={stream}
            onChange={(e) => setRequest({ ...request, llmStream: e.target.checked })}
            className="rounded border-input"
          />
          <Label htmlFor="llm-stream" className="text-xs cursor-pointer">
            Stream
          </Label>
        </div>
        <Button onClick={handleSend} disabled={!userMessage.trim() || !apiKey.trim() || loading} className="bg-primary">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          <span className="ml-1.5">Send</span>
        </Button>
      </div>
      {!apiKey && (
        <div className="px-5 py-2 bg-muted/50 text-xs text-muted-foreground">
          Set {PROVIDER_KEYS[provider]} in environment or global variables.
        </div>
      )}
      <div className="flex-1 flex flex-col min-h-0 p-4">
        <Tabs defaultValue="prompt" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-card h-9 shrink-0">
            <TabsTrigger value="prompt" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Prompt
            </TabsTrigger>
            <TabsTrigger value="response" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Response
            </TabsTrigger>
          </TabsList>
          <TabsContent value="prompt" className="flex-1 flex flex-col m-0 min-h-0 p-4 space-y-3">
            <div>
              <Label className="text-xs">System message (optional)</Label>
              <Textarea
                placeholder="You are a helpful assistant."
                value={systemMessage}
                onChange={(e) => setRequest({ ...request, llmSystemMessage: e.target.value })}
                className="min-h-[80px] mt-1 font-mono text-xs resize-none"
              />
            </div>
            <div>
              <Label className="text-xs">User message</Label>
              <Textarea
                placeholder="Enter your message..."
                value={userMessage}
                onChange={(e) => {
                  setRequest({ ...request, llmUserMessage: e.target.value, body: e.target.value });
                }}
                className="min-h-[160px] mt-1 font-mono text-xs resize-none"
              />
            </div>
          </TabsContent>
          <TabsContent value="response" className="flex-1 flex flex-col m-0 min-h-0 p-4 overflow-auto">
            {streamingContent ? (
              <pre className="p-3 rounded-lg bg-muted/50 border border-border text-xs font-mono whitespace-pre-wrap break-words">
                {streamingContent}
              </pre>
            ) : (
              <p className="text-xs text-muted-foreground">Send a message to see the response. Use the Response viewer in the right panel for the last response.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
