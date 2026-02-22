import { useState, useEffect, useRef } from 'react';
import { Search, Plus, ChevronDown, ChevronRight, Folder, Pencil, Trash2 } from 'lucide-react';
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
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
    new Set(collections.map(c => c.id))
  );
  const [contextMenu, setContextMenu] = useState<{
    request: ApiRequest;
    collectionId: string;
    x: number;
    y: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contextMenu) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    document.addEventListener('click', close, true);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('click', close, true);
      document.removeEventListener('keydown', onEscape);
    };
  }, [contextMenu]);

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

  const startRenameCollection = (collection: Collection) => {
    setEditingRequestId(null);
    setEditingCollectionId(collection.id);
    setEditingName(collection.name);
  };

  const saveRenameCollection = () => {
    if (!editingCollectionId || !editingName.trim()) {
      setEditingCollectionId(null);
      return;
    }
    setCollections(collections.map(col =>
      col.id === editingCollectionId ? { ...col, name: editingName.trim() } : col
    ));
    setEditingCollectionId(null);
    setEditingName('');
  };

  const cancelRenameCollection = () => {
    setEditingCollectionId(null);
    setEditingName('');
  };

  const startRenameRequest = (request: ApiRequest) => {
    setEditingCollectionId(null);
    setEditingRequestId(request.id);
    setEditingName(request.name);
  };

  const saveRenameRequest = () => {
    if (!editingRequestId || !editingName.trim()) {
      setEditingRequestId(null);
      return;
    }
    setCollections(collections.map(col => ({
      ...col,
      requests: col.requests.map(req =>
        req.id === editingRequestId ? { ...req, name: editingName.trim() } : req
      )
    })));
    setActiveRequest(prev =>
      prev.id === editingRequestId ? { ...prev, name: editingName.trim() } : prev
    );
    setEditingRequestId(null);
    setEditingName('');
  };

  const cancelRenameRequest = () => {
    setEditingRequestId(null);
    setEditingName('');
  };

  const deleteRequest = (request: ApiRequest, collectionId: string) => {
    const updatedCollections = collections.map(col =>
      col.id === collectionId
        ? { ...col, requests: col.requests.filter(r => r.id !== request.id) }
        : col
    );
    setCollections(updatedCollections);
    if (activeRequest.id === request.id) {
      const remaining = updatedCollections.flatMap(c => c.requests);
      setActiveRequest(remaining[0] ?? {
        id: 'temp',
        name: 'Untitled Request',
        method: 'GET' as const,
        url: '',
        params: [],
        headers: [],
        body: '',
        bodyType: 'none' as const,
      });
    }
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
                className="flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded-md hover:bg-secondary/50 transition-colors text-left min-w-0"
              >
                {expandedCollections.has(collection.id)
                  ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                }
                <Folder className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                {editingCollectionId === collection.id ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={saveRenameCollection}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRenameCollection();
                      if (e.key === 'Escape') cancelRenameCollection();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 text-xs px-1.5 py-0 flex-1 min-w-0"
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-xs text-sidebar-foreground font-medium truncate flex-1 block"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startRenameCollection(collection);
                    }}
                    title="Double-click to rename"
                  >
                    {collection.name}
                  </span>
                )}
              </button>
              {editingCollectionId !== collection.id && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    onClick={(e) => { e.stopPropagation(); startRenameCollection(collection); }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    onClick={(e) => { e.stopPropagation(); addNewRequest(collection.id); }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
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
                    <div
                      key={request.id}
                      className={`flex items-center gap-2 group/req ${
                        activeRequest.id === request.id
                          ? 'bg-primary/10 border-l-2 border-primary'
                          : 'border-l-2 border-transparent'
                      }`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({
                          request,
                          collectionId: collection.id,
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }}
                    >
                      <button
                        onClick={() => setActiveRequest(request)}
                        className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all text-xs min-w-0 ${
                          activeRequest.id === request.id ? '' : 'hover:bg-secondary/50'
                        }`}
                      >
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${METHOD_BG_COLORS[request.method] || ''}`}>
                          {request.method}
                        </span>
                        {editingRequestId === request.id ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={saveRenameRequest}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveRenameRequest();
                              if (e.key === 'Escape') cancelRenameRequest();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-6 text-xs px-1.5 py-0 flex-1 min-w-0"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="text-sidebar-foreground truncate flex-1 block"
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              startRenameRequest(request);
                            }}
                            title="Double-click to rename"
                          >
                            {request.name}
                          </span>
                        )}
                      </button>
                      {editingRequestId !== request.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 shrink-0 opacity-0 group-hover/req:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            startRenameRequest(request);
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
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

      {/* Context menu for requests */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[140px] rounded-md border border-border bg-popover p-1 shadow-md"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              startRenameRequest(contextMenu.request);
              setContextMenu(null);
            }}
          >
            <Pencil className="w-3.5 h-3.5" />
            Rename
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-destructive outline-none hover:bg-destructive/10"
            onClick={() => {
              deleteRequest(contextMenu.request, contextMenu.collectionId);
              setContextMenu(null);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
