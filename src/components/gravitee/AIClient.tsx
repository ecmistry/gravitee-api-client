import { useState, useCallback } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createEmbeddings } from '@/lib/embeddingsClient';
import { createImage } from '@/lib/imageClient';
import type { ApiRequest, ApiResponse, KeyValuePair } from '@/types/api';
import type { AISubType } from '@/types/api';
import type { Environment } from '@/lib/variables';

function getOpenAIKey(activeEnvId: string | null, environments: Environment[], globalVars: KeyValuePair[]): string {
  for (const v of globalVars) {
    if (v.enabled && v.key?.trim() === 'OPENAI_API_KEY') return v.value;
  }
  if (activeEnvId) {
    const env = environments.find((e) => e.id === activeEnvId);
    for (const v of env?.variables ?? []) {
      if (v.enabled && v.key?.trim() === 'OPENAI_API_KEY') return v.value;
    }
  }
  return '';
}

interface AIClientProps {
  request: ApiRequest;
  setRequest: (r: ApiRequest) => void;
  setResponse: (r: ApiResponse | null) => void;
  activeEnvId: string | null;
  environments: Environment[];
  globalVars: KeyValuePair[];
}

const EMBEDDING_MODELS = ['text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002'];
const IMAGE_MODELS = ['dall-e-3', 'dall-e-2'];
const IMAGE_SIZES = ['1024x1024', '1792x1024', '1024x1792'];

export function AIClient({
  request,
  setRequest,
  setResponse,
  activeEnvId,
  environments,
  globalVars,
}: AIClientProps) {
  const [loading, setLoading] = useState(false);
  const subType = (request.aiSubType ?? 'embeddings') as AISubType;
  const apiKey = getOpenAIKey(activeEnvId, environments, globalVars);

  const embeddingInput = request.aiEmbeddingInput ?? '';
  const embeddingModel = request.aiModel ?? 'text-embedding-3-small';
  const imagePrompt = request.aiImagePrompt ?? '';
  const imageModel = request.aiModel ?? 'dall-e-3';
  const imageSize = request.aiImageSize ?? '1024x1024';
  const imageN = request.aiImageN ?? 1;

  const runEmbeddings = useCallback(async () => {
    if (!embeddingInput.trim() || !apiKey) return;
    setLoading(true);
    const start = Date.now();
    try {
      const inputs = embeddingInput.split(/\n/).map((s) => s.trim()).filter(Boolean);
      const result = await createEmbeddings(
        embeddingModel,
        inputs.length > 1 ? inputs : inputs[0] || embeddingInput,
        apiKey
      );
      setResponse({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: result,
        time: Date.now() - start,
        size: JSON.stringify(result).length,
      });
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
  }, [embeddingInput, embeddingModel, apiKey, setResponse]);

  const runImage = useCallback(async () => {
    if (!imagePrompt.trim() || !apiKey) return;
    setLoading(true);
    const start = Date.now();
    try {
      const result = await createImage(
        imageModel,
        imagePrompt.trim(),
        { n: imageN, size: imageSize },
        apiKey
      );
      setResponse({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: result,
        time: Date.now() - start,
        size: JSON.stringify(result).length,
      });
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
  }, [imagePrompt, imageModel, imageSize, imageN, apiKey, setResponse]);

  return (
    <div className="flex-1 flex flex-col border-b border-border bg-card min-h-0">
      <div className="px-5 py-3 border-b border-border flex gap-4 items-center">
        <Label className="text-xs">Capability</Label>
        <select
          value={subType}
          onChange={(e) => setRequest({ ...request, aiSubType: e.target.value as AISubType })}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs"
        >
          <option value="embeddings">Embeddings</option>
          <option value="image">Image generation</option>
        </select>
      </div>
      {!apiKey && (
        <div className="px-5 py-2 bg-muted/50 text-xs text-muted-foreground">
          Set OPENAI_API_KEY in environment or global variables.
        </div>
      )}
      <div className="flex-1 flex flex-col min-h-0 p-4">
        <Tabs value={subType} onValueChange={(v) => setRequest({ ...request, aiSubType: v as AISubType })} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-card h-9 shrink-0">
            <TabsTrigger value="embeddings" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Embeddings
            </TabsTrigger>
            <TabsTrigger value="image" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="embeddings" className="flex-1 flex flex-col m-0 min-h-0 p-4 space-y-3">
            <div>
              <Label className="text-xs">Model</Label>
              <select
                value={embeddingModel}
                onChange={(e) => setRequest({ ...request, aiModel: e.target.value })}
                className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-xs font-mono w-full max-w-md"
              >
                {EMBEDDING_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Input text (one per line for multiple)</Label>
              <Textarea
                placeholder="Enter text to embed..."
                value={embeddingInput}
                onChange={(e) => setRequest({ ...request, aiEmbeddingInput: e.target.value })}
                className="min-h-[120px] mt-1 font-mono text-xs resize-none"
              />
            </div>
            <Button onClick={runEmbeddings} disabled={!embeddingInput.trim() || !apiKey || loading} className="bg-primary w-fit">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span className="ml-1.5">Run</span>
            </Button>
          </TabsContent>

          <TabsContent value="image" className="flex-1 flex flex-col m-0 min-h-0 p-4 space-y-3">
            <div>
              <Label className="text-xs">Model</Label>
              <select
                value={imageModel}
                onChange={(e) => setRequest({ ...request, aiModel: e.target.value })}
                className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-xs font-mono"
              >
                {IMAGE_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Prompt</Label>
              <Textarea
                placeholder="Describe the image to generate..."
                value={imagePrompt}
                onChange={(e) => setRequest({ ...request, aiImagePrompt: e.target.value })}
                className="min-h-[80px] mt-1 font-mono text-xs resize-none"
              />
            </div>
            <div className="flex gap-4 items-center">
              <div>
                <Label className="text-xs">Size</Label>
                <select
                  value={imageSize}
                  onChange={(e) => setRequest({ ...request, aiImageSize: e.target.value })}
                  className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  {IMAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">N</Label>
                <Input
                  type="number"
                  min={1}
                  max={4}
                  value={imageN}
                  onChange={(e) => setRequest({ ...request, aiImageN: Number(e.target.value) || 1 })}
                  className="h-9 w-16 mt-1 text-xs"
                />
              </div>
            </div>
            <Button onClick={runImage} disabled={!imagePrompt.trim() || !apiKey || loading} className="bg-primary w-fit">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span className="ml-1.5">Generate</span>
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
