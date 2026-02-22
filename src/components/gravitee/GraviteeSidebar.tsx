import { useState } from 'react';
import { Search, Plus, ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import type { Collection, ApiRequest } from '@/types/api';
import { METHOD_BG_COLORS } from '@/types/api';

interface SidebarProps {
  collections: Collection[];
  setCollections: (collections: Collection[]) => void;
  activeRequest: ApiRequest;
  setActiveRequest: (request: ApiRequest) => void;
}

export function GraviteeSidebar({ collections, setCollections, activeRequest, setActiveRequest }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
    new Set(collections.map(c => c.id))
  );

  const toggleCollection = (id: string) => {
    const next = new Set(expandedCollections);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedCollections(next);
  };

  const addNewRequest = (collectionId: string) => {
    const newReq: ApiRequest = {
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
        ? { ...col, requests: [...col.requests, newReq] }
        : col
    ));
    setActiveRequest(newReq);
  };

  const addNewCollection = () => {
    const col: Collection = {
      id: `col-${Date.now()}`,
      name: 'New Collection',
      folders: [],
      requests: []
    };
    setCollections([...collections, col]);
    setExpandedCollections(prev => new Set([...prev, col.id]));
  };

  const filteredCollections = collections.map(col => ({
    ...col,
    requests: col.requests.filter(r =>
      !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.url.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(col => !searchQuery || col.requests.length > 0);

  return (
    <div className="w-64 bg-sidebar border-r border-border flex flex-col h-full shrink-0">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 h-8 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
          <Search className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 h-auto min-h-0 border-0 px-0 py-0 shadow-none focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground text-xs"
          />
        </div>
      </div>

      {/* Collections */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredCollections.map((collection) => (
          <div key={collection.id} className="mb-1">
            <div className="flex items-center justify-between group">
              <button
                onClick={() => toggleCollection(collection.id)}
                className="flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded-md hover:bg-secondary/50 transition-colors text-left"
              >
                {expandedCollections.has(collection.id)
                  ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                }
                <Folder className="w-3.5 h-3.5 text-primary/70" />
                <span className="text-xs text-sidebar-foreground font-medium truncate">{collection.name}</span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                onClick={() => addNewRequest(collection.id)}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            <AnimatePresence>
              {expandedCollections.has(collection.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden ml-5 mt-0.5 space-y-0.5"
                >
                  {collection.requests.map((request) => (
                    <button
                      key={request.id}
                      onClick={() => setActiveRequest(request)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all text-xs ${
                        activeRequest.id === request.id
                          ? 'bg-primary/10 border-l-2 border-primary'
                          : 'hover:bg-secondary/50 border-l-2 border-transparent'
                      }`}
                    >
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${METHOD_BG_COLORS[request.method] || ''}`}>
                        {request.method}
                      </span>
                      <span className="text-sidebar-foreground truncate flex-1">{request.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* New Collection */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={addNewCollection}
          className="w-full justify-start text-muted-foreground hover:text-foreground h-8 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Collection
        </Button>
      </div>
    </div>
  );
}
