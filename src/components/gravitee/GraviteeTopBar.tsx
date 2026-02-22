import { Upload, Download, Settings, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToJSON, detectFormat, importFromPostman, importFromInsomnia } from '@/lib/importExport';
import { EnvironmentSelector } from '@/components/gravitee/EnvironmentSelector';
import { CollectionRunner } from '@/components/gravitee/CollectionRunner';
import { useState } from 'react';
import type { Collection, KeyValuePair } from '@/types/api';
import type { Environment } from '@/lib/variables';
import { toast } from 'sonner';

interface TopBarProps {
  collections: Collection[];
  setCollections: (collections: Collection[]) => void;
  environments?: Environment[];
  activeEnvId?: string | null;
  globalVars?: KeyValuePair[];
  onEnvironmentsChange?: (envs: Environment[]) => void;
  onActiveEnvChange?: (id: string | null) => void;
  onGlobalVarsChange?: (vars: KeyValuePair[]) => void;
}

export function GraviteeTopBar({
  collections,
  setCollections,
  environments = [],
  activeEnvId = null,
  globalVars = [],
  onEnvironmentsChange = () => {},
  onActiveEnvChange = () => {},
  onGlobalVarsChange = () => {},
}: TopBarProps) {
  const [runnerOpen, setRunnerOpen] = useState(false);
  const handleExport = () => {
    const json = exportToJSON(collections);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gravitee-collections-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Collections exported successfully');
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const format = detectFormat(data);
        let imported: Collection[];
        if (format === 'native') imported = data;
        else if (format === 'postman') imported = importFromPostman(data);
        else if (format === 'insomnia') imported = importFromInsomnia(data);
        else throw new Error('Unknown format');
        setCollections(imported);
        toast.success(`Imported ${imported.length} collection(s)`);
      } catch {
        toast.error('Failed to import collections');
      }
    };
    input.click();
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <img
          src="/gravitee-logo.png"
          alt="Gravitee"
          className="h-8 w-8 object-contain"
        />
        <div>
          <h1 className="text-sm font-semibold text-foreground tracking-tight leading-none">
            Gravitee
          </h1>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">API Client</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRunnerOpen(true)}
          className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
        >
          <Play className="w-3.5 h-3.5 mr-1.5" />
          Run Collection
        </Button>
        <div className="w-px h-4 bg-border" />
        {onEnvironmentsChange ? (
          <EnvironmentSelector
            environments={environments}
            activeEnvId={activeEnvId}
            globalVars={globalVars}
            onEnvironmentsChange={onEnvironmentsChange}
            onActiveEnvChange={onActiveEnvChange}
            onGlobalVarsChange={onGlobalVarsChange}
          />
        ) : null}
        <div className="w-px h-4 bg-border" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImport}
          className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
        >
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          Import
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export
        </Button>
        <div className="w-px h-4 bg-border" />
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8"
        >
          <Settings className="w-3.5 h-3.5" />
        </Button>
      </div>
      <CollectionRunner
        open={runnerOpen}
        onOpenChange={setRunnerOpen}
        collections={collections}
        activeEnvId={activeEnvId}
        environments={environments}
        globalVars={globalVars}
      />
    </header>
  );
}
