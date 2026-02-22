import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { resolveRequestVariables } from '@/lib/variables';
import type { ApiRequest, KeyValuePair } from '@/types/api';
import type { Environment } from '@/lib/variables';

export interface SSEEvent {
  id: string;
  event?: string;
  data: string;
  idField?: string;
  timestamp: Date;
}

interface SSEClientProps {
  request: ApiRequest;
  setRequest: (r: ApiRequest) => void;
  activeEnvId: string | null;
  environments: Environment[];
  globalVars: KeyValuePair[];
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export function SSEClient({
  request,
  setRequest,
  activeEnvId,
  environments,
  globalVars,
}: SSEClientProps) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [eventFilter, setEventFilter] = useState('');
  const [reconnectOnDisconnect, setReconnectOnDisconnect] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const addEvent = useCallback((evt: Omit<SSEEvent, 'id'>) => {
    setEvents(prev => [...prev, { ...evt, id: `evt-${Date.now()}-${Math.random().toString(36).slice(2)}` }]);
  }, []);

  const connect = useCallback(() => {
    const resolved = resolveRequestVariables(request, activeEnvId, environments, globalVars);
    const url = resolved.url;
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      addEvent({ data: 'URL must start with http:// or https://', timestamp: new Date() });
      return;
    }
    setStatus('connecting');
    addEvent({ data: `Connecting to ${url}...`, timestamp: new Date() });
    try {
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        setStatus('connected');
        addEvent({ data: '[Connected]', timestamp: new Date() });
      };

      es.onmessage = (e) => {
        const evt: Omit<SSEEvent, 'id'> = {
          data: e.data || '',
          event: e.type || undefined,
          idField: e.lastEventId || undefined,
          timestamp: new Date(),
        };
        addEvent(evt);
      };

      es.addEventListener('error', () => {
        addEvent({ data: '[Error or connection lost]', timestamp: new Date() });
        setStatus('disconnected');
        es.close();
        eventSourceRef.current = null;
        if (reconnectOnDisconnect) {
          reconnectTimeoutRef.current = setTimeout(() => connect(), 2000);
        }
      });
    } catch (e) {
      setStatus('disconnected');
      addEvent({ data: `Error: ${e instanceof Error ? e.message : String(e)}`, timestamp: new Date() });
    }
  }, [request, activeEnvId, environments, globalVars, reconnectOnDisconnect, addEvent]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  useEffect(() => () => {
    disconnect();
  }, [disconnect]);

  const formatTime = (d: Date) => d.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });

  const filteredEvents = eventFilter.trim()
    ? events.filter(e => (e.event ?? 'message').toLowerCase().includes(eventFilter.toLowerCase()))
    : events;

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
          <Input
            placeholder="https://example.com/events"
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
        <div className="flex gap-4 mt-2 items-center flex-wrap">
          <label className="flex items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={reconnectOnDisconnect}
              onChange={(e) => setReconnectOnDisconnect(e.target.checked)}
              className="rounded accent-primary"
            />
            Reconnect on disconnect
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filter by event:</span>
            <Input
              placeholder="e.g. message"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="h-7 w-32 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Event log */}
      <div className="flex-1 flex flex-col min-h-0 p-4">
        <ScrollArea className="flex-1 min-h-[300px]">
          <div className="space-y-2">
            {filteredEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">Events will appear here when you connect.</p>
            ) : (
              filteredEvents.map((evt) => (
                <div key={evt.id} className="p-3 rounded-lg border border-border bg-card text-xs">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    {evt.event && <span className="font-semibold text-foreground">event: {evt.event}</span>}
                    {evt.idField && <span>id: {evt.idField}</span>}
                    <span>{formatTime(evt.timestamp)}</span>
                  </div>
                  <pre className="whitespace-pre-wrap break-words font-mono">{evt.data}</pre>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
