import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { getActivity } from '@/lib/workspaces';
import { User, Layers, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const {
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    setActiveWorkspaceId,
    addWorkspace,
    renameWorkspace,
    removeWorkspace,
  } = useWorkspace();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const activity = getActivity(activeWorkspaceId);

  const handleAddWorkspace = () => {
    const name = newWorkspaceName.trim() || 'New Workspace';
    const ws = addWorkspace(name, 'personal');
    setActiveWorkspaceId(ws.id);
    setNewWorkspaceName('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="workspaces" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workspaces" className="text-xs">
              <Layers className="w-3.5 h-3.5 mr-1" />
              Workspaces
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs">
              <User className="w-3.5 h-3.5 mr-1" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">
              <Activity className="w-3.5 h-3.5 mr-1" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workspaces" className="mt-4 space-y-4">
            <div>
              <Label className="text-xs">Current workspace</Label>
              <p className="text-sm font-medium mt-1">{activeWorkspace?.name ?? 'Personal'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Switch workspace</Label>
              <div className="space-y-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => setActiveWorkspaceId(ws.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm border transition-colors ${
                      ws.id === activeWorkspaceId
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    {ws.name}
                    <span className="text-muted-foreground text-xs ml-1">({ws.type})</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Add workspace</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Workspace name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWorkspace()}
                />
                <Button size="sm" onClick={handleAddWorkspace}>
                  Add
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Team workspaces and sharing require a backend.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-4 space-y-4">
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Sign in to sync across devices and collaborate.</p>
              <p className="text-xs mt-1">Email + password and OAuth (GitHub/Google) require a backend.</p>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Label className="text-xs">Recent activity in {activeWorkspace?.name ?? 'Personal'}</Label>
            <ScrollArea className="h-[300px] mt-2 border rounded-md">
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">No activity yet.</p>
              ) : (
                <div className="p-2 space-y-1">
                  {activity.map((entry) => (
                    <div
                      key={entry.id}
                      className="text-xs p-2 rounded bg-muted/50"
                    >
                      <span className="font-medium">{entry.actorName ?? 'You'}</span>
                      {' '}{entry.action}{' '}
                      <span className="font-mono">{entry.entityName}</span>
                      {entry.details && <span className="text-muted-foreground"> — {entry.details}</span>}
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
