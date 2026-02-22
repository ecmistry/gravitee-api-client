import { useState, useEffect } from 'react';
import { GraviteeTopBar } from '@/components/gravitee/GraviteeTopBar';
import { GraviteeSidebar } from '@/components/gravitee/GraviteeSidebar';
import { RequestBuilder } from '@/components/gravitee/RequestBuilder';
import { RequestTabs } from '@/components/gravitee/RequestTabs';
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

  const defaultRequest: ApiRequest = {
    id: 'temp',
    name: 'Untitled Request',
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    body: '',
    bodyType: 'none',
    formData: []
  };

  const [tabs, setTabs] = useState<{ id: string; request: ApiRequest }[]>(() => [{ id: 'temp', request: { ...defaultRequest } }]);
  const [activeTabId, setActiveTabId] = useState('temp');
  const [responses, setResponses] = useState<Record<string, ApiResponse | null>>({});
  const [loading, setLoading] = useState(false);

  const activeRequest = tabs.find(t => t.id === activeTabId)?.request ?? defaultRequest;
  const response = responses[activeTabId] ?? null;

  const setActiveRequest = (req: ApiRequest) => {
    const existing = tabs.find(t => t.id === req.id);
    if (existing) {
      setTabs(prev => prev.map(t => t.id === req.id ? { ...t, request: req } : t));
      setActiveTabId(req.id);
    } else {
      setTabs(prev => [...prev, { id: req.id, request: req }]);
      setActiveTabId(req.id);
    }
  };

  const setRequest = (req: ApiRequest) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, request: req } : t));
  };

  const setResponse = (resp: ApiResponse | null) => {
    setResponses(prev => ({ ...prev, [activeTabId]: resp }));
  };

  const closeTab = (id: string) => {
    const next = tabs.filter(t => t.id !== id);
    if (next.length === 0) return;
    setTabs(next);
    if (activeTabId === id) {
      const idx = tabs.findIndex(t => t.id === id);
      const newActive = next[idx] ?? next[idx - 1] ?? next[0];
      setActiveTabId(newActive.id);
    }
  };

  const isDirty = (tab: { id: string; request: ApiRequest }) => {
    const req = tab.request;
    if (req.id.startsWith('temp')) return true;
    const saved = collections.flatMap(c => c.requests).find(r => r.id === req.id);
    return !saved || JSON.stringify(req) !== JSON.stringify(saved);
  };

  const renameTab = (id: string, name: string) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, request: { ...t.request, name } } : t));
  };

  const handleSaveRequest = () => {
    if (activeRequest.id.startsWith('temp')) {
      const newReq = {
        ...activeRequest,
        id: `req-${Date.now()}`,
        name: activeRequest.name || 'New Request'
      };
      const collectionWithTemp = collections.find(col =>
        col.requests.some(r => r.id === activeRequest.id)
      );
      setCollections(collections.map(col => {
        const hasTemp = col.requests.some(r => r.id === activeRequest.id);
        if (hasTemp) {
          return {
            ...col,
            requests: col.requests.map(r =>
              r.id === activeRequest.id ? newReq : r
            )
          };
        }
        if (!collectionWithTemp && col === collections[0]) {
          return { ...col, requests: [...col.requests, newReq] };
        }
        return col;
      }));
      setTabs(prev => prev.map(t => t.id === activeRequest.id ? { id: newReq.id, request: newReq } : t));
      setActiveTabId(newReq.id);
      setResponses(prev => {
        const { [activeRequest.id]: _, ...rest } = prev;
        return { ...rest, [newReq.id]: prev[activeRequest.id] };
      });
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
          <RequestTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={closeTab}
            onRenameTab={renameTab}
            isDirty={isDirty}
          />
          <RequestBuilder
            request={activeRequest}
            setRequest={setRequest}
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
