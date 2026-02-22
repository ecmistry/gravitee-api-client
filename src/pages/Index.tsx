import { useState, useEffect } from 'react';
import { GraviteeTopBar } from '@/components/gravitee/GraviteeTopBar';
import { GraviteeSidebar } from '@/components/gravitee/GraviteeSidebar';
import { RequestBuilder } from '@/components/gravitee/RequestBuilder';
import { ResponseViewer } from '@/components/gravitee/ResponseViewer';
import type { Collection, ApiRequest, ApiResponse } from '@/types/api';

const Index = () => {
  const [collections, setCollections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('api-client-collections');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [{ id: 'default', name: 'My Workspace', folders: [], requests: [] }];
  });

  useEffect(() => {
    localStorage.setItem('api-client-collections', JSON.stringify(collections));
  }, [collections]);

  const [activeRequest, setActiveRequest] = useState<ApiRequest>({
    id: 'temp',
    name: 'Untitled Request',
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    body: '',
    bodyType: 'none'
  });

  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSaveRequest = () => {
    if (activeRequest.id.startsWith('temp')) {
      const newReq = {
        ...activeRequest,
        id: `req-${Date.now()}`,
        name: activeRequest.url ? (() => { try { return new URL(activeRequest.url).pathname; } catch { return 'New Request'; } })() : 'New Request'
      };
      setCollections(collections.map(col =>
        col.id === 'default'
          ? { ...col, requests: [...col.requests, newReq] }
          : col
      ));
      setActiveRequest(newReq);
    } else {
      setCollections(collections.map(col => ({
        ...col,
        requests: col.requests.map(req =>
          req.id === activeRequest.id ? activeRequest : req
        )
      })));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <GraviteeTopBar collections={collections} setCollections={setCollections} />
      <div className="flex-1 flex overflow-hidden">
        <GraviteeSidebar
          collections={collections}
          setCollections={setCollections}
          activeRequest={activeRequest}
          setActiveRequest={setActiveRequest}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <RequestBuilder
            request={activeRequest}
            setRequest={setActiveRequest}
            setResponse={setResponse}
            loading={loading}
            setLoading={setLoading}
            onSaveRequest={handleSaveRequest}
          />
          <ResponseViewer response={response} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Index;
