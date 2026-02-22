import { useState, useCallback } from 'react';
import { Play, Braces, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { resolveRequestVariables } from '@/lib/variables';
import {
  introspectSchema,
  executeGraphQL,
  formatGraphQL,
  getExplorableTypes,
  type IntrospectionSchema,
  type IntrospectionType,
} from '@/lib/graphql';
import type { ApiRequest, KeyValuePair } from '@/types/api';
import type { Environment } from '@/lib/variables';

interface GraphQLClientProps {
  request: ApiRequest;
  setRequest: (r: ApiRequest) => void;
  activeEnvId: string | null;
  environments: Environment[];
  globalVars: KeyValuePair[];
}

export function GraphQLClient({
  request,
  setRequest,
  activeEnvId,
  environments,
  globalVars,
}: GraphQLClientProps) {
  const [schema, setSchema] = useState<IntrospectionSchema | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [response, setResponse] = useState<{ data: unknown; errors?: Array<{ message: string }>; status: number; time: number } | null>(null);
  const [executing, setExecuting] = useState(false);
  const [schemaExpanded, setSchemaExpanded] = useState(true);
  const [selectedType, setSelectedType] = useState<IntrospectionType | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  const query = request.body || '';
  const variablesStr = request.graphqlVariables ?? '{}';
  const operationName = request.graphqlOperationName ?? '';

  const buildHeaders = () => {
    const headers: Record<string, string> = {};
    request.headers.forEach(h => {
      if (h.enabled && h.key) headers[h.key] = h.value;
    });
    return headers;
  };

  const handleIntrospect = useCallback(async () => {
    const resolved = resolveRequestVariables(request, activeEnvId, environments, globalVars);
    const url = resolved.url;
    if (!url) return;
    setSchemaLoading(true);
    setSchemaError(null);
    try {
      const s = await introspectSchema(url, buildHeaders());
      setSchema(s);
      if (!s) setSchemaError('Failed to fetch schema');
    } catch (e) {
      setSchemaError(e instanceof Error ? e.message : String(e));
      setSchema(null);
    } finally {
      setSchemaLoading(false);
    }
  }, [request, activeEnvId, environments, globalVars]);

  const handleExecute = useCallback(async () => {
    const resolved = resolveRequestVariables(request, activeEnvId, environments, globalVars);
    const url = resolved.url;
    if (!url || !query.trim()) return;
    setExecuting(true);
    const start = Date.now();
    try {
      let variables: Record<string, unknown> | undefined;
      try {
        variables = variablesStr.trim() ? JSON.parse(variablesStr) : undefined;
      } catch {
        setResponse({
          data: null,
          errors: [{ message: 'Invalid JSON in variables' }],
          status: 0,
          time: Date.now() - start,
        });
        setExecuting(false);
        return;
      }
      const result = await executeGraphQL(
        url,
        query,
        variables,
        operationName.trim() || undefined,
        buildHeaders()
      );
      setResponse({
        ...result,
        time: Date.now() - start,
      });
    } catch (e) {
      setResponse({
        data: null,
        errors: [{ message: e instanceof Error ? e.message : String(e) }],
        status: 0,
        time: Date.now() - start,
      });
    } finally {
      setExecuting(false);
    }
  }, [request, activeEnvId, environments, globalVars, query, variablesStr, operationName]);

  const handleFormat = () => {
    setRequest({ ...request, body: formatGraphQL(query) });
  };

  const toggleType = (name: string) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const types = schema ? getExplorableTypes(schema) : [];

  const formatResponse = (data: unknown) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="flex-1 flex flex-col border-b border-border bg-card min-h-0">
      {/* URL bar */}
      <div className="px-5 py-3 border-b border-border flex gap-2 items-center">
        <Input
          placeholder="https://api.example.com/graphql"
          value={request.url}
          onChange={(e) => setRequest({ ...request, url: e.target.value })}
          className="flex-1 h-9 font-mono text-sm"
        />
        <Button variant="outline" size="sm" onClick={handleIntrospect} disabled={!request.url || schemaLoading}>
          {schemaLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Braces className="w-3.5 h-3.5" />}
          <span className="ml-1.5 hidden sm:inline">Schema</span>
        </Button>
        <Button onClick={handleExecute} disabled={!request.url || !query.trim() || executing} className="bg-primary">
          {executing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          <span className="ml-1.5">Execute</span>
        </Button>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Schema explorer sidebar */}
        <div
          className={`border-r border-border bg-card flex flex-col shrink-0 transition-all ${
            schemaExpanded ? 'w-56' : 'w-10'
          }`}
        >
          <button
            onClick={() => setSchemaExpanded(!schemaExpanded)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border-b border-border"
          >
            {schemaExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            Schema
          </button>
          {schemaExpanded && (
            <ScrollArea className="flex-1 p-2">
              {schemaError && <p className="text-xs text-destructive px-1">{schemaError}</p>}
              {!schema && !schemaError && (
                <p className="text-xs text-muted-foreground px-1">Click Schema to fetch</p>
              )}
              {types.map((type) => (
                <div key={type.name} className="mb-1">
                  <button
                    onClick={() => {
                      toggleType(type.name);
                      setSelectedType(type);
                    }}
                    className="flex items-center gap-1 w-full text-left px-2 py-1 rounded text-xs hover:bg-muted"
                  >
                    {expandedTypes.has(type.name) ? (
                      <ChevronDown className="w-3 h-3 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 shrink-0" />
                    )}
                    <span className="font-mono">{type.name}</span>
                    <span className="text-muted-foreground text-[10px]">({type.kind})</span>
                  </button>
                  {expandedTypes.has(type.name) && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {(type.fields ?? type.inputFields ?? []).map((f) => (
                        <div key={f.name} className="text-[10px] font-mono text-muted-foreground">
                          {f.name}: {f.type?.ofType?.name ?? f.type?.name ?? '?'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
          )}
        </div>

        {/* Main: Query + Variables | Response */}
        <div className="flex-1 flex flex-col min-w-0">
          <Tabs defaultValue="query" className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-card px-4 h-9 shrink-0">
              <TabsTrigger value="query" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Query</TabsTrigger>
              <TabsTrigger value="response" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Response {response?.errors?.length ? `(${response.errors.length} errors)` : ''}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="query" className="flex-1 flex flex-col m-0 min-h-0 p-4">
              <div className="space-y-2 mb-2">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Operation name (optional)"
                    value={operationName}
                    onChange={(e) => setRequest({ ...request, graphqlOperationName: e.target.value })}
                    className="h-8 w-48 text-xs font-mono"
                  />
                  <Button variant="ghost" size="sm" onClick={handleFormat} className="text-xs">
                    Format
                  </Button>
                </div>
                <Textarea
                  placeholder={`query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
  }
}`}
                  value={query}
                  onChange={(e) => setRequest({ ...request, body: e.target.value })}
                  className="min-h-[180px] font-mono text-xs resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Variables (JSON)</label>
                <Textarea
                  placeholder='{"id": "1"}'
                  value={variablesStr}
                  onChange={(e) => setRequest({ ...request, graphqlVariables: e.target.value })}
                  className="min-h-[80px] font-mono text-xs resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="response" className="flex-1 flex flex-col m-0 min-h-0 p-4 overflow-auto">
              {!response ? (
                <p className="text-xs text-muted-foreground">Execute a query to see the response.</p>
              ) : (
                <div className="space-y-3">
                  {response.errors && response.errors.length > 0 && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                      <h4 className="text-xs font-semibold text-destructive mb-2">Errors</h4>
                      {response.errors.map((e, i) => (
                        <p key={i} className="text-xs text-destructive mt-1">
                          {e.message}
                        </p>
                      ))}
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-1">
                      Status: {response.status} | Time: {response.time}ms
                    </div>
                    <pre className="p-3 rounded-lg bg-muted/50 border border-border text-xs font-mono whitespace-pre-wrap break-words">
                      {formatResponse(response.data)}
                    </pre>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Documentation panel (selected type) */}
        {selectedType && schemaExpanded && (
          <div className="w-56 border-l border-border bg-card shrink-0 p-3 overflow-auto">
            <h4 className="text-xs font-semibold mb-2">{selectedType.name}</h4>
            {selectedType.description && (
              <p className="text-xs text-muted-foreground mb-2">{selectedType.description}</p>
            )}
            {(selectedType.fields ?? selectedType.inputFields ?? []).map((f) => (
              <div key={f.name} className="mb-2 pb-2 border-b border-border last:border-0">
                <span className="font-mono text-xs font-medium">{f.name}</span>
                <span className="text-muted-foreground text-[10px] ml-1">
                  : {f.type?.ofType?.name ?? f.type?.name ?? '?'}
                </span>
                {f.description && <p className="text-[10px] text-muted-foreground mt-0.5">{f.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
