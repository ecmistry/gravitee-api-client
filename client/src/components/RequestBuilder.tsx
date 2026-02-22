import { useState } from 'react';
import { Send, Plus, Trash2, Save } from 'lucide-react';
import { saveToHistory } from '../lib/history';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import type { Request, Response } from '../App';

interface RequestBuilderProps {
  request: Request;
  setRequest: (request: Request) => void;
  setResponse: (response: Response | null) => void;
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
      request.params.forEach(param => {
        if (param.enabled && param.key) {
          url.searchParams.append(param.key, param.value);
        }
      });

      const headers: Record<string, string> = {};
      request.headers.forEach(header => {
        if (header.enabled && header.key) {
          headers[header.key] = header.value;
        }
      });

      const targetUrl = url.toString();
      const fetchOptions: RequestInit = {
        method: request.method,
        headers
      };

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
            return new Response(text, {
              status: r.status,
              statusText: r.statusText,
              headers: r.headers,
            });
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
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const responseData = {
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

  const addParam = () => {
    setRequest({
      ...request,
      params: [...request.params, { key: '', value: '', enabled: true }]
    });
  };

  const updateParam = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newParams = [...request.params];
    newParams[index] = { ...newParams[index], [field]: value };
    setRequest({ ...request, params: newParams });
  };

  const removeParam = (index: number) => {
    setRequest({
      ...request,
      params: request.params.filter((_, i) => i !== index)
    });
  };

  const addHeader = () => {
    setRequest({
      ...request,
      headers: [...request.headers, { key: '', value: '', enabled: true }]
    });
  };

  const updateHeader = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newHeaders = [...request.headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setRequest({ ...request, headers: newHeaders });
  };

  const removeHeader = (index: number) => {
    setRequest({
      ...request,
      headers: request.headers.filter((_, i) => i !== index)
    });
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-emerald-600';
      case 'POST': return 'text-blue-600';
      case 'PUT': return 'text-amber-600';
      case 'DELETE': return 'text-red-600';
      case 'PATCH': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex-1 border-b border-[var(--gravitee-border)] bg-[var(--gravitee-panel-bg)]">
      <div className="px-6 py-5 border-b border-[var(--gravitee-border)]">
        <div className="flex gap-4 items-center pl-1">
          <Select
            value={request.method}
            onValueChange={(value) => setRequest({ ...request, method: value as any })}
          >
            <SelectTrigger className={`w-32 h-10 bg-[var(--gravitee-panel-bg)] border-[var(--gravitee-border)] ${getMethodColor(request.method)} font-semibold text-sm`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--gravitee-panel-bg)] border-[var(--gravitee-border)]">
              <SelectItem value="GET" className="text-emerald-600">GET</SelectItem>
              <SelectItem value="POST" className="text-blue-600">POST</SelectItem>
              <SelectItem value="PUT" className="text-amber-600">PUT</SelectItem>
              <SelectItem value="DELETE" className="text-red-600">DELETE</SelectItem>
              <SelectItem value="PATCH" className="text-purple-600">PATCH</SelectItem>
              <SelectItem value="HEAD" className="text-gray-600">HEAD</SelectItem>
              <SelectItem value="OPTIONS" className="text-gray-600">OPTIONS</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Enter request URL (e.g. https://api.example.com/users)"
            value={request.url}
            onChange={(e) => setRequest({ ...request, url: e.target.value })}
            className="flex-1 min-w-0 h-10 bg-[var(--gravitee-panel-bg)] border-[var(--gravitee-border)] text-gray-900 placeholder:text-gray-400 text-sm focus:border-[var(--gravitee-primary)] focus:ring-1 focus:ring-[var(--gravitee-primary)]"
          />

          <div className="flex gap-5 shrink-0">
            <Button 
              onClick={handleSend} 
              disabled={loading || !request.url}
              className="bg-[var(--gravitee-primary)] hover:bg-[var(--gravitee-primary-hover)] text-white h-10 min-w-[110px] px-6 text-sm font-medium shadow-sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
            {onSaveRequest && (
              <Button 
                variant="outline" 
                onClick={onSaveRequest}
                className="border-[var(--gravitee-border)] text-gray-700 hover:text-gray-900 hover:bg-gray-50 h-10 min-w-[110px] px-6 text-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="params" className="flex-1">
        <TabsList className="w-full justify-start gap-6 rounded-none border-b border-[var(--gravitee-border)] bg-[var(--gravitee-sidebar-bg)] px-6 h-12">
          <TabsTrigger 
            value="params" 
            className="flex-none data-[state=active]:bg-[var(--gravitee-panel-bg)] data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-[var(--gravitee-primary)] text-gray-600 text-sm h-11 px-6 py-0"
          >
            Params
          </TabsTrigger>
          <TabsTrigger 
            value="headers"
            className="flex-none data-[state=active]:bg-[var(--gravitee-panel-bg)] data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-[var(--gravitee-primary)] text-gray-600 text-sm h-11 px-6 py-0"
          >
            Headers
          </TabsTrigger>
          <TabsTrigger 
            value="body"
            className="flex-none data-[state=active]:bg-[var(--gravitee-panel-bg)] data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-[var(--gravitee-primary)] text-gray-600 text-sm h-11 px-6 py-0"
          >
            Body
          </TabsTrigger>
        </TabsList>

        <TabsContent value="params" className="p-6 pt-5 space-y-3 m-0">
          {request.params.map((param, index) => (
            <div key={index} className="flex gap-3 items-center">
              <input
                type="checkbox"
                checked={param.enabled}
                onChange={(e) => updateParam(index, 'enabled', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[var(--gravitee-primary)]"
              />
              <Input
                placeholder="Key"
                value={param.key}
                onChange={(e) => updateParam(index, 'key', e.target.value)}
                className="flex-1 h-9 bg-[var(--gravitee-panel-bg)] border-[var(--gravitee-border)] text-gray-900 placeholder:text-gray-400 text-sm"
              />
              <Input
                placeholder="Value"
                value={param.value}
                onChange={(e) => updateParam(index, 'value', e.target.value)}
                className="flex-1 h-9 bg-[var(--gravitee-panel-bg)] border-[var(--gravitee-border)] text-gray-900 placeholder:text-gray-400 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeParam(index)}
                className="h-9 w-9 text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={addParam}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Param
          </Button>
        </TabsContent>

        <TabsContent value="headers" className="p-6 pt-5 space-y-3 m-0">
          {request.headers.map((header, index) => (
            <div key={index} className="flex gap-3 items-center">
              <input
                type="checkbox"
                checked={header.enabled}
                onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[var(--gravitee-primary)]"
              />
              <Input
                placeholder="Key"
                value={header.key}
                onChange={(e) => updateHeader(index, 'key', e.target.value)}
                className="flex-1 h-9 bg-[var(--gravitee-panel-bg)] border-[var(--gravitee-border)] text-gray-900 placeholder:text-gray-400 text-sm"
              />
              <Input
                placeholder="Value"
                value={header.value}
                onChange={(e) => updateHeader(index, 'value', e.target.value)}
                className="flex-1 h-9 bg-[var(--gravitee-panel-bg)] border-[var(--gravitee-border)] text-gray-900 placeholder:text-gray-400 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeHeader(index)}
                className="h-9 w-9 text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={addHeader}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Header
          </Button>
        </TabsContent>

        <TabsContent value="body" className="p-6 pt-5 m-0">
          <Textarea
            placeholder="Request body (JSON, XML, etc.)"
            value={request.body}
            onChange={(e) => setRequest({ ...request, body: e.target.value })}
            className="min-h-[200px] bg-[var(--gravitee-panel-bg)] border-[var(--gravitee-border)] text-gray-900 placeholder:text-gray-400 font-mono text-sm resize-none"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
