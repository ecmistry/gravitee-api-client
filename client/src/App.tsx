import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { RequestBuilder } from './components/RequestBuilder';
import { ResponseViewer } from './components/ResponseViewer';
import { TopBar } from './components/TopBar';

export interface Collection {
  id: string;
  name: string;
  folders: Folder[];
  requests: Request[];
}

export interface Folder {
  id: string;
  name: string;
  requests: Request[];
}

export interface Request {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  params: Array<{ key: string; value: string; enabled: boolean }>;
  headers: Array<{ key: string; value: string; enabled: boolean }>;
  body: string;
  bodyType: 'none' | 'json' | 'form' | 'raw';
}

export interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
  size: number;
}

function App() {
  const [collections, setCollections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('api-client-collections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved collections:', e);
      }
    }
    return [
      {
        id: 'default',
        name: 'My Workspace',
        folders: [],
        requests: []
      }
    ];
  });
  
  // Save to localStorage whenever collections change
  useEffect(() => {
    localStorage.setItem('api-client-collections', JSON.stringify(collections));
  }, [collections]);
  
  const [activeRequest, setActiveRequest] = useState<Request>({
    id: 'temp',
    name: 'Untitled Request',
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    body: '',
    bodyType: 'none'
  });
  
  const [response, setResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSaveRequest = () => {
    if (activeRequest.id === 'temp') {
      // New request - add to default collection
      const newRequest = {
        ...activeRequest,
        id: `req-${Date.now()}`,
        name: activeRequest.url ? new URL(activeRequest.url).pathname : 'New Request'
      };
      
      setCollections(collections.map(col => 
        col.id === 'default'
          ? { ...col, requests: [...col.requests, newRequest] }
          : col
      ));
      setActiveRequest(newRequest);
    } else {
      // Update existing request
      setCollections(collections.map(col => ({
        ...col,
        requests: col.requests.map(req => 
          req.id === activeRequest.id ? activeRequest : req
        )
      })));
    }
  };
  return (
    <div className="h-screen flex flex-col bg-[var(--gravitee-sidebar-bg)]">
      <Toaster position="top-right" />
      
      <TopBar 
        collections={collections}
        setCollections={setCollections}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          collections={collections}
          setCollections={setCollections}
          activeRequest={activeRequest}
          setActiveRequest={setActiveRequest}
        />
        
        <div className="flex-1 flex flex-col">
          <RequestBuilder
            request={activeRequest}
            setRequest={setActiveRequest}
            setResponse={setResponse}
            loading={loading}
            setLoading={setLoading}
            onSaveRequest={handleSaveRequest}
          />
          
          <ResponseViewer
            response={response}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
