import { useState, useCallback } from 'react';
import { Play, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { listToolsStdio, callToolStdio } from '@/lib/mcpClient';
import type { ApiRequest, ApiResponse, KeyValuePair } from '@/types/api';
import type { Environment } from '@/lib/variables';

interface McpClientProps {
  request: ApiRequest;
  setRequest: (r: ApiRequest) => void;
  setResponse: (r: ApiResponse | null) => void;
  activeEnvId: string | null;
  environments: Environment[];
  globalVars: KeyValuePair[];
}

export function McpClient({
  request,
  setRequest,
  setResponse,
}: McpClientProps) {
  const [tools, setTools] = useState<Array<{ name: string; description?: string }>>([]);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [toolsError, setToolsError] = useState<string | null>(null);
  const [runLoading, setRunLoading] = useState(false);
  const [lastResult, setLastResult] = useState<unknown>(null);

  const transport = request.mcpTransport ?? 'stdio';
  const command = request.mcpCommand ?? '';
  const argsStr = request.mcpArgs ?? '[]';
  const toolName = request.mcpToolName ?? '';
  const toolArgsStr = request.mcpToolArgs ?? '{}';

  const parseArgs = useCallback((): string[] => {
    try {
      const a = JSON.parse(argsStr);
      return Array.isArray(a) ? a.map(String) : [];
    } catch {
      return [];
    }
  }, [argsStr]);

  const handleListTools = useCallback(async () => {
    if (!command.trim()) return;
    setToolsLoading(true);
    setToolsError(null);
    const start = Date.now();
    try {
      const args = parseArgs();
      const res = await listToolsStdio(command.trim(), args);
      if (res.ok) {
        setTools(res.tools ?? []);
        setResponse({
          status: 200,
          statusText: 'OK',
          headers: {},
          data: res,
          time: Date.now() - start,
          size: JSON.stringify(res).length,
        });
        setLastResult(res);
      } else {
        setToolsError(res.error ?? 'Failed to list tools');
        setTools([]);
        setResponse({
          status: 0,
          statusText: 'Error',
          headers: {},
          data: { ok: false, error: res.error },
          time: Date.now() - start,
          size: 0,
        });
        setLastResult({ ok: false, error: res.error });
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setToolsError(err);
      setTools([]);
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        data: { ok: false, error: err },
        time: Date.now() - start,
        size: 0,
      });
      setLastResult({ ok: false, error: err });
    } finally {
      setToolsLoading(false);
    }
  }, [command, parseArgs, setResponse]);

  const handleCallTool = useCallback(async () => {
    if (!command.trim() || !toolName.trim()) return;
    setRunLoading(true);
    const start = Date.now();
    try {
      const args = parseArgs();
      let toolArgs: Record<string, unknown> | string = toolArgsStr;
      try {
        toolArgs = toolArgsStr.trim() ? JSON.parse(toolArgsStr) : {};
      } catch {
        // keep as string for bridge to try parsing
      }
      const res = await callToolStdio(command.trim(), args, toolName.trim(), toolArgs);
      const data = res.ok
        ? { content: res.content, isError: res.isError, _raw: res._raw }
        : { ok: false, error: res.error };
      setResponse({
        status: res.ok ? 200 : 0,
        statusText: res.ok ? 'OK' : 'Error',
        headers: {},
        data,
        time: Date.now() - start,
        size: JSON.stringify(data).length,
      });
      setLastResult(data);
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        data: { ok: false, error: err },
        time: Date.now() - start,
        size: 0,
      });
      setLastResult({ ok: false, error: err });
    } finally {
      setRunLoading(false);
    }
  }, [command, toolName, toolArgsStr, parseArgs, setResponse]);

  const formatJson = (v: unknown) => {
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  };

  return (
    <div className="flex-1 flex flex-col border-b border-border bg-card min-h-0">
      <div className="px-5 py-3 border-b border-border flex flex-col gap-3">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs font-medium text-muted-foreground shrink-0">Transport:</span>
          <select
            value={transport}
            onChange={(e) => setRequest({ ...request, mcpTransport: e.target.value as 'stdio' | 'http' })}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="stdio">stdio (via bridge)</option>
            <option value="http">HTTP (future)</option>
          </select>
          {transport === 'stdio' && (
            <>
              <Input
                placeholder="Command (e.g. npx, node)"
                value={command}
                onChange={(e) => setRequest({ ...request, mcpCommand: e.target.value })}
                className="flex-1 min-w-[120px] h-9 font-mono text-sm"
              />
              <Input
                placeholder='Args as JSON, e.g. ["-y", "@modelcontextprotocol/server-filesystem"]'
                value={argsStr}
                onChange={(e) => setRequest({ ...request, mcpArgs: e.target.value })}
                className="flex-1 min-w-[180px] h-9 font-mono text-xs"
              />
              <Button variant="outline" size="sm" onClick={handleListTools} disabled={!command.trim() || toolsLoading}>
                {toolsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <List className="w-3.5 h-3.5" />}
                <span className="ml-1.5">List tools</span>
              </Button>
            </>
          )}
        </div>
        {toolsError && <p className="text-xs text-destructive">{toolsError}</p>}
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="w-56 border-r border-border bg-card flex flex-col shrink-0">
          <div className="px-3 py-2 border-b border-border text-xs font-medium text-muted-foreground">Tools</div>
          <ScrollArea className="flex-1 p-2">
            {tools.length === 0 && !toolsLoading && (
              <p className="text-xs text-muted-foreground px-1">List tools to see available tools.</p>
            )}
            {tools.map((t) => (
              <button
                key={t.name}
                onClick={() => setRequest({ ...request, mcpToolName: t.name })}
                className={`block w-full text-left px-2 py-1.5 rounded text-xs font-mono truncate hover:bg-muted ${
                  toolName === t.name ? 'bg-muted' : ''
                }`}
                title={t.description}
              >
                {t.name}
              </button>
            ))}
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col min-w-0 p-4">
          <div className="space-y-2 mb-4">
            <Label className="text-xs">Tool name</Label>
            <Input
              placeholder="Select a tool from the list or type name"
              value={toolName}
              onChange={(e) => setRequest({ ...request, mcpToolName: e.target.value })}
              className="font-mono text-sm"
            />
            <Label className="text-xs">Arguments (JSON)</Label>
            <Textarea
              placeholder='{"path": "/some/path"}'
              value={toolArgsStr}
              onChange={(e) => setRequest({ ...request, mcpToolArgs: e.target.value })}
              className="min-h-[100px] font-mono text-xs resize-none"
            />
            <Button
              onClick={handleCallTool}
              disabled={!command.trim() || !toolName.trim() || runLoading}
              className="bg-primary"
            >
              {runLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span className="ml-1.5">Run tool</span>
            </Button>
          </div>

          <Tabs defaultValue="result" className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-card h-9 shrink-0">
              <TabsTrigger value="result" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Result
              </TabsTrigger>
            </TabsList>
            <TabsContent value="result" className="flex-1 flex flex-col m-0 min-h-0 p-4 overflow-auto">
              {lastResult === null ? (
                <p className="text-xs text-muted-foreground">List tools or run a tool to see the result.</p>
              ) : (
                <pre className="p-3 rounded-lg bg-muted/50 border border-border text-xs font-mono whitespace-pre-wrap break-words">
                  {formatJson(lastResult)}
                </pre>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
