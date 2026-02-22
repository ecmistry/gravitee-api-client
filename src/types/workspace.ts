/**
 * Workspace & collaboration types (Phase 10)
 * Backend required for full multi-user: auth, cloud sync, real-time
 */

export type WorkspaceType = 'personal' | 'team';

export type WorkspaceRole = 'viewer' | 'editor' | 'admin';

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  /** Team workspaces: members with roles. Requires backend. */
  members?: WorkspaceMember[];
  createdAt: number;
}

export interface WorkspaceMember {
  userId: string;
  email?: string;
  role: WorkspaceRole;
  addedAt: number;
}

export interface ActivityEntry {
  id: string;
  workspaceId: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'collection' | 'folder' | 'request' | 'environment';
  entityId: string;
  entityName: string;
  /** User ID when backend connected; 'local' for local-only */
  actorId: string;
  actorName?: string;
  timestamp: number;
  /** Brief change description */
  details?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  /** Set when backend provides avatar */
  avatarUrl?: string;
}
