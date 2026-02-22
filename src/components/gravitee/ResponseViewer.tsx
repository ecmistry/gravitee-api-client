import { useState } from 'react';
import { Clock, Database, CheckCircle2, XCircle, AlertCircle, Send, Loader2, Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/api';

interface ResponseViewerProps {
  response: ApiResponse | null;
  loading: boolean;
}

function formatResponseBody(data: unknown, pretty: boolean): string {
  if (typeof data === 'string') return data;
  try {
    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  } catch {
    return String(data);
  }
}

export function ResponseViewer({ response, loading }: ResponseViewerProps) {
  const [bodyView, setBodyView] = useState<'pretty' | 'raw' | 'preview'>('pretty');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const getStatusStyle = (status: number) => {
    if (status >= 200 && status < 300) return 'text-status-success bg-status-success/10 border-status-success/30';
    if (status >= 300 && status < 400) return 'text-status-redirect bg-status-redirect/10 border-status-redirect/30';
    if (status >= 400 && status < 500) return 'text-status-client-error bg-status-client-error/10 border-status-client-error/30';
    if (status >= 500) return 'text-status-server-error bg-status-server-error/10 border-status-server-error/30';
    return 'text-muted-foreground bg-muted border-border';
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle2 className="w-3.5 h-3.5" />;
    if (status >= 400) return <XCircle className="w-3.5 h-3.5" />;
    return <AlertCircle className="w-3.5 h-3.5" />;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-3"
        >
          <Loader2 className="w-8 h-8 text-primary animate-spin-slow mx-auto" />
          <p className="text-xs text-muted-foreground">Sending request...</p>
        </motion.div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-3 max-w-xs">
          <div className="w-12 h-12 mx-auto rounded-xl bg-secondary border border-border flex items-center justify-center">
            <Send className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">No Response Yet</h3>
            <p className="text-xs text-muted-foreground">
              Enter a URL and click Send to see the response
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col bg-background min-h-0"
    >
      {/* Status Bar */}
      <div className="border-b border-border px-5 py-3 bg-card shrink-0">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-semibold text-xs ${getStatusStyle(response.status)}`}>
            {getStatusIcon(response.status)}
            <span>{response.status} {response.statusText}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{response.time}ms</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Database className="w-3.5 h-3.5" />
            <span className="font-mono">{(response.size / 1024).toFixed(2)} KB</span>
          </div>
        </div>
      </div>

      {/* Response Body */}
      <Tabs defaultValue="body" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start gap-0 rounded-none border-b border-border bg-card px-5 h-9 shrink-0">
          <TabsTrigger value="body"
            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground text-xs h-9 px-4 rounded-none">
            Body
          </TabsTrigger>
          <TabsTrigger value="headers"
            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground text-xs h-9 px-4 rounded-none">
            Headers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="flex-1 flex flex-col overflow-hidden m-0">
          <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-border shrink-0">
            <div className="flex rounded-md border border-border overflow-hidden">
              {(['pretty', 'raw', 'preview'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setBodyView(mode)}
                  className={`px-3 py-1.5 text-xs capitalize ${bodyView === mode ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => copyToClipboard(typeof response.data === 'string' ? response.data : formatResponseBody(response.data, bodyView === 'pretty'))}
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              Copy
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-auto">
          <div className="bg-card rounded-lg border border-border p-4">
            {bodyView === 'preview' && typeof response.data === 'string' && response.data.trimStart().startsWith('<') ? (
              <iframe
                srcDoc={response.data}
                title="Preview"
                className="w-full min-h-[200px] rounded border-0"
                sandbox="allow-same-origin"
              />
            ) : bodyView === 'preview' ? (
              <p className="text-xs text-muted-foreground">Preview is only available for HTML responses.</p>
            ) : (
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words leading-relaxed">
                {formatResponseBody(response.data, bodyView === 'pretty')}
              </pre>
            )}
          </div>
          </div>
        </TabsContent>

        <TabsContent value="headers" className="flex-1 p-4 overflow-auto m-0">
          <div className="space-y-1.5">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-3 p-3 bg-card rounded-lg border border-border">
                <span className="font-semibold text-xs text-primary font-mono min-w-[180px]">{key}</span>
                <span className="text-xs text-muted-foreground font-mono flex-1 break-all">{value}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
