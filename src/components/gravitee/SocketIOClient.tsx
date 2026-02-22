import { useState, useRef, useCallback, useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Play, Square, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { resolveRequestVariables } from '@/lib/variables';
import type { ApiRequest, KeyValuePair } from '@/types/api';
import type { Environment } from '@/lib/variables';

export interface SocketIOMessage {
  id: string;
  direction: 'sent' | 'received';
  event: string;
  payload: string;
  timestamp: Date;
}

interface SocketIOClientProps {
  request: ApiRequest;
  setRequest: (r: ApiRequest) => void;
  activeEnvId: string | null;
  environments: Environment[];
  globalVars: KeyValuePair[];
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export function SocketIOClient({
  request,
  setRequest,
  activeEnvId,
  environments,
  globalVars,
}: SocketIOClientProps) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<SocketIOMessage[]>([]);
  const [emitEvent, setEmitEvent] = useState('');
  const [emitPayload, setEmitPayload] = useState('{}');
  const [listenFilter, setListenFilter] = useState('');
  const socketRef = useRef<Socket | null>(null);

  const addMessage = useCallback((msg: Omit<SocketIOMessage, 'id'>) => {
    setMessages(prev => [...prev, { ...msg, id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}` }]);
  }, []);

  const connect = useCallback(() => {
    const resolved = resolveRequestVariables(request, activeEnvId, environments, globalVars);
    const url = resolved.url;
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      addMessage({ direction: 'received', event: 'error', payload: 'URL must start with http:// or https://', timestamp: new Date() });
      return;
    }
    setStatus('connecting');
    addMessage({ direction: 'received', event: 'info', payload: `Connecting to ${url}...`, timestamp: new Date() });
    try {
      const socket = io(url, { autoConnect: true });
      socketRef.current = socket;
      socket.on('connect', () => {
        setStatus('connected');
        addMessage({ direction: 'received', event: 'connect', payload: `Connected (id: ${socket.id})`, timestamp: new Date() });
      });
      socket.on('disconnect', (reason) => {
        setStatus('disconnected');
        socketRef.current = null;
        addMessage({ direction: 'received', event: 'disconnect', payload: reason || 'Disconnected', timestamp: new Date() });
      });
      socket.onAny((event, ...args) => {
        addMessage({ direction: 'received', event, payload: JSON.stringify(args.length === 1 ? args[0] : args), timestamp: new Date() });
      });
    } catch (e) {
      setStatus('disconnected');
      addMessage({ direction: 'received', event: 'error', payload: String(e), timestamp: new Date() });
    }
  }, [request, activeEnvId, environments, globalVars, addMessage]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  const doEmit = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      addMessage({ direction: 'received', event: 'error', payload: 'Not connected', timestamp: new Date() });
      return;
    }
    const eventName = emitEvent.trim();
    if (!eventName) {
      addMessage({ direction: 'received', event: 'error', payload: 'Event name required', timestamp: new Date() });
      return;
    }
    let payload: unknown;
    try {
      payload = JSON.parse(emitPayload.trim() || '{}');
    } catch {
      payload = emitPayload;
    }
    socket.emit(eventName, payload);
    addMessage({ direction: 'sent', event: eventName, payload: typeof payload === 'string' ? payload : JSON.stringify(payload), timestamp: new Date() });
    setEmitPayload('{}');
  }, [emitEvent, emitPayload, addMessage]);

  useEffect(() => () => {
    if (socketRef.current) socketRef.current.disconnect();
  }, []);

  const formatTime = (d: Date) => d.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });

  const filteredMessages = listenFilter.trim()
    ? messages.filter(m => m.event.toLowerCase().includes(listenFilter.toLowerCase()))
    : messages;

  const getStatusBadge = () => {
    const base = 'px-2 py-0.5 rounded text-xs font-medium';
    if (status === 'connected') return `${base} bg-status-success/20 text-status-success`;
    if (status === 'connecting') return `${base} bg-yellow-500/20 text-yellow-600 dark:text-yellow-400`;
    return `${base} bg-muted text-muted-foreground`;
  };

  return (
    <div className="flex-1 flex flex-col border-b border-border bg-card min-h-0">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex gap-3 items-center">
          <Input
            placeholder="https://example.com or http://localhost:3000"
            value={request.url}
            onChange={(e) => setRequest({ ...request, url: e.target.value })}
            className="flex-1 h-9 font-mono text-sm"
          />
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
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">Filter events:</span>
          <Input
            placeholder="e.g. message"
            value={listenFilter}
            onChange={(e) => setListenFilter(e.target.value)}
            className="h-7 w-32 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col min-h-0">
            <h3 className="text-xs font-semibold mb-2">Emit Event</h3>
            <div className="space-y-2">
              <Input
                placeholder="Event name"
                value={emitEvent}
                onChange={(e) => setEmitEvent(e.target.value)}
                className="h-8 text-xs font-mono"
              />
              <Textarea
                placeholder='{"key": "value"}'
                value={emitPayload}
                onChange={(e) => setEmitPayload(e.target.value)}
                className="min-h-[60px] font-mono text-xs"
              />
              <Button onClick={doEmit} disabled={status !== 'connected'} size="sm">
                <Send className="w-3.5 h-3.5 mr-1" /> Emit
              </Button>
            </div>
          </div>
          <div className="flex flex-col min-h-0">
            <h3 className="text-xs font-semibold mb-2">Event Log</h3>
            <ScrollArea className="flex-1 min-h-[200px] border rounded-lg p-2">
              {filteredMessages.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4">Events will appear here.</p>
              ) : (
                filteredMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2 rounded text-xs font-mono mb-1 ${
                      m.direction === 'sent' ? 'bg-primary/10' : 'bg-status-success/10'
                    }`}
                  >
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span className="uppercase">{m.direction} • {m.event}</span>
                      <span>{formatTime(m.timestamp)}</span>
                    </div>
                    <pre className="whitespace-pre-wrap break-words">{m.payload}</pre>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
