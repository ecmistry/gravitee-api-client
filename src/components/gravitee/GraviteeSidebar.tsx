import { useState, useEffect, useRef } from 'react';
import { Search, Plus, ChevronDown, ChevronRight, Folder, FolderOpen, Pencil, Trash2, History, X, Copy, GripVertical, Shield, FileText, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { getHistory, clearHistory } from '@/lib/history';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Collection, ApiRequest, Folder } from '@/types/api';
import type { AuthConfig } from '@/types/auth';
import { METHOD_BG_COLORS } from '@/types/api';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { logCollectionActivity } from '@/lib/workspaceStorage';
import { AuthTab } from './AuthTab';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  collections: Collection[];
  setCollections: (collections: Collection[]) => void;
  activeRequest: ApiRequest;
  setActiveRequest: (request: ApiRequest) => void;
}

function SortableCollectionItem({
  id,
  onContextMenu,
  children,
}: {
  id: string;
  onContextMenu: (e: React.MouseEvent) => void;
  children: (props: { dragHandleProps: Record<string, unknown> }) => React.ReactNode;
}) {
  const { setNodeRef, transform, transition, listeners, attributes } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} className="mb-1" onContextMenu={onContextMenu}>
      {children({ dragHandleProps: { ...listeners, ...attributes } })}
    </div>
  );
}

export function GraviteeSidebar({ collections, setCollections, activeRequest, setActiveRequest }: SidebarProps) {
  const { activeWorkspaceId, workspaces, activeWorkspace, setActiveWorkspaceId } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
    new Set(collections.map(c => c.id))
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [historyKey, setHistoryKey] = useState(0);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const history = getHistory();
  const [authSheetTarget, setAuthSheetTarget] = useState<{ type: 'collection'; collection: Collection } | { type: 'folder'; folder: Folder; collectionId: string } | null>(null);
  const [descSheetTarget, setDescSheetTarget] = useState<{ type: 'collection'; collection: Collection } | { type: 'folder'; folder: Folder; collectionId: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    type: 'request';
    request: ApiRequest;
    collectionId: string;
    folderId?: string;
    x: number;
    y: number;
  } | { type: 'collection'; collection: Collection; x: number; y: number } | { type: 'folder'; folder: Folder; collectionId: string; x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

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

  const toggleFolder = (id: string) => {
    const next = new Set(expandedFolders);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedFolders(next);
  };

  const newRequest = (): ApiRequest => ({
    id: `temp-${Date.now()}`,
    name: 'New Request',
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    body: '',
    bodyType: 'none',
    formData: []
  });

  const addNewRequest = (collectionId: string, folderId?: string) => {
    const newReq = newRequest();
    logCollectionActivity(activeWorkspaceId, 'create', 'request', newReq.id, newReq.name);
    setCollections(collections.map(col => {
      if (col.id !== collectionId) return col;
      if (folderId) {
        return {
          ...col,
          folders: col.folders.map(f =>
            f.id === folderId ? { ...f, requests: [...f.requests, newReq] } : f
          )
        };
      }
      return { ...col, requests: [...col.requests, newReq] };
    }));
    setActiveRequest(newReq);
  };

  const addNewFolder = (collectionId: string) => {
    const folder: Folder = {
      id: `folder-${Date.now()}`,
      name: 'New Folder',
      requests: []
    };
    const col = collections.find(c => c.id === collectionId);
    setCollections(collections.map(c =>
      c.id === collectionId ? { ...c, folders: [...c.folders, folder] } : c
    ));
    setExpandedCollections(prev => new Set([...prev, folder.id]));
    if (col) logCollectionActivity(activeWorkspaceId, 'create', 'folder', folder.id, folder.name);
  };

  const deleteCollection = (collectionId: string) => {
    const col = collections.find(c => c.id === collectionId);
    if (!col) return;
    logCollectionActivity(activeWorkspaceId, 'delete', 'collection', col.id, col.name);
    const hasActive = col.requests.some(r => r.id === activeRequest.id) ||
      col.folders.some(f => f.requests.some(r => r.id === activeRequest.id));
    if (hasActive) {
      const remaining = collections.flatMap(c => c.id === collectionId ? [] : [...c.requests, ...c.folders.flatMap(f => f.requests)]);
      setActiveRequest(remaining[0] ?? newRequest());
    }
    setCollections(collections.filter(c => c.id !== collectionId));
  };

  const duplicateRequest = (request: ApiRequest, collectionId: string, folderId?: string) => {
    const dup: ApiRequest = { ...request, id: `temp-${Date.now()}`, name: `${request.name} (copy)` };
    logCollectionActivity(activeWorkspaceId, 'create', 'request', dup.id, dup.name);
    setCollections(collections.map(col => {
      if (col.id !== collectionId) return col;
      if (folderId) {
        return {
          ...col,
          folders: col.folders.map(f =>
            f.id === folderId ? { ...f, requests: [...f.requests, dup] } : f
          )
        };
      }
      return { ...col, requests: [...col.requests, dup] };
    }));
    setActiveRequest(dup);
  };

  const duplicateFolder = (folder: Folder, collectionId: string) => {
    const dup: Folder = {
      id: `folder-${Date.now()}`,
      name: `${folder.name} (copy)`,
      requests: folder.requests.map(r => ({ ...r, id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`, name: `${r.name} (copy)` }))
    };
    setCollections(collections.map(col =>
      col.id === collectionId ? { ...col, folders: [...col.folders, dup] } : col
    ));
    setExpandedCollections(prev => new Set([...prev, dup.id]));
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
    logCollectionActivity(activeWorkspaceId, 'create', 'collection', col.id, col.name);
  };

  const startRenameCollection = (collection: Collection) => {
    setEditingFolderId(null);
    setEditingRequestId(null);
    setEditingCollectionId(collection.id);
    setEditingName(collection.name);
  };

  const saveRenameCollection = () => {
    if (!editingCollectionId || !editingName.trim()) {
      setEditingCollectionId(null);
      return;
    }
    const newName = editingName.trim();
    setCollections(collections.map(col =>
      col.id === editingCollectionId ? { ...col, name: newName } : col
    ));
    logCollectionActivity(activeWorkspaceId, 'update', 'collection', editingCollectionId, newName);
    setEditingCollectionId(null);
    setEditingName('');
  };

  const cancelRenameCollection = () => {
    setEditingCollectionId(null);
    setEditingName('');
  };

  const startRenameFolder = (folder: Folder) => {
    setEditingCollectionId(null);
    setEditingRequestId(null);
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
  };

  const saveRenameFolder = () => {
    if (!editingFolderId || !editingName.trim()) {
      setEditingFolderId(null);
      return;
    }
    const newName = editingName.trim();
    setCollections(collections.map(col => ({
      ...col,
      folders: col.folders.map(f => f.id === editingFolderId ? { ...f, name: newName } : f)
    })));
    logCollectionActivity(activeWorkspaceId, 'update', 'folder', editingFolderId, newName);
    setEditingFolderId(null);
    setEditingName('');
  };

  const deleteFolder = (folderId: string, collectionId: string) => {
    const folder = collections.find(c => c.id === collectionId)?.folders.find(f => f.id === folderId);
    setCollections(collections.map(col =>
      col.id === collectionId ? { ...col, folders: col.folders.filter(f => f.id !== folderId) } : col
    ));
    if (folder) logCollectionActivity(activeWorkspaceId, 'delete', 'folder', folder.id, folder.name);
  };

  const setCollectionAuth = (collectionId: string, auth: AuthConfig | undefined) => {
    setCollections(collections.map(col =>
      col.id === collectionId ? { ...col, auth } : col
    ));
  };

  const setFolderAuth = (collectionId: string, folderId: string, auth: AuthConfig | undefined) => {
    setCollections(collections.map(col =>
      col.id === collectionId
        ? { ...col, folders: col.folders.map(f => f.id === folderId ? { ...f, auth } : f) }
        : col
    ));
  };

  const startRenameRequest = (request: ApiRequest) => {
    setEditingCollectionId(null);
    setEditingFolderId(null);
    setEditingRequestId(request.id);
    setEditingName(request.name);
  };

  const saveRenameRequest = () => {
    if (!editingRequestId || !editingName.trim()) {
      setEditingRequestId(null);
      return;
    }
    const newName = editingName.trim();
    setCollections(collections.map(col => ({
      ...col,
      requests: col.requests.map(req =>
        req.id === editingRequestId ? { ...req, name: newName } : req
      ),
      folders: col.folders.map(f => ({
        ...f,
        requests: f.requests.map(req =>
          req.id === editingRequestId ? { ...req, name: newName } : req
        )
      }))
    })));
    setActiveRequest(prev =>
      prev.id === editingRequestId ? { ...prev, name: newName } : prev
    );
    logCollectionActivity(activeWorkspaceId, 'update', 'request', editingRequestId, newName);
    setEditingRequestId(null);
    setEditingName('');
  };

  const cancelRenameRequest = () => {
    setEditingRequestId(null);
    setEditingName('');
  };

  const deleteRequest = (request: ApiRequest, collectionId: string, folderId?: string) => {
    logCollectionActivity(activeWorkspaceId, 'delete', 'request', request.id, request.name);
    const updatedCollections = collections.map(col => {
      if (col.id !== collectionId) return col;
      if (folderId) {
        return {
          ...col,
          folders: col.folders.map(f =>
            f.id === folderId ? { ...f, requests: f.requests.filter(r => r.id !== request.id) } : f
          )
        };
      }
      return { ...col, requests: col.requests.filter(r => r.id !== request.id) };
    });
    setCollections(updatedCollections);
    if (activeRequest.id === request.id) {
      const remaining = updatedCollections.flatMap(c => [...c.requests, ...c.folders.flatMap(f => f.requests)]);
      setActiveRequest(remaining[0] ?? {
        id: 'temp',
        name: 'Untitled Request',
        method: 'GET' as const,
        url: '',
        params: [],
        headers: [],
        body: '',
        bodyType: 'none' as const,
        formData: [],
      });
    }
  };

  const matchRequest = (r: ApiRequest) =>
    !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.url && r.url.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredCollections = collections.map(col => {
    const filteredRoot = col.requests.filter(matchRequest);
    const filteredFolders = col.folders.map(f => ({
      ...f,
      requests: f.requests.filter(matchRequest)
    })).filter(f => !searchQuery || f.requests.length > 0);
    const hasMatches = !searchQuery || filteredRoot.length > 0 || filteredFolders.length > 0;
    return { ...col, requests: filteredRoot, folders: searchQuery ? filteredFolders : col.folders, hasMatches };
  }).filter(col => col.hasMatches);

  return (
    <div className="w-64 bg-sidebar border-r border-border flex flex-col h-full shrink-0">
      {/* Workspace switcher */}
      <div className="p-2 border-b border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-8 px-2 text-xs font-medium text-sidebar-foreground hover:text-foreground"
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate flex-1 text-left">{activeWorkspace?.name ?? 'Workspace'}</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom" className="w-56">
            {workspaces.map((ws) => (
              <DropdownMenuCheckboxItem
                key={ws.id}
                checked={activeWorkspaceId === ws.id}
                onSelect={() => setActiveWorkspaceId(ws.id)}
              >
                {ws.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            if (e.over && e.active.id !== e.over.id) {
              const oldIdx = collections.findIndex(c => c.id === e.active.id);
              const newIdx = collections.findIndex(c => c.id === e.over!.id);
              if (oldIdx >= 0 && newIdx >= 0) setCollections(arrayMove(collections, oldIdx, newIdx));
            }
          }}
        >
          <SortableContext items={filteredCollections.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {filteredCollections.map((collection) => (
              <SortableCollectionItem
                key={collection.id}
                id={collection.id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ type: 'collection', collection, x: e.clientX, y: e.clientY });
                }}
              >
                {({ dragHandleProps }) => (
                  <>
                <div className="flex items-center justify-between group">
                  <div
                    className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-secondary/50 touch-none shrink-0"
                    title="Drag to reorder"
                    {...dragHandleProps}
                  >
                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                  </div>
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
                  {collection.folders.map((folder) => (
                    <div key={folder.id} className="mb-0.5" onContextMenu={(e) => { e.preventDefault(); setContextMenu({ type: 'folder', folder, collectionId: collection.id, x: e.clientX, y: e.clientY }); }}>
                      <div className="flex items-center justify-between group/folder">
                        <button
                          onClick={() => toggleFolder(folder.id)}
                          className="flex items-center gap-1.5 flex-1 px-2 py-1 rounded-md hover:bg-secondary/50 transition-colors text-left min-w-0"
                        >
                          {expandedFolders.has(folder.id) ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                          <FolderOpen className="w-3 h-3 shrink-0 text-primary/60" />
                          {editingFolderId === folder.id ? (
                            <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} onBlur={saveRenameFolder} onKeyDown={(e) => { if (e.key === 'Enter') saveRenameFolder(); if (e.key === 'Escape') setEditingFolderId(null); }} onClick={(e) => e.stopPropagation()} className="h-5 text-xs px-1 flex-1 min-w-0" autoFocus />
                          ) : (
                            <span className="text-[11px] text-sidebar-foreground truncate flex-1" onDoubleClick={(e) => { e.stopPropagation(); startRenameFolder(folder); }}>{folder.name}</span>
                          )}
                        </button>
                        {editingFolderId !== folder.id && (
                          <>
                            <Button variant="ghost" size="icon" className="w-5 h-5 opacity-0 group-hover/folder:opacity-100" onClick={(e) => { e.stopPropagation(); addNewRequest(collection.id, folder.id); }}>
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-5 h-5 opacity-0 group-hover/folder:opacity-100" onClick={(e) => { e.stopPropagation(); duplicateFolder(folder, collection.id); }}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                      <AnimatePresence>
                        {expandedFolders.has(folder.id) && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden ml-4 mt-0.5 space-y-0.5">
                            {folder.requests.map((request) => (
                              <div key={request.id} className={`flex items-center gap-2 group/req ${activeRequest.id === request.id ? 'bg-primary/10 border-l-2 border-primary' : 'border-l-2 border-transparent'}`} onContextMenu={(e) => { e.preventDefault(); setContextMenu({ type: 'request', request, collectionId: collection.id, folderId: folder.id, x: e.clientX, y: e.clientY }); }}>
                                <button onClick={() => setActiveRequest(request)} className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-xs min-w-0 ${activeRequest.id === request.id ? '' : 'hover:bg-secondary/50'}`}>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${METHOD_BG_COLORS[request.method] || ''}`}>{request.method}</span>
                                  {editingRequestId === request.id ? <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} onBlur={saveRenameRequest} onKeyDown={(e) => { if (e.key === 'Enter') saveRenameRequest(); if (e.key === 'Escape') cancelRenameRequest(); }} onClick={(e) => e.stopPropagation()} className="h-6 text-xs px-1.5 py-0 flex-1 min-w-0" autoFocus /> : <span className="text-sidebar-foreground truncate flex-1 block" onDoubleClick={(e) => { e.stopPropagation(); startRenameRequest(request); }}>{request.name}</span>}
                                </button>
                                {editingRequestId !== request.id && <Button variant="ghost" size="icon" className="w-6 h-6 shrink-0 opacity-0 group-hover/req:opacity-100" onClick={(e) => { e.stopPropagation(); startRenameRequest(request); }}><Pencil className="w-3.5 h-3.5" /></Button>}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
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
                          type: 'request',
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
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => addNewFolder(collection.id)} className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5">+ Add folder</button>
                    <span className="text-muted-foreground">·</span>
                    <button onClick={() => addNewRequest(collection.id)} className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5">+ Add request</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
                  </>
                )}
              </SortableCollectionItem>
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* History */}
      <div className="border-t border-border">
        <button
          onClick={() => setHistoryExpanded(!historyExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-secondary/50 transition-colors"
        >
          <span className="text-xs font-medium text-sidebar-foreground flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-muted-foreground" />
            History ({history.length})
          </span>
          {historyExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {historyExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="max-h-40 overflow-y-auto px-2 pb-2 space-y-0.5" key={historyKey}>
                {history.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No requests yet</p>
                ) : (
                  <>
                    {history.map((entry, i) => (
                      <button
                        key={`${entry.timestamp}-${i}`}
                        onClick={() => setActiveRequest(entry.request)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-secondary/50 transition-colors group"
                      >
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${METHOD_BG_COLORS[entry.request.method] || ''}`}>
                          {entry.request.method}
                        </span>
                        <span className="text-xs text-sidebar-foreground truncate flex-1">{entry.request.url}</span>
                      </button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { clearHistory(); setHistoryKey(k => k + 1); }}
                      className="w-full justify-start text-muted-foreground hover:text-destructive h-7 text-xs mt-1"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Clear history
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* Context menus */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[160px] rounded-md border border-border bg-popover p-1 shadow-md"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.type === 'request' && (
            <>
              <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground" onClick={() => { startRenameRequest(contextMenu.request); setContextMenu(null); }}>
                <Pencil className="w-3.5 h-3.5" /> Rename
              </button>
              <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground" onClick={() => { duplicateRequest(contextMenu.request, contextMenu.collectionId, contextMenu.folderId); setContextMenu(null); }}>
                <Copy className="w-3.5 h-3.5" /> Duplicate
              </button>
              <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-destructive outline-none hover:bg-destructive/10" onClick={() => { deleteRequest(contextMenu.request, contextMenu.collectionId, contextMenu.folderId); setContextMenu(null); }}>
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </>
          )}
          {contextMenu.type === 'collection' && (
            <>
              <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground" onClick={() => { setDescSheetTarget({ type: 'collection', collection: contextMenu.collection }); setContextMenu(null); }}>
                <FileText className="w-3.5 h-3.5" /> Edit description
              </button>
              <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground" onClick={() => { setAuthSheetTarget({ type: 'collection', collection: contextMenu.collection }); setContextMenu(null); }}>
                <Shield className="w-3.5 h-3.5" /> Set auth
              </button>
              <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-destructive outline-none hover:bg-destructive/10" onClick={() => { deleteCollection(contextMenu.collection.id); setContextMenu(null); }}>
                <Trash2 className="w-3.5 h-3.5" /> Delete collection
              </button>
            </>
          )}
          {contextMenu.type === 'folder' && (
            <>
              <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground" onClick={() => { setAuthSheetTarget({ type: 'folder', folder: contextMenu.folder, collectionId: contextMenu.collectionId }); setContextMenu(null); }}>
                <Shield className="w-3.5 h-3.5" /> Set auth
              </button>
              <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground" onClick={() => { startRenameFolder(contextMenu.folder); setContextMenu(null); }}>
                <Pencil className="w-3.5 h-3.5" /> Rename
              </button>
              <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground" onClick={() => { duplicateFolder(contextMenu.folder, contextMenu.collectionId); setContextMenu(null); }}>
                <Copy className="w-3.5 h-3.5" /> Duplicate
              </button>
              <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-destructive outline-none hover:bg-destructive/10" onClick={() => { deleteFolder(contextMenu.folder.id, contextMenu.collectionId); setContextMenu(null); }}>
                <Trash2 className="w-3.5 h-3.5" /> Delete folder
              </button>
            </>
          )}
        </div>
      )}

      {/* Description sheet for collection/folder */}
      <Sheet open={!!descSheetTarget} onOpenChange={(open) => !open && setDescSheetTarget(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{descSheetTarget?.type === 'collection' ? `Description: ${descSheetTarget.collection.name}` : descSheetTarget ? `Description: ${descSheetTarget.folder.name}` : 'Description'}</SheetTitle>
          </SheetHeader>
          {descSheetTarget && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Markdown supported</p>
              <Textarea
                className="min-h-[200px] font-mono text-sm"
                placeholder="Describe this collection/folder..."
                value={
                  descSheetTarget.type === 'collection'
                    ? (collections.find(c => c.id === descSheetTarget.collection.id)?.description ?? '')
                    : (collections.find(c => c.id === descSheetTarget.collectionId)?.folders.find(f => f.id === descSheetTarget.folder.id)?.description ?? '')
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (descSheetTarget.type === 'collection') {
                    setCollections(collections.map(c => c.id === descSheetTarget.collection.id ? { ...c, description: val } : c));
                  } else {
                    setCollections(collections.map(c => c.id === descSheetTarget.collectionId ? { ...c, folders: c.folders.map(f => f.id === descSheetTarget.folder.id ? { ...f, description: val } : f) } : c));
                  }
                }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Auth config sheet for collection/folder */}
      <Sheet open={!!authSheetTarget} onOpenChange={(open) => !open && setAuthSheetTarget(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{authSheetTarget?.type === 'collection' ? `Auth: ${authSheetTarget.collection.name}` : authSheetTarget ? `Auth: ${authSheetTarget.folder.name}` : 'Auth'}</SheetTitle>
          </SheetHeader>
          {authSheetTarget && (
            <div className="mt-4">
              <AuthTab
                auth={authSheetTarget.type === 'collection' ? authSheetTarget.collection.auth : authSheetTarget.folder.auth}
                authInherit="none"
                canInherit={false}
                onChangeAuth={(auth) => {
                  if (authSheetTarget.type === 'collection') {
                    setCollectionAuth(authSheetTarget.collection.id, auth.type === 'no-auth' ? undefined : auth);
                  } else {
                    setFolderAuth(authSheetTarget.collectionId, authSheetTarget.folder.id, auth.type === 'no-auth' ? undefined : auth);
                  }
                }}
                onChangeAuthInherit={() => {}}
              />
              <p className="text-[10px] text-muted-foreground mt-4">Requests in this {authSheetTarget.type} can inherit this auth via Auth tab → Inherit from Parent</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
