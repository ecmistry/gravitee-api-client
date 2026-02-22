import { Send, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { saveToHistory } from '@/lib/history';
import { motion } from 'framer-motion';
import type { ApiRequest, ApiResponse, HttpMethod } from '@/types/api';
import { METHOD_COLORS } from '@/types/api';

interface RequestBuilderProps {
  request: ApiRequest;
  setRequest: (request: ApiRequest) => void;
  setResponse: (response: ApiResponse | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSaveRequest?: () => void;
}

export function RequestBuilder({ request, setRequest, setResponse, loading, setLoading, onSaveRequest }: RequestBuilderProps) {
  const handleSend = async () => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const url = new URL(request.url);
      request.params.forEach(p => {
        if (p.enabled && p.key) url.searchParams.append(p.key, p.value);
      });
      const headers: Record<string, string> = {};
      request.headers.forEach(h => {
        if (h.enabled && h.key) headers[h.key] = h.value;
      });
      const targetUrl = url.toString();
      const fetchOptions: RequestInit = { method: request.method, headers };
      if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
        fetchOptions.body = request.body;
      }

      // Use CORS proxy in dev to avoid browser CORS restrictions
      const res = import.meta.env.DEV
        ? await fetch('/api-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: targetUrl,
              method: request.method,
              headers,
              body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
            }),
          }).then(async (r) => {
            const text = await r.text();
            return new Response(text, { status: r.status, statusText: r.statusText, headers: r.headers });
          })
        : await fetch(targetUrl, fetchOptions);
      const endTime = Date.now();
      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => { responseHeaders[key] = value; });
      const responseData: ApiResponse = {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data,
        time: endTime - startTime,
        size: JSON.stringify(data).length
      };
      setResponse(responseData);
      saveToHistory(request, responseData);
    } catch (error) {
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        time: Date.now() - startTime,
        size: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const addParam = () => setRequest({ ...request, params: [...request.params, { key: '', value: '', enabled: true }] });
  const updateParam = (i: number, field: string, value: string | boolean) => {
    const p = [...request.params];
    p[i] = { ...p[i], [field]: value };
    setRequest({ ...request, params: p });
  };
  const removeParam = (i: number) => setRequest({ ...request, params: request.params.filter((_, idx) => idx !== i) });

  const addHeader = () => setRequest({ ...request, headers: [...request.headers, { key: '', value: '', enabled: true }] });
  const updateHeader = (i: number, field: string, value: string | boolean) => {
    const h = [...request.headers];
    h[i] = { ...h[i], [field]: value };
    setRequest({ ...request, headers: h });
  };
  const removeHeader = (i: number) => setRequest({ ...request, headers: request.headers.filter((_, idx) => idx !== i) });

  return (
    <div className="border-b border-border bg-card shrink-0">
      {/* URL Bar */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex gap-3 items-center">
          <Select
            value={request.method}
            onValueChange={(v) => setRequest({ ...request, method: v as HttpMethod })}
          >
            <SelectTrigger className={`w-28 h-9 bg-secondary border-border ${METHOD_COLORS[request.method] || ''} font-bold text-xs`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as HttpMethod[]).map(m => (
                <SelectItem key={m} value={m} className={`${METHOD_COLORS[m]} font-semibold text-xs`}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="https://api.example.com/users"
            value={request.url}
            onChange={(e) => setRequest({ ...request, url: e.target.value })}
            className="flex-1 h-9 bg-background border-border text-foreground placeholder:text-muted-foreground font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary"
          />

          <div className="flex gap-2 shrink-0">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSend}
                disabled={loading || !request.url}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-5 text-xs font-semibold glow-primary-sm"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Send
              </Button>
            </motion.div>
            {onSaveRequest && (
              <Button
                variant="outline"
                onClick={onSaveRequest}
                className="border-border text-muted-foreground hover:text-foreground h-9 px-4 text-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="params">
        <TabsList className="w-full justify-start gap-0 rounded-none border-b border-border bg-card px-5 h-10">
          {['params', 'headers', 'body'].map(tab => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground text-xs h-10 px-4 rounded-none capitalize"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="params" className="p-5 space-y-2 m-0 max-h-48 overflow-y-auto">
          {request.params.map((param, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={param.enabled}
                onChange={(e) => updateParam(i, 'enabled', e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border accent-primary"
              />
              <Input placeholder="Key" value={param.key} onChange={(e) => updateParam(i, 'key', e.target.value)}
                className="flex-1 h-8 bg-background border-border text-foreground placeholder:text-muted-foreground text-xs font-mono" />
              <Input placeholder="Value" value={param.value} onChange={(e) => updateParam(i, 'value', e.target.value)}
                className="flex-1 h-8 bg-background border-border text-foreground placeholder:text-muted-foreground text-xs font-mono" />
              <Button variant="ghost" size="icon" onClick={() => removeParam(i)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addParam}
            className="text-muted-foreground hover:text-foreground h-7 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Param
          </Button>
        </TabsContent>

        <TabsContent value="headers" className="p-5 space-y-2 m-0 max-h-48 overflow-y-auto">
          {request.headers.map((header, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={header.enabled}
                onChange={(e) => updateHeader(i, 'enabled', e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border accent-primary"
              />
              <Input placeholder="Key" value={header.key} onChange={(e) => updateHeader(i, 'key', e.target.value)}
                className="flex-1 h-8 bg-background border-border text-foreground placeholder:text-muted-foreground text-xs font-mono" />
              <Input placeholder="Value" value={header.value} onChange={(e) => updateHeader(i, 'value', e.target.value)}
                className="flex-1 h-8 bg-background border-border text-foreground placeholder:text-muted-foreground text-xs font-mono" />
              <Button variant="ghost" size="icon" onClick={() => removeHeader(i)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addHeader}
            className="text-muted-foreground hover:text-foreground h-7 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Header
          </Button>
        </TabsContent>

        <TabsContent value="body" className="p-5 m-0">
          <Textarea
            placeholder='{ "key": "value" }'
            value={request.body}
            onChange={(e) => setRequest({ ...request, body: e.target.value })}
            className="min-h-[140px] bg-background border-border text-foreground placeholder:text-muted-foreground font-mono text-xs resize-none"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
