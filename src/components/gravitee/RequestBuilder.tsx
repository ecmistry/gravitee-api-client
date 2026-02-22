import { Send, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { saveToHistory } from '@/lib/history';
import { applyAuth } from '@/lib/auth';
import { resolveRequestVariables } from '@/lib/variables';
import { runPreRequestScript, runTestScript } from '@/lib/scripting';
import { motion } from 'framer-motion';
import type { ApiRequest, ApiResponse, BodyType, HttpMethod } from '@/types/api';
import type { Environment } from '@/lib/variables';
import type { KeyValuePair } from '@/types/api';
import type { AuthConfig } from '@/types/auth';
import { METHOD_COLORS } from '@/types/api';
import { AuthTab } from './AuthTab';

const RAW_CONTENT_TYPES: Record<string, string> = {
  json: 'application/json',
  xml: 'application/xml',
  text: 'text/plain',
  html: 'text/html',
};

interface RequestBuilderProps {
  request: ApiRequest;
  setRequest: (request: ApiRequest) => void;
  setResponse: (response: ApiResponse | null) => void;
  setTestResults?: (results: Array<{ name: string; passed: boolean; error?: string }>) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSaveRequest?: () => void;
  activeEnvId?: string | null;
  environments?: Environment[];
  globalVars?: KeyValuePair[];
  /** Auth from parent folder or collection when request uses "Inherit from Parent" */
  inheritedAuth?: AuthConfig;
  /** Whether request can inherit (in folder or collection with auth) */
  canInherit?: boolean;
  inheritedAuthLabel?: string;
}

export function RequestBuilder({ request, setRequest, setResponse, setTestResults, loading, setLoading, onSaveRequest, activeEnvId = null, environments = [], globalVars = [], inheritedAuth, canInherit = false, inheritedAuthLabel }: RequestBuilderProps) {
  // Resolved with env/global vars only (pre-request script vars added at send time)
  const resolvedRequest = resolveRequestVariables(request, activeEnvId, environments, globalVars);

  const getEffectiveAuthConfig = (): AuthConfig | undefined => {
    if (request.authInherit === 'inherit' && canInherit && inheritedAuth) return inheritedAuth;
    return request.auth;
  };

  const buildBodyAndHeaders = (req: ApiRequest): { body?: string | FormData; headers: Record<string, string>; authParams: Record<string, string> } => {
    const headers: Record<string, string> = {};
    req.headers.forEach(h => {
      if (h.enabled && h.key) headers[h.key] = h.value;
    });
    const authResult = applyAuth(getEffectiveAuthConfig());
    Object.assign(headers, authResult.headers);

    if (req.method === 'GET' || req.method === 'HEAD') return { headers, authParams: authResult.params };

    const bodyType = req.bodyType || 'none';
    if (bodyType === 'none') return { headers, authParams: authResult.params };

    if (bodyType === 'form-urlencoded') {
      const formData = req.formData ?? [];
      const params = new URLSearchParams();
      formData.forEach(p => { if (p.enabled && p.key) params.append(p.key, p.value); });
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      return { body: params.toString(), headers, authParams: authResult.params };
    }

    if (bodyType === 'form-data') {
      const formData = req.formData ?? [];
      const fd = new FormData();
      formData.forEach(p => { if (p.enabled && p.key) fd.append(p.key, p.value); });
      return { body: fd, headers, authParams: authResult.params };
    }

    // Raw: json, xml, text, html
    if (['json', 'xml', 'text', 'html'].includes(bodyType)) {
      headers['Content-Type'] = RAW_CONTENT_TYPES[bodyType] ?? 'text/plain';
    }
    return { body: req.body || undefined, headers, authParams: authResult.params };
  };

  const handleSend = async () => {
    setLoading(true);
    setTestResults?.([]);
    const startTime = Date.now();
    try {
      // Run pre-request script and merge vars
      let scriptVars = new Map<string, string>();
      if (request.preRequestScript?.trim()) {
        try {
          const sv = { environment: new Map<string, string>(), globals: new Map<string, string>() };
          runPreRequestScript(request.preRequestScript, sv);
          sv.environment.forEach((v, k) => scriptVars.set(k, v));
          sv.globals.forEach((v, k) => scriptVars.set(k, v));
        } catch (e) {
          setResponse({ status: 0, statusText: 'Pre-request script error', headers: {}, data: { error: e instanceof Error ? e.message : String(e) }, time: 0, size: 0 });
          setLoading(false);
          return;
        }
      }
      const toSend = resolveRequestVariables(request, activeEnvId, environments, globalVars, scriptVars);
      const built = buildBodyAndHeaders(toSend);
      let targetUrl: string;
      try {
        const url = new URL(toSend.url);
        toSend.params.forEach(p => {
          if (p.enabled && p.key) url.searchParams.append(p.key, p.value);
        });
        Object.entries(built.authParams).forEach(([k, v]) => url.searchParams.append(k, v));
        targetUrl = url.toString();
      } catch {
        setResponse({ status: 0, statusText: 'Invalid URL', headers: {}, data: { error: 'Invalid URL' }, time: 0, size: 0 });
        setLoading(false);
        return;
      }

      const { body, headers } = built;

      // Use CORS proxy in dev to avoid browser CORS restrictions
      let proxyPayload: { url: string; method: string; headers: Record<string, string>; body?: string; formData?: Array<{ key: string; value: string }> } = {
        url: targetUrl, method: toSend.method, headers
      };
      if (toSend.method !== 'GET' && toSend.method !== 'HEAD') {
        if (body instanceof FormData) {
          proxyPayload.formData = toSend.formData?.filter(p => p.enabled && p.key).map(p => ({ key: p.key, value: p.value })) ?? [];
        } else if (body !== undefined) {
          proxyPayload.body = body;
        }
      }

      const useProxy = import.meta.env.DEV || import.meta.env.VITE_USE_CORS_PROXY === "true";
      const res = useProxy
        ? await fetch('/api-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proxyPayload),
          }).then(async (r) => {
            const text = await r.text();
            return new Response(text, { status: r.status, statusText: r.statusText, headers: r.headers });
          })
        : await fetch(targetUrl, { method: toSend.method, headers, body });
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
      if (request.testScript?.trim() && setTestResults) {
        const results = runTestScript(request.testScript, responseData);
        setTestResults(results);
      }
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

  const formData = request.formData ?? [];
  const addFormData = () => setRequest({
    ...request,
    formData: [...formData, { key: '', value: '', enabled: true }]
  });
  const updateFormData = (i: number, field: string, value: string | boolean) => {
    const fd = [...formData];
    fd[i] = { ...fd[i], [field]: value };
    setRequest({ ...request, formData: fd });
  };
  const removeFormData = (i: number) => setRequest({ ...request, formData: formData.filter((_, idx) => idx !== i) });

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

          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
            <Input
              placeholder="https://api.example.com/users or use {{variableName}}"
              value={request.url}
              onChange={(e) => setRequest({ ...request, url: e.target.value })}
              className="h-9 bg-background border-border text-foreground placeholder:text-muted-foreground font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {(activeEnvId || globalVars?.length) && /\{\{\w+\}\}/.test(request.url) && (
              <span className="text-[10px] text-primary/80 font-mono">Variables will be resolved on Send</span>
            )}
          </div>

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
        <div className="mt-2">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Description</label>
          <Textarea
            placeholder="Optional description for this request"
            value={request.description ?? ''}
            onChange={(e) => setRequest({ ...request, description: e.target.value })}
            className="min-h-[48px] bg-background border-border text-foreground placeholder:text-muted-foreground text-xs resize-none"
            rows={2}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="params">
        <TabsList className="w-full justify-start gap-0 rounded-none border-b border-border bg-card px-5 h-10">
          {['params', 'headers', 'body', 'auth', 'pre-request', 'tests'].map(tab => (
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

        <TabsContent value="auth" className="m-0">
          <AuthTab
            auth={request.auth}
            authInherit={request.authInherit ?? 'none'}
            canInherit={canInherit}
            inheritedAuthLabel={inheritedAuthLabel}
            onChangeAuth={(auth) => setRequest({ ...request, auth })}
            onChangeAuthInherit={(authInherit) => setRequest({ ...request, authInherit })}
          />
        </TabsContent>

        <TabsContent value="pre-request" className="p-5 m-0">
          <Textarea
            placeholder={`pm.environment.set("token", "abc123");\npm.globals.set("timestamp", Date.now().toString());\n// Generate dynamic values before the request fires`}
            value={request.preRequestScript ?? ''}
            onChange={(e) => setRequest({ ...request, preRequestScript: e.target.value })}
            className="min-h-[120px] w-full bg-background border-border text-foreground placeholder:text-muted-foreground font-mono text-xs resize-none"
          />
          <p className="text-[10px] text-muted-foreground mt-2">Use pm.environment.set() and pm.globals.set() to set variables available as &#123;&#123;varName&#125;&#125; in the request.</p>
        </TabsContent>

        <TabsContent value="tests" className="p-5 m-0">
          <Textarea
            placeholder={`pm.test("Status is 200", () => pm.expect(pm.response.code).to.equal(200));\npm.test("Has JSON body", () => pm.expect(pm.response.json()).to.be.a("object"));`}
            value={request.testScript ?? ''}
            onChange={(e) => setRequest({ ...request, testScript: e.target.value })}
            className="min-h-[120px] w-full bg-background border-border text-foreground placeholder:text-muted-foreground font-mono text-xs resize-none"
          />
          <p className="text-[10px] text-muted-foreground mt-2">Use pm.test() and pm.expect() for assertions. Results appear in the response Tests tab.</p>
        </TabsContent>

        <TabsContent value="body" className="p-5 m-0 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">Body type:</span>
            <Select
              value={request.bodyType || 'none'}
              onValueChange={(v) => setRequest({ ...request, bodyType: v as BodyType, formData: request.formData ?? [] })}
            >
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="none" className="text-xs">None</SelectItem>
                <SelectItem value="json" className="text-xs">Raw — JSON</SelectItem>
                <SelectItem value="xml" className="text-xs">Raw — XML</SelectItem>
                <SelectItem value="text" className="text-xs">Raw — Text</SelectItem>
                <SelectItem value="html" className="text-xs">Raw — HTML</SelectItem>
                <SelectItem value="form-urlencoded" className="text-xs">Form URL Encoded</SelectItem>
                <SelectItem value="form-data" className="text-xs">Form Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {['form-urlencoded', 'form-data'].includes(request.bodyType || '') ? (
            <div className="space-y-2">
              {formData.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(e) => updateFormData(i, 'enabled', e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-border accent-primary"
                  />
                  <Input placeholder="Key" value={row.key} onChange={(e) => updateFormData(i, 'key', e.target.value)}
                    className="flex-1 h-8 bg-background border-border text-foreground text-xs font-mono" />
                  <Input placeholder="Value" value={row.value} onChange={(e) => updateFormData(i, 'value', e.target.value)}
                    className="flex-1 h-8 bg-background border-border text-foreground text-xs font-mono" />
                  <Button variant="ghost" size="icon" onClick={() => removeFormData(i)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addFormData} className="text-muted-foreground hover:text-foreground h-7 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add field
              </Button>
            </div>
          ) : request.bodyType && request.bodyType !== 'none' ? (
            <div className="space-y-0.5">
              <Textarea
                placeholder={request.bodyType === 'json' ? '{ "key": "value" } or use {{variableName}}' : 'Enter request body... or use {{variableName}}'}
                value={request.body}
                onChange={(e) => setRequest({ ...request, body: e.target.value })}
                className="min-h-[140px] bg-background border-border text-foreground placeholder:text-muted-foreground font-mono text-xs resize-none"
              />
              {(activeEnvId || globalVars?.length) && request.body && /\{\{\w+\}\}/.test(request.body) && (
                <span className="text-[10px] text-primary/80 font-mono">Variables will be resolved on Send</span>
              )}
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
