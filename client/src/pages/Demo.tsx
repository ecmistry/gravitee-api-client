import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Play, Copy, Check, Save, Share2, Trash2, ExternalLink, Download, Upload } from 'lucide-react';
import { useLocation } from 'wouter';

interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
  savedAt: number;
}

const SAMPLE_REQUESTS: SavedRequest[] = [
  {
    id: 'sample-1',
    name: 'Get Users',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/users',
    headers: { 'Content-Type': 'application/json' },
    body: null,
    savedAt: Date.now(),
  },
  {
    id: 'sample-2',
    name: 'Create Post',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Newton Test', body: 'Testing Newton API Client', userId: 1 }, null, 2),
    savedAt: Date.now(),
  },
  {
    id: 'sample-3',
    name: 'Get Post',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: { 'Content-Type': 'application/json' },
    body: null,
    savedAt: Date.now(),
  },
];

export default function Demo() {
  const [location] = useLocation();
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>(SAMPLE_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<SavedRequest>(SAMPLE_REQUESTS[0]);
  const [url, setUrl] = useState(selectedRequest.url);
  const [method, setMethod] = useState(selectedRequest.method);
  const [requestBody, setRequestBody] = useState(selectedRequest.body || '');
  const [response, setResponse] = useState('');
  const [responseTime, setResponseTime] = useState(0);
  const [statusCode, setStatusCode] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState('');

  // Load saved requests from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('newton-saved-requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedRequests([...SAMPLE_REQUESTS, ...parsed]);
      } catch (e) {
        console.error('Failed to load saved requests', e);
      }
    }

    // Check if URL has shared request
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('r');
    if (sharedData) {
      try {
        const decoded = JSON.parse(atob(sharedData));
        setUrl(decoded.url);
        setMethod(decoded.method);
        setRequestBody(decoded.body || '');
      } catch (e) {
        console.error('Failed to load shared request', e);
      }
    }
  }, []);

  const handleRequestSelect = (request: SavedRequest) => {
    setSelectedRequest(request);
    setUrl(request.url);
    setMethod(request.method);
    setRequestBody(request.body || '');
    setResponse('');
    setStatusCode(0);
    setResponseTime(0);
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    setResponse('');
    const startTime = Date.now();

    try {
      const options: RequestInit = {
        method,
        headers: selectedRequest.headers,
      };

      if (method !== 'GET' && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      const endTime = Date.now();

      setResponse(JSON.stringify(data, null, 2));
      setStatusCode(res.status);
      setResponseTime(endTime - startTime);
    } catch (error) {
      setResponse(JSON.stringify({ error: (error as Error).message }, null, 2));
      setStatusCode(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRequest = () => {
    const newRequest: SavedRequest = {
      id: `saved-${Date.now()}`,
      name: `Request ${savedRequests.length + 1}`,
      method,
      url,
      headers: { 'Content-Type': 'application/json' },
      body: requestBody || null,
      savedAt: Date.now(),
    };

    const userSaved = savedRequests.filter(r => !r.id.startsWith('sample-'));
    const updated = [...userSaved, newRequest];
    localStorage.setItem('newton-saved-requests', JSON.stringify(updated));
    setSavedRequests([...SAMPLE_REQUESTS, ...updated]);
    setSelectedRequest(newRequest);
  };

  const handleDeleteRequest = (id: string) => {
    if (id.startsWith('sample-')) return; // Can't delete samples
    
    const userSaved = savedRequests.filter(r => !r.id.startsWith('sample-') && r.id !== id);
    localStorage.setItem('newton-saved-requests', JSON.stringify(userSaved));
    setSavedRequests([...SAMPLE_REQUESTS, ...userSaved]);
    
    if (selectedRequest.id === id) {
      setSelectedRequest(SAMPLE_REQUESTS[0]);
      handleRequestSelect(SAMPLE_REQUESTS[0]);
    }
  };

  const handleShareRequest = () => {
    const shareData = {
      method,
      url,
      body: requestBody || null,
    };
    const encoded = btoa(JSON.stringify(shareData));
    const link = `${window.location.origin}/demo?r=${encoded}`;
    setShareLink(link);
    setShowShareModal(true);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportRequests = () => {
    const userSaved = savedRequests.filter(r => !r.id.startsWith('sample-'));
    const exportData = {
      version: '1.0.0',
      tool: 'Newton API Client',
      exportedAt: new Date().toISOString(),
      requests: userSaved,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newton-requests-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportRequests = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        let importedRequests: SavedRequest[] = [];
        
        // Detect format and convert
        if (data.tool === 'Newton API Client' && data.requests) {
          // Newton format
          importedRequests = data.requests;
        } else if (data._type === 'export' && data.resources) {
          // Insomnia format
          importedRequests = data.resources
            .filter((r: any) => r._type === 'request')
            .map((r: any) => ({
              id: `imported-${Date.now()}-${Math.random()}`,
              name: r.name || 'Imported Request',
              method: r.method || 'GET',
              url: r.url || '',
              headers: r.headers?.reduce((acc: any, h: any) => ({ ...acc, [h.name]: h.value }), {}) || {},
              body: r.body?.text || null,
              savedAt: Date.now(),
            }));
        } else if (data.info && data.item) {
          // Postman format
          const flattenItems = (items: any[]): any[] => {
            return items.flatMap(item => 
              item.item ? flattenItems(item.item) : [item]
            );
          };
          
          importedRequests = flattenItems(data.item)
            .filter((item: any) => item.request)
            .map((item: any) => ({
              id: `imported-${Date.now()}-${Math.random()}`,
              name: item.name || 'Imported Request',
              method: item.request.method || 'GET',
              url: typeof item.request.url === 'string' ? item.request.url : item.request.url?.raw || '',
              headers: item.request.header?.reduce((acc: any, h: any) => ({ ...acc, [h.key]: h.value }), {}) || {},
              body: item.request.body?.raw || null,
              savedAt: Date.now(),
            }));
        } else {
          throw new Error('Unsupported format. Please export from Newton, Insomnia, or Postman.');
        }
        
        if (importedRequests.length === 0) {
          throw new Error('No requests found in the file.');
        }
        
        // Merge with existing saved requests
        const userSaved = savedRequests.filter(r => !r.id.startsWith('sample-'));
        const merged = [...userSaved, ...importedRequests];
        localStorage.setItem('newton-saved-requests', JSON.stringify(merged));
        setSavedRequests([...SAMPLE_REQUESTS, ...merged]);
        setShowImportModal(false);
        setImportError('');
        
        // Show success message
        alert(`Successfully imported ${importedRequests.length} request(s)!`);
      } catch (error) {
        setImportError((error as Error).message);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const getMethodColor = (m: string) => {
    switch (m) {
      case 'GET': return 'bg-[#00D4D4] text-white';
      case 'POST': return 'bg-[#8B7FD8] text-white';
      case 'PUT': return 'bg-orange-500 text-white';
      case 'DELETE': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                N
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Newton API Client</h1>
                <p className="text-sm text-slate-600">Interactive Demo</p>
              </div>
            </div>
            <a href="/">
              <Button variant="outline">Back to Home</Button>
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Sample Requests */}
          <div className="col-span-3">
            <Card className="border-[#8B7FD8]/20">
              <CardContent className="p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Requests</h3>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveRequest} className="flex-1 bg-[#8B7FD8] text-white hover:opacity-90">
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" onClick={handleExportRequests} variant="outline" className="border-[#00D4D4] text-[#00D4D4] hover:bg-[#00D4D4]/10">
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button size="sm" onClick={() => setShowImportModal(true)} variant="outline" className="border-[#8B7FD8] text-[#8B7FD8] hover:bg-[#8B7FD8]/10">
                      <Upload className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {savedRequests.map((req) => (
                    <div
                      key={req.id}
                      className={`group relative p-3 rounded-lg transition-all ${
                        selectedRequest.id === req.id
                          ? 'bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                      }`}
                    >
                      <button
                        onClick={() => handleRequestSelect(req)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${getMethodColor(req.method)} text-xs`}>
                            {req.method}
                          </Badge>
                        </div>
                        <div className="text-sm font-medium">{req.name}</div>
                      </button>
                      {!req.id.startsWith('sample-') && (
                        <button
                          onClick={() => handleDeleteRequest(req.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <Card className="border-[#8B7FD8]/20">
              <CardContent className="p-6">
                {/* Request Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="px-4 py-2 border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#00D4D4]"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4D4]"
                      placeholder="Enter request URL"
                    />
                    <Button
                      onClick={handleShareRequest}
                      variant="outline"
                      className="border-[#00D4D4] text-[#00D4D4] hover:bg-[#00D4D4]/10"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      onClick={handleSendRequest}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] text-white hover:opacity-90 px-6"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isLoading ? 'Sending...' : 'Send'}
                    </Button>
                  </div>

                  <Tabs defaultValue="body" className="w-full">
                    <TabsList className="bg-slate-100">
                      <TabsTrigger value="body">Body</TabsTrigger>
                      <TabsTrigger value="headers">Headers</TabsTrigger>
                      <TabsTrigger value="params">Params</TabsTrigger>
                    </TabsList>
                    <TabsContent value="body" className="mt-4">
                      <textarea
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        className="w-full h-40 p-4 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4D4]"
                        placeholder="Request body (JSON)"
                        disabled={method === 'GET'}
                      />
                    </TabsContent>
                    <TabsContent value="headers" className="mt-4">
                      <div className="p-4 bg-slate-50 rounded-lg font-mono text-sm">
                        <div className="text-slate-600">Content-Type: application/json</div>
                      </div>
                    </TabsContent>
                    <TabsContent value="params" className="mt-4">
                      <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
                        No query parameters
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Response Section */}
                {response && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-slate-900">Response</h3>
                        {statusCode > 0 && (
                          <Badge className={statusCode < 400 ? 'bg-green-500' : 'bg-red-500'}>
                            {statusCode}
                          </Badge>
                        )}
                        {responseTime > 0 && (
                          <span className="text-sm text-slate-600">{responseTime}ms</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyResponse}
                        className="text-[#8B7FD8]"
                      >
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 font-mono text-sm">
                      {response}
                    </pre>
                  </div>
                )}

                {!response && !isLoading && (
                  <div className="text-center py-12 text-slate-500">
                    <p>Click "Send" to execute the request and see the response</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowImportModal(false)}>
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Import Requests</h3>
                <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-3">
                    Import requests from Newton, Insomnia, or Postman collections.
                  </p>
                  
                  <label className="block">
                    <div className="border-2 border-dashed border-[#8B7FD8]/30 rounded-lg p-8 text-center hover:border-[#8B7FD8] transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-[#8B7FD8]" />
                      <p className="text-sm font-medium text-slate-900 mb-1">Choose JSON file</p>
                      <p className="text-xs text-slate-500">Newton, Insomnia, or Postman format</p>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportRequests}
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>
                
                {importError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{importError}</p>
                  </div>
                )}
                
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-slate-700 mb-2">Supported formats:</p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li>• Newton API Client export files</li>
                    <li>• Insomnia export (JSON)</li>
                    <li>• Postman Collection v2.1</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
            <Card className="w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Share Request</h3>
                  <button onClick={() => setShowShareModal(false)} className="text-slate-500 hover:text-slate-700">
                    ✕
                  </button>
                </div>
                <p className="text-slate-600 mb-4">
                  Anyone with this link can view and execute this API request
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm font-mono"
                  />
                  <Button onClick={copyShareLink} className="bg-[#00D4D4] text-white hover:opacity-90">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <a href={shareLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full border-[#8B7FD8] text-[#8B7FD8]">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-8 p-6 bg-gradient-to-r from-[#8B7FD8]/10 to-[#00D4D4]/10 rounded-lg border border-[#8B7FD8]/20">
          <h3 className="font-semibold text-slate-900 mb-2">Try Newton Now!</h3>
          <p className="text-slate-700 mb-4">
            This interactive demo simulates Newton's core functionality. Download the full desktop app for advanced features like environment variables, authentication, GraphQL, WebSocket support, and more.
          </p>
          <a href="/getting-started">
            <Button className="bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] text-white hover:opacity-90">
              Download Newton
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
