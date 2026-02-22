import { useState } from 'react';
import { FileText, Download, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import ReactMarkdown from 'react-markdown';
import { getAllRequests } from '@/lib/collections';
import { getHistory } from '@/lib/history';
import { collectionToStaticHTML, collectionToOpenAPI } from '@/lib/apiDocs';
import type { Collection, ApiRequest, ApiResponse } from '@/types/api';
import { METHOD_BG_COLORS } from '@/types/api';
import { toast } from 'sonner';

function parseUrl(u: string): { path: string } {
  try {
    return { path: new URL(u).pathname || u };
  } catch {
    return { path: u };
  }
}

interface ApiDocsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
}

export function ApiDocs({ open, onOpenChange, collections }: ApiDocsProps) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);
  const httpRequests = selectedCollection
    ? getAllRequests(selectedCollection).filter((r) => (r.requestType ?? 'http') === 'http')
    : [];

  const historyByRequest = new Map<string, ApiResponse>();
  getHistory().forEach((entry) => {
    if (entry.request.id && !historyByRequest.has(entry.request.id)) {
      historyByRequest.set(entry.request.id, entry.response);
    }
  });

  const selectedRequest = selectedRequestId
    ? httpRequests.find((r) => r.id === selectedRequestId)
    : httpRequests[0] ?? null;

  const handleExportHTML = () => {
    if (!selectedCollection) return;
    const html = collectionToStaticHTML(selectedCollection, historyByRequest);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCollection.name.replace(/\s+/g, '-')}-api-docs.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('API documentation exported as HTML');
  };

  const handleExportOpenAPI = (format: 'json' | 'yaml') => {
    if (!selectedCollection) return;
    const content = collectionToOpenAPI(selectedCollection, format);
    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/yaml',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCollection.name.replace(/\s+/g, '-')}-openapi.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as OpenAPI ${format.toUpperCase()}`);
  };

  const getExampleResponse = (req: ApiRequest): string => {
    const hist = historyByRequest.get(req.id);
    if (hist?.data != null) {
      try {
        return typeof hist.data === 'string' ? hist.data : JSON.stringify(hist.data, null, 2);
      } catch {
        return '{}';
      }
    }
    if (req.bodyType === 'json' && req.body) {
      try {
        return JSON.stringify(JSON.parse(req.body), null, 2);
      } catch {
        return req.body;
      }
    }
    return '{}';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl max-h-[90vh] flex flex-col"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            API Documentation
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedCollectionId}
              onValueChange={(v) => {
                setSelectedCollectionId(v);
                setSelectedRequestId(null);
              }}
            >
              <SelectTrigger className="w-56">
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
            <Button variant="outline" size="sm" onClick={handleExportHTML} disabled={!selectedCollection}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export HTML
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExportOpenAPI('json')} disabled={!selectedCollection}>
              <FileCode className="w-3.5 h-3.5 mr-1.5" />
              OpenAPI JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExportOpenAPI('yaml')} disabled={!selectedCollection}>
              <FileCode className="w-3.5 h-3.5 mr-1.5" />
              OpenAPI YAML
            </Button>
          </div>

          <div className="flex-1 flex min-h-0 gap-4">
            {selectedCollection ? (
              <>
                <aside className="w-48 shrink-0 border rounded-lg overflow-hidden flex flex-col">
                  <div className="px-3 py-2 border-b bg-muted/50 text-xs font-medium">Endpoints</div>
                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-0.5">
                      {selectedCollection.requests
                        .filter((r) => (r.requestType ?? 'http') === 'http')
                        .map((r) => (
                          <button
                            key={r.id}
                            onClick={() => setSelectedRequestId(r.id)}
                            className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-muted ${selectedRequestId === r.id || (!selectedRequestId && r.id === httpRequests[0]?.id) ? 'bg-muted' : ''}`}
                          >
                            {r.name}
                          </button>
                        ))}
                      {selectedCollection.folders?.map((f) => (
                        <div key={f.id} className="mt-2">
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                            {f.name}
                          </div>
                          {f.requests
                            .filter((r) => (r.requestType ?? 'http') === 'http')
                            .map((r) => (
                              <button
                                key={r.id}
                                onClick={() => setSelectedRequestId(r.id)}
                                className={`w-full text-left px-2 py-1 pl-4 rounded text-sm hover:bg-muted ${selectedRequestId === r.id ? 'bg-muted' : ''}`}
                              >
                                {r.name}
                              </button>
                            ))}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </aside>
                <div className="flex-1 min-w-0 overflow-auto border rounded-lg p-4">
                  {selectedRequest ? (
                    <RequestDocView
                      request={selectedRequest}
                      exampleResponse={getExampleResponse(selectedRequest)}
                    />
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      {selectedCollection.description ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{selectedCollection.description}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>Select an endpoint from the sidebar.</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm py-8">Select a collection to view documentation.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RequestDocView({ request, exampleResponse }: { request: ApiRequest; exampleResponse: string }) {
  const { path } = parseUrl(request.url);
  const enabledParams = request.params.filter((p) => p.enabled && p.key);
  const enabledHeaders = request.headers.filter((h) => h.enabled && h.key);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`text-xs font-mono px-1.5 py-0.5 rounded ${METHOD_BG_COLORS[request.method] ?? 'bg-muted'}`}
        >
          {request.method}
        </span>
        <code className="text-sm font-mono">{path || request.url}</code>
      </div>

      {request.description && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{request.description}</ReactMarkdown>
        </div>
      )}

      {enabledParams.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Query Parameters</h4>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {enabledParams.map((p) => (
                  <tr key={p.key} className="border-t">
                    <td className="p-2 font-mono">{p.key}</td>
                    <td className="p-2 text-muted-foreground">{p.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {enabledHeaders.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Headers</h4>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {enabledHeaders.map((h) => (
                  <tr key={h.key} className="border-t">
                    <td className="p-2 font-mono">{h.key}</td>
                    <td className="p-2 text-muted-foreground">{h.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {request.body && request.method !== 'GET' && request.method !== 'HEAD' && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Request Body</h4>
          <pre className="p-3 rounded bg-muted/50 text-xs font-mono overflow-x-auto">
            {request.body}
          </pre>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold mb-2">Example Response</h4>
        <pre className="p-3 rounded bg-muted/50 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
          {exampleResponse}
        </pre>
      </div>
    </div>
  );
}
