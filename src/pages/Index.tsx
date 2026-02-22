import { useState, useEffect } from 'react';
import { GraviteeTopBar } from '@/components/gravitee/GraviteeTopBar';
import { GraviteeSidebar } from '@/components/gravitee/GraviteeSidebar';
import { RequestBuilder } from '@/components/gravitee/RequestBuilder';
import { RequestTabs } from '@/components/gravitee/RequestTabs';
import { ResponseViewer } from '@/components/gravitee/ResponseViewer';
import { WebSocketClient } from '@/components/gravitee/WebSocketClient';
import { SSEClient } from '@/components/gravitee/SSEClient';
import { SocketIOClient } from '@/components/gravitee/SocketIOClient';
import { GraphQLClient } from '@/components/gravitee/GraphQLClient';
import { EnvironmentSelector } from '@/components/gravitee/EnvironmentSelector';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { getCollections, setCollections as saveCollections } from '@/lib/workspaceStorage';
import { getEnvironments, setEnvironments, getActiveEnvironmentId, setActiveEnvironmentId, getGlobalVariables, setGlobalVariables } from '@/lib/variables';
import { getAllRequestsFromCollections, findRequestLocation } from '@/lib/collections';
import type { Collection, ApiRequest, ApiResponse, RequestType } from '@/types/api';

const Index = () => {
  const { activeWorkspaceId } = useWorkspace();
  const [collections, setCollectionsState] = useState<Collection[]>(
    () => getCollections(activeWorkspaceId)
  );

  useEffect(() => {
    setCollectionsState(getCollections(activeWorkspaceId));
  }, [activeWorkspaceId]);

  const setCollections = (next: Collection[] | ((prev: Collection[]) => Collection[])) => {
    setCollectionsState((prev) => {
      const nextVal = typeof next === 'function' ? next(prev) : next;
      saveCollections(activeWorkspaceId, nextVal);
      return nextVal;
    });
  };

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
  const [environments, setEnvsState] = useState(getEnvironments);
  const [activeEnvId, setActiveEnvId] = useState<string | null>(getActiveEnvironmentId);
  const [globalVars, setGlobalVarsState] = useState(getGlobalVariables);

  useEffect(() => {
    setEnvironments(environments);
  }, [environments]);
  useEffect(() => {
    setActiveEnvironmentId(activeEnvId);
  }, [activeEnvId]);
  useEffect(() => {
    setGlobalVariables(globalVars);
  }, [globalVars]);
  const [responses, setResponses] = useState<Record<string, ApiResponse | null>>({});
  const [testResults, setTestResults] = useState<Record<string, Array<{ name: string; passed: boolean; error?: string }>>>({});
  const [loading, setLoading] = useState(false);

  const activeRequest = tabs.find(t => t.id === activeTabId)?.request ?? defaultRequest;
  const response = responses[activeTabId] ?? null;

  const reqLocation = findRequestLocation(collections, activeRequest.id);
  const collection = reqLocation ? collections.find(c => c.id === reqLocation.collectionId) : undefined;
  const folder = reqLocation?.folderId && collection
    ? collection.folders.find(f => f.id === reqLocation.folderId)
    : undefined;
  const inheritedAuth = folder?.auth ?? collection?.auth;
  const canInherit = !!(folder?.auth || collection?.auth);
  const inheritedAuthLabel = folder?.auth ? 'Folder' : collection?.auth ? 'Collection' : undefined;

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

  const setTestResultsForTab = (results: Array<{ name: string; passed: boolean; error?: string }>) => {
    setTestResults(prev => ({ ...prev, [activeTabId]: results }));
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
    const saved = getAllRequestsFromCollections(collections).find(r => r.id === req.id);
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
      const loc = findRequestLocation(collections, activeRequest.id);
      setCollections(collections.map(col => {
        if (loc?.collectionId !== col.id) return col;
        const hasTempInRoot = col.requests.some(r => r.id === activeRequest.id);
        if (hasTempInRoot) {
          return { ...col, requests: col.requests.map(r => r.id === activeRequest.id ? newReq : r) };
        }
        if (loc.folderId) {
          return {
            ...col,
            folders: col.folders.map(f =>
              f.id === loc.folderId
                ? { ...f, requests: f.requests.map(r => r.id === activeRequest.id ? newReq : r) }
                : f
            )
          };
        }
        if (!loc && col === collections[0]) {
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
      const loc = findRequestLocation(collections, activeRequest.id);
      setCollections(collections.map(col => {
        if (loc?.collectionId !== col.id) return col;
        const inRoot = col.requests.some(r => r.id === activeRequest.id);
        if (inRoot) {
          return { ...col, requests: col.requests.map(r => r.id === activeRequest.id ? activeRequest : r) };
        }
        if (loc?.folderId) {
          return {
            ...col,
            folders: col.folders.map(f =>
              f.id === loc.folderId
                ? { ...f, requests: f.requests.map(r => r.id === activeRequest.id ? activeRequest : r) }
                : f
            )
          };
        }
        return col;
      }));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <GraviteeTopBar
        collections={collections}
        setCollections={setCollections}
        environments={environments}
        activeEnvId={activeEnvId}
        globalVars={globalVars}
        onEnvironmentsChange={setEnvsState}
        onActiveEnvChange={setActiveEnvId}
        onGlobalVarsChange={setGlobalVarsState}
      />
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
          <div className="flex items-center gap-1 px-5 py-1.5 border-b border-border bg-card shrink-0">
            {(['http', 'websocket', 'sse', 'socketio', 'graphql'] as const).map((t) => {
              const current = (activeRequest.requestType ?? 'http') === t;
              const label = t === 'http' ? 'HTTP' : t === 'websocket' ? 'WebSocket' : t === 'sse' ? 'SSE' : t === 'socketio' ? 'Socket.IO' : 'GraphQL';
              return (
                <button
                  key={t}
                  onClick={() => setRequest({ ...activeRequest, requestType: t })}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${current ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {(() => {
            const reqType: RequestType = activeRequest.requestType ?? 'http';
            if (reqType === 'websocket') {
              return (
                <WebSocketClient
                  request={activeRequest}
                  setRequest={setRequest}
                  activeEnvId={activeEnvId}
                  environments={environments}
                  globalVars={globalVars}
                />
              );
            }
            if (reqType === 'sse') {
              return (
                <SSEClient
                  request={activeRequest}
                  setRequest={setRequest}
                  activeEnvId={activeEnvId}
                  environments={environments}
                  globalVars={globalVars}
                />
              );
            }
            if (reqType === 'socketio') {
              return (
                <SocketIOClient
                  request={activeRequest}
                  setRequest={setRequest}
                  activeEnvId={activeEnvId}
                  environments={environments}
                  globalVars={globalVars}
                />
              );
            }
            if (reqType === 'graphql') {
              return (
                <GraphQLClient
                  request={activeRequest}
                  setRequest={setRequest}
                  activeEnvId={activeEnvId}
                  environments={environments}
                  globalVars={globalVars}
                />
              );
            }
            return (
              <>
                <RequestBuilder
                  request={activeRequest}
                  setRequest={setRequest}
                  setResponse={setResponse}
                  setTestResults={setTestResultsForTab}
                  loading={loading}
                  setLoading={setLoading}
                  onSaveRequest={handleSaveRequest}
                  activeEnvId={activeEnvId}
                  environments={environments}
                  globalVars={globalVars}
                  inheritedAuth={inheritedAuth}
                  canInherit={canInherit}
                  inheritedAuthLabel={inheritedAuthLabel}
                />
                <ResponseViewer response={response} loading={loading} testResults={testResults[activeTabId] ?? []} />
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default Index;
