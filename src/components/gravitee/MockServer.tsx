import { useState, useCallback, useEffect } from 'react';
import { Server, Play, Square, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllRequests } from '@/lib/collections';
import { getPathFromUrl, toPathPattern } from '@/lib/mockServer';
import type { Collection, ApiRequest, KeyValuePair } from '@/types/api';
import type { MockServerConfig, MockRoute, MockExample, ExampleSelection } from '@/types/mock';
import { METHOD_BG_COLORS } from '@/types/api';
import { toast } from 'sonner';

const MOCK_PORT = 3010;
const DEFAULT_EXAMPLE: Omit<MockExample, 'id'> = {
  status: 200,
  headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
  body: '{}',
};

function generateId() {
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface MockServerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
}

export function MockServer({ open, onOpenChange, collections }: MockServerProps) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [routes, setRoutes] = useState<MockRoute[]>([]);
  const [port, setPort] = useState(MOCK_PORT);
  const [serverRunning, setServerRunning] = useState<boolean | null>(null);

  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);
  const httpRequests = selectedCollection
    ? getAllRequests(selectedCollection).filter((r) => (r.requestType ?? 'http') === 'http')
    : [];

  const createFromCollection = useCallback(() => {
    if (!selectedCollection) return;
    const newRoutes: MockRoute[] = httpRequests.map((req) => {
      const path = toPathPattern(getPathFromUrl(req.url));
      return {
        id: generateId(),
        requestId: req.id,
        method: req.method,
        path: path || '/',
        examples: [
          {
            id: generateId(),
            name: 'Default',
            ...DEFAULT_EXAMPLE,
          },
        ],
        exampleSelection: 'first' as ExampleSelection,
      };
    });
    setRoutes(newRoutes);
  }, [selectedCollection, httpRequests]);

  const updateRoute = (routeId: string, upd: Partial<MockRoute>) => {
    setRoutes((prev) => prev.map((r) => (r.id === routeId ? { ...r, ...upd } : r)));
  };

  const addExample = (routeId: string) => {
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === routeId
          ? { ...r, examples: [...r.examples, { id: generateId(), ...DEFAULT_EXAMPLE }] }
          : r
      )
    );
  };

  const updateExample = (routeId: string, exampleId: string, upd: Partial<MockExample>) => {
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === routeId
          ? { ...r, examples: r.examples.map((e) => (e.id === exampleId ? { ...e, ...upd } : e)) }
          : r
      )
    );
  };

  const removeExample = (routeId: string, exampleId: string) => {
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id !== routeId) return r;
        const filtered = r.examples.filter((e) => e.id !== exampleId);
        if (filtered.length === 0)
          filtered.push({ id: generateId(), ...DEFAULT_EXAMPLE });
        return { ...r, examples: filtered };
      })
    );
  };

  const removeRoute = (routeId: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== routeId));
  };

  const checkServer = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:${port}/__mock/status`, {
        method: 'GET',
        mode: 'cors',
      });
      setServerRunning(res.ok);
      return res.ok;
    } catch {
      setServerRunning(false);
      return false;
    }
  }, [port]);

  const handleApply = useCallback(async () => {
    const config: MockServerConfig = { port, routes };
    try {
      const res = await fetch(`http://localhost:${port}/__mock/load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
        mode: 'cors',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? res.statusText);
      }
      setServerRunning(true);
      toast.success(`Config applied to mock server (${routes.length} routes)`);
    } catch (e) {
      toast.error(
        `Failed to apply: ${e instanceof Error ? e.message : 'Server not running?'} Run "npm run mock" in a terminal.`
      );
    }
  }, [port, routes]);

  const handleStop = useCallback(async () => {
    try {
      await fetch(`http://localhost:${port}/__mock/stop`, {
        method: 'POST',
        mode: 'cors',
      });
      setServerRunning(false);
      toast.success('Mock server stopped');
    } catch {
      toast.error('Could not reach mock server');
    }
  }, [port]);

  useEffect(() => {
    if (open && serverRunning === null) checkServer();
  }, [open, serverRunning, checkServer]);

  const requestName = (reqId: string) =>
    httpRequests.find((r) => r.id === reqId)?.name ?? 'Unknown';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] flex flex-col"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Mock Server
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Collection</Label>
              <Select
                value={selectedCollectionId}
                onValueChange={(v) => {
                  setSelectedCollectionId(v);
                  setRoutes([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={createFromCollection}
                disabled={!selectedCollection || httpRequests.length === 0}
              >
                Create mock from collection
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input
                type="number"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value, 10) || MOCK_PORT)}
                min={1024}
                max={65535}
                className="w-24"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleApply}
              disabled={routes.length === 0}
              className="bg-primary"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Apply to server
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              disabled={!serverRunning}
            >
              <Square className="w-3.5 h-3.5 mr-1.5" />
              Stop server
            </Button>
            {serverRunning === false && (
              <span className="text-xs text-muted-foreground">
                Run <code className="bg-muted px-1 rounded">npm run mock</code> in a terminal
              </span>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Mock server base URL: <code className="bg-muted px-1 rounded">http://localhost:{port}</code>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <Label className="mb-2">Routes ({routes.length})</Label>
            <ScrollArea className="flex-1 border rounded-md p-2 min-h-[200px]">
              {routes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  Select a collection and click &quot;Create mock from collection&quot;
                </p>
              ) : (
                <div className="space-y-4">
                  {routes.map((route) => (
                    <div
                      key={route.id}
                      className="border rounded-lg p-3 space-y-2 bg-card"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-mono px-1.5 py-0.5 rounded ${METHOD_BG_COLORS[route.method] ?? 'bg-muted'}`}
                        >
                          {route.method}
                        </span>
                        <Input
                          value={route.path}
                          onChange={(e) => updateRoute(route.id, { path: e.target.value })}
                          placeholder="/users/:id"
                          className="flex-1 min-w-[120px] h-8 text-xs font-mono"
                        />
                        <Select
                          value={route.exampleSelection}
                          onValueChange={(v: ExampleSelection) =>
                            updateRoute(route.id, { exampleSelection: v })
                          }
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="first">First</SelectItem>
                            <SelectItem value="random">Random</SelectItem>
                            <SelectItem value="sequential">Sequential</SelectItem>
                            <SelectItem value="query">By query param</SelectItem>
                          </SelectContent>
                        </Select>
                        {route.exampleSelection === 'query' && (
                          <Input
                            placeholder="Param name"
                            value={route.queryParamName ?? ''}
                            onChange={(e) =>
                              updateRoute(route.id, { queryParamName: e.target.value || undefined })
                            }
                            className="w-24 h-8 text-xs"
                          />
                        )}
                        <Input
                          type="number"
                          placeholder="Delay ms"
                          value={route.delayMs ?? ''}
                          onChange={(e) =>
                            updateRoute(route.id, {
                              delayMs: parseInt(e.target.value, 10) || undefined,
                            })
                          }
                          className="w-20 h-8 text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeRoute(route.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {requestName(route.requestId)}
                      </p>
                      <div className="space-y-1">
                        {route.examples.map((ex) => (
                          <div
                            key={ex.id}
                            className="flex items-center gap-2 bg-muted/50 rounded p-2 text-xs"
                          >
                            <Input
                              type="number"
                              value={ex.status}
                              onChange={(e) =>
                                updateExample(route.id, ex.id, {
                                  status: parseInt(e.target.value, 10) || 200,
                                })
                              }
                              className="w-14 h-7"
                            />
                            {route.exampleSelection === 'query' && (
                              <Input
                                placeholder="query value"
                                value={ex.queryParam ?? ''}
                                onChange={(e) =>
                                  updateExample(route.id, ex.id, {
                                    queryParam: e.target.value,
                                  })
                                }
                                className="w-24 h-7"
                              />
                            )}
                            <Input
                              value={ex.body}
                              onChange={(e) =>
                                updateExample(route.id, ex.id, { body: e.target.value })
                              }
                              placeholder="Response body"
                              className="flex-1 min-w-0 h-7 font-mono"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={() => removeExample(route.id, ex.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => addExample(route.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add example
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
