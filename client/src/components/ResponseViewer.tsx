import { Clock, Database, CheckCircle2, XCircle, AlertCircle, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { Response } from '../App';

interface ResponseViewerProps {
  response: Response | null;
  loading: boolean;
}

export function ResponseViewer({ response, loading }: ResponseViewerProps) {
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    if (status >= 300 && status < 400) return 'text-blue-700 bg-blue-100 border-blue-200';
    if (status >= 400 && status < 500) return 'text-amber-700 bg-amber-100 border-amber-200';
    if (status >= 500) return 'text-red-700 bg-red-100 border-red-200';
    return 'text-gray-700 bg-gray-100 border-gray-200';
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle2 className="w-4 h-4" />;
    if (status >= 400) return <XCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--gravitee-sidebar-bg)]">
        <div className="text-center space-y-4">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 border-t-[var(--gravitee-primary)] animate-spin"></div>
          </div>
          <p className="text-sm text-gray-600">Sending request...</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--gravitee-sidebar-bg)]">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
            <Send className="w-8 h-8 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">No Response Yet</h3>
            <p className="text-sm text-gray-500">
              Enter a URL and click Send to see the response
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--gravitee-panel-bg)]">
      {/* Status Bar */}
      <div className="border-b border-[var(--gravitee-border)] px-6 py-4 bg-[var(--gravitee-sidebar-bg)]">
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded border font-semibold text-sm ${getStatusColor(response.status)}`}>
            {getStatusIcon(response.status)}
            <span>{response.status} {response.statusText}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 font-medium">{response.time}ms</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Database className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 font-medium">{(response.size / 1024).toFixed(2)} KB</span>
          </div>
        </div>
      </div>

      {/* Response Tabs */}
      <Tabs defaultValue="body" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start gap-6 rounded-none border-b border-[var(--gravitee-border)] bg-[var(--gravitee-sidebar-bg)] px-6 h-12">
          <TabsTrigger 
            value="body"
            className="flex-none data-[state=active]:bg-[var(--gravitee-panel-bg)] data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-[var(--gravitee-primary)] text-gray-600 text-sm h-11 px-6"
          >
            Body
          </TabsTrigger>
          <TabsTrigger 
            value="headers"
            className="flex-none data-[state=active]:bg-[var(--gravitee-panel-bg)] data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-[var(--gravitee-primary)] text-gray-600 text-sm h-11 px-6"
          >
            Headers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="flex-1 p-6 overflow-auto m-0 bg-[var(--gravitee-sidebar-bg)]">
          <div className="bg-[var(--gravitee-panel-bg)] rounded-lg border border-[var(--gravitee-border)] p-5 shadow-sm">
            <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
              {typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="headers" className="flex-1 p-6 overflow-auto m-0 bg-[var(--gravitee-sidebar-bg)]">
          <div className="space-y-3">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-4 p-4 bg-[var(--gravitee-panel-bg)] rounded-lg border border-[var(--gravitee-border)] shadow-sm">
                <span className="font-semibold text-sm min-w-[200px] text-[var(--gravitee-primary)]">{key}:</span>
                <span className="text-sm text-gray-700 flex-1 break-all">{value}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
