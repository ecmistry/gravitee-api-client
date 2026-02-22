import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Tab {
  id: string;
  request: { id: string; name: string };
}

interface RequestTabsProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onRenameTab: (id: string, name: string) => void;
  isDirty: (tab: Tab) => boolean;
}

export function RequestTabs({ tabs, activeTabId, onSelectTab, onCloseTab, onRenameTab, isDirty }: RequestTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const startRename = (tab: Tab) => {
    setEditingId(tab.id);
    setEditingName(tab.request.name);
  };

  const saveRename = () => {
    if (editingId && editingName.trim()) {
      onRenameTab(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="flex items-center gap-0 border-b border-border bg-card shrink-0 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center gap-1 px-3 py-2 border-r border-border group shrink-0 cursor-pointer transition-colors ${
            activeTabId === tab.id ? 'bg-background border-b-2 border-b-transparent -mb-px' : 'hover:bg-secondary/50'
          }`}
          onClick={() => onSelectTab(tab.id)}
        >
          {isDirty(tab) && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" title="Unsaved changes" />
          )}
          {editingId === tab.id ? (
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={saveRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRename();
                if (e.key === 'Escape') { setEditingId(null); setEditingName(''); }
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-6 w-24 text-xs"
              autoFocus
            />
          ) : (
            <span
              className="text-xs text-foreground truncate max-w-[120px]"
              onDoubleClick={(e) => { e.stopPropagation(); startRename(tab); }}
              title="Double-click to rename"
            >
              {tab.request.name || 'Untitled'}
            </span>
          )}
          {tabs.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
