import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getWorkspaces,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
  addWorkspace,
  renameWorkspace,
  removeWorkspace,
} from '@/lib/workspaces';
import type { Workspace } from '@/types/workspace';

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  activeWorkspace: Workspace | undefined;
  setActiveWorkspaceId: (id: string) => void;
  addWorkspace: (name: string, type?: 'personal' | 'team') => Workspace;
  renameWorkspace: (id: string, name: string) => void;
  removeWorkspace: (id: string) => void;
  refreshWorkspaces: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(getWorkspaces);
  const [activeWorkspaceId, setActiveIdState] = useState(getActiveWorkspaceId);

  const refreshWorkspaces = useCallback(() => {
    setWorkspaces(getWorkspaces());
  }, []);

  const setActiveId = useCallback((id: string) => {
    setActiveWorkspaceId(id);
    setActiveIdState(id);
  }, []);

  useEffect(() => {
    setActiveIdState(getActiveWorkspaceId());
  }, [workspaces]);

  const value: WorkspaceContextValue = {
    workspaces,
    activeWorkspaceId,
    activeWorkspace: workspaces.find((w) => w.id === activeWorkspaceId),
    setActiveWorkspaceId: setActiveId,
    addWorkspace: (name, type) => {
      const ws = addWorkspace(name, type);
      refreshWorkspaces();
      return ws;
    },
    renameWorkspace: (id, name) => {
      renameWorkspace(id, name);
      refreshWorkspaces();
    },
    removeWorkspace: (id) => {
      removeWorkspace(id);
      refreshWorkspaces();
    },
    refreshWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
