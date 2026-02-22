import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Square, Send, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { resolveRequestVariables } from '@/lib/variables';
import type { ApiRequest, KeyValuePair } from '@/types/api';
import type { Environment } from '@/lib/variables';

export interface WsMessage {
  id: string;
  direction: 'sent' | 'received' | 'ping' | 'pong' | 'system';
  payload: string;
  timestamp: Date;
}

interface WebSocketClientProps {
  request: ApiRequest;
  setRequest: (r: ApiRequest) => void;
  activeEnvId: string | null;
  environments: Environment[];
  globalVars: KeyValuePair[];
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export function WebSocketClient({
  request,
  setRequest,
  activeEnvId,
  environments,
  globalVars,
}: WebSocketClientProps) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<WsMessage[]>([]);
  const [composeText, setComposeText] = useState('');
  const [composeMode, setComposeMode] = useState<'text' | 'json'>('text');
  const wsRef = useRef<WebSocket | null>(null);

  const addMessage = useCallback((msg: Omit<WsMessage, 'id'>) => {
    setMessages(prev => [...prev, { ...msg, id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}` }]);
  }, []);

  const connect = useCallback(() => {
    const resolved = resolveRequestVariables(request, activeEnvId, environments, globalVars);
    const url = resolved.url;
    if (!url || (!url.startsWith('ws://') && !url.startsWith('wss://'))) {
      addMessage({ direction: 'system', payload: 'URL must start with ws:// or wss://', timestamp: new Date() });
      return;
    }
    setStatus('connecting');
    addMessage({ direction: 'system', payload: `Connecting to ${url}...`, timestamp: new Date() });
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => {
        setStatus('connected');
        addMessage({ direction: 'system', payload: 'Connected', timestamp: new Date() });
      };
      ws.onclose = () => {
        setStatus('disconnected');
        wsRef.current = null;
        addMessage({ direction: 'system', payload: 'Disconnected', timestamp: new Date() });
      };
      ws.onerror = () => {
        addMessage({ direction: 'system', payload: 'Connection error', timestamp: new Date() });
      };
      ws.onmessage = (e) => {
        const data = typeof e.data === 'string' ? e.data : `[Binary ${e.data.size} bytes]`;
        addMessage({ direction: 'received', payload: data, timestamp: new Date() });
      };
    } catch (e) {
      setStatus('disconnected');
      addMessage({ direction: 'system', payload: `Error: ${e instanceof Error ? e.message : String(e)}`, timestamp: new Date() });
    }
  }, [request, activeEnvId, environments, globalVars, addMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  const send = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      addMessage({ direction: 'system', payload: 'Not connected', timestamp: new Date() });
      return;
    }
    let text = composeText.trim();
    if (composeMode === 'json') {
      try {
        JSON.parse(text);
      } catch {
        addMessage({ direction: 'system', payload: 'Invalid JSON', timestamp: new Date() });
        return;
      }
    }
    ws.send(text);
    addMessage({ direction: 'sent', payload: text, timestamp: new Date() });
    setComposeText('');
  }, [composeText, composeMode, addMessage]);

  useEffect(() => () => {
    if (wsRef.current) wsRef.current.close();
  }, []);

  const addHeader = () => setRequest({ ...request, headers: [...request.headers, { key: '', value: '', enabled: true }] });
  const updateHeader = (i: number, field: string, value: string | boolean) => {
    const h = [...request.headers];
    h[i] = { ...h[i], [field]: value };
    setRequest({ ...request, headers: h });
  };
  const removeHeader = (i: number) => setRequest({ ...request, headers: request.headers.filter((_, j) => j !== i) });

  const formatTime = (d: Date) => d.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });

  const getStatusBadge = () => {
    const base = 'px-2 py-0.5 rounded text-xs font-medium';
    if (status === 'connected') return `${base} bg-status-success/20 text-status-success`;
    if (status === 'connecting') return `${base} bg-yellow-500/20 text-yellow-600 dark:text-yellow-400`;
    return `${base} bg-muted text-muted-foreground`;
  };

  return (
    <div className="flex-1 flex flex-col border-b border-border bg-card min-h-0">
      {/* URL bar */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex gap-3 items-center">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="ws:// or wss:// URL"
              value={request.url}
              onChange={(e) => setRequest({ ...request, url: e.target.value })}
              className="h-9 font-mono text-sm"
            />
          </div>
          <div className={`shrink-0 ${getStatusBadge()}`}>
            {status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Disconnected'}
          </div>
          {status === 'disconnected' ? (
            <Button onClick={connect} disabled={!request.url} className="bg-primary h-9">
              <Play className="w-3.5 h-3.5 mr-1.5" /> Connect
            </Button>
          ) : (
            <Button variant="outline" onClick={disconnect} className="h-9">
              <Square className="w-3.5 h-3.5 mr-1.5" /> Disconnect
            </Button>
          )}
        </div>
        {request.description && (
          <p className="text-xs text-muted-foreground mt-2">{request.description}</p>
        )}
      </div>

      <Tabs defaultValue="messages">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-card px-5 h-10">
          <TabsTrigger value="messages" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Messages</TabsTrigger>
          <TabsTrigger value="headers" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Headers</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="flex-1 flex flex-col m-0 min-h-0">
          {/* Message log */}
          <ScrollArea className="flex-1 min-h-[200px] p-4">
            <div className="space-y-2">
              {messages.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4">Messages will appear here when you connect and send/receive.</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2 rounded text-xs font-mono ${
                      m.direction === 'sent' ? 'bg-primary/10 border-l-2 border-primary' :
                      m.direction === 'received' ? 'bg-status-success/10 border-l-2 border-status-success' :
                      m.direction === 'system' ? 'bg-muted/50 border-l-2 border-muted-foreground' :
                      'bg-muted/30'
                    }`}
                  >
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span className="uppercase">{m.direction}</span>
                      <span>{formatTime(m.timestamp)}</span>
                    </div>
                    <pre className="whitespace-pre-wrap break-words">{m.payload}</pre>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Composer */}
          <div className="p-4 border-t border-border space-y-2">
            <div className="flex gap-2">
              {(['text', 'json'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setComposeMode(m)}
                  className={`px-2 py-1 text-xs rounded ${composeMode === m ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <Textarea
              placeholder={composeMode === 'json' ? '{"key": "value"}' : 'Type a message...'}
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              className="min-h-[60px] font-mono text-xs"
            />
            <Button onClick={send} disabled={status !== 'connected'} size="sm">
              <Send className="w-3.5 h-3.5 mr-1" /> Send
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="headers" className="p-5 m-0 space-y-2 max-h-48 overflow-y-auto">
          <p className="text-[10px] text-muted-foreground">Note: Browser WebSocket API does not support custom headers. These are stored for reference.</p>
          {request.headers.map((h, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={h.enabled}
                onChange={(e) => updateHeader(i, 'enabled', e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-primary"
              />
              <Input placeholder="Key" value={h.key} onChange={(e) => updateHeader(i, 'key', e.target.value)} className="flex-1 h-8 text-xs font-mono" />
              <Input placeholder="Value" value={h.value} onChange={(e) => updateHeader(i, 'value', e.target.value)} className="flex-1 h-8 text-xs font-mono" />
              <Button variant="ghost" size="icon" onClick={() => removeHeader(i)} className="h-8 w-8">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addHeader} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Header
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
