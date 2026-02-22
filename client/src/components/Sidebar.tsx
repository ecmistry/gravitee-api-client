import { useState } from 'react';
import { Search, Plus, ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { Collection, Request } from '../App';

interface SidebarProps {
  collections: Collection[];
  setCollections: (collections: Collection[]) => void;
  activeRequest: Request;
  setActiveRequest: (request: Request) => void;
}

export function Sidebar({ collections, setCollections, activeRequest, setActiveRequest }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
    new Set(collections.map(c => c.id))
  );

  const toggleCollection = (id: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCollections(newExpanded);
  };

  const addNewRequest = (collectionId: string) => {
    const newRequest: Request = {
      id: `temp-${Date.now()}`,
      name: 'New Request',
      method: 'GET',
      url: '',
      params: [],
      headers: [],
      body: '',
      bodyType: 'none'
    };
    
    setCollections(collections.map(col =>
      col.id === collectionId
        ? { ...col, requests: [...col.requests, newRequest] }
        : col
    ));
    setActiveRequest(newRequest);
  };

  const addNewCollection = () => {
    const newCollection: Collection = {
      id: `col-${Date.now()}`,
      name: 'New Collection',
      folders: [],
      requests: []
    };
    setCollections([...collections, newCollection]);
    const newExpanded = new Set(expandedCollections);
    newExpanded.add(newCollection.id);
    setExpandedCollections(newExpanded);
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-emerald-600 bg-emerald-50';
      case 'POST': return 'text-blue-600 bg-blue-50';
      case 'PUT': return 'text-amber-600 bg-amber-50';
      case 'DELETE': return 'text-red-600 bg-red-50';
      case 'PATCH': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="w-72 bg-[var(--gravitee-sidebar-bg)] border-r border-[var(--gravitee-border)] flex flex-col h-full">
      {/* Search */}
      <div className="px-3 py-3 border-b border-[var(--gravitee-border)] bg-[var(--gravitee-panel-bg)]">
        <div className="flex items-center gap-2 rounded-md border border-[var(--gravitee-border)] bg-[var(--gravitee-panel-bg)] px-3 h-10 focus-within:ring-1 focus-within:ring-[var(--gravitee-primary)] focus-within:border-[var(--gravitee-primary)]">
          <Search className="w-4 h-4 shrink-0 text-gray-400" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 h-auto min-h-0 border-0 px-0 py-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-gray-900 placeholder:text-gray-400 text-sm"
          />
        </div>
      </div>

      {/* Collections */}
      <div className="flex-1 overflow-y-auto p-3">
        {collections.map((collection) => (
          <div key={collection.id} className="mb-1">
            <div className="flex items-center justify-between group">
              <button
                onClick={() => toggleCollection(collection.id)}
                className="flex items-center gap-2 flex-1 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                {expandedCollections.has(collection.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <Folder className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">{collection.name}</span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 text-gray-600"
                onClick={() => addNewRequest(collection.id)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {expandedCollections.has(collection.id) && (
              <div className="ml-6 mt-0.5 space-y-0.5">
                {collection.requests.map((request) => (
                  <button
                    key={request.id}
                    onClick={() => setActiveRequest(request)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                      activeRequest.id === request.id
                        ? 'bg-[var(--gravitee-primary-light)] border-l-2 border-[var(--gravitee-primary)]'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${getMethodColor(request.method)}`}>
                      {request.method}
                    </span>
                    <span className="text-sm text-gray-700 truncate flex-1">{request.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Collection Button */}
      <div className="p-3 border-t border-[var(--gravitee-border)] bg-[var(--gravitee-panel-bg)]">
        <Button
          variant="ghost"
          size="sm"
          onClick={addNewCollection}
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Collection
        </Button>
      </div>
    </div>
  );
}
