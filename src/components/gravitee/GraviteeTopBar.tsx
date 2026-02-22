import { Upload, Download, Settings, Play, Server, FileText, Activity, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  exportToJSON,
  exportToOpenAPI,
  exportToPostman,
  detectFormat,
  importFromPostman,
  importFromInsomnia,
  parseSpecText,
} from '@/lib/importExport';
import { importFromOpenAPI3, importFromSwagger2 } from '@/lib/openApiImport';
import { validateOpenAPI, hasValidationErrors } from '@/lib/openApiValidation';
import { EnvironmentSelector } from '@/components/gravitee/EnvironmentSelector';
import { CollectionRunner } from '@/components/gravitee/CollectionRunner';
import { MockServer } from '@/components/gravitee/MockServer';
import { ApiDocs } from '@/components/gravitee/ApiDocs';
import { SettingsSheet } from '@/components/gravitee/SettingsSheet';
import { MonitoringSheet } from '@/components/gravitee/MonitoringSheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const [mockOpen, setMockOpen] = useState(false);
  const [apiDocsOpen, setApiDocsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [monitoringOpen, setMonitoringOpen] = useState(false);
  const handleExport = (format: 'native' | 'openapi-json' | 'openapi-yaml' | 'postman') => {
    let content: string;
    let filename: string;
    let mime: string;
    if (format === 'native') {
      content = exportToJSON(collections);
      filename = `gravitee-collections-${Date.now()}.json`;
      mime = 'application/json';
    } else if (format === 'openapi-json') {
      content = exportToOpenAPI(collections, 'json');
      filename = `openapi-${Date.now()}.json`;
      mime = 'application/json';
    } else if (format === 'openapi-yaml') {
      content = exportToOpenAPI(collections, 'yaml');
      filename = `openapi-${Date.now()}.yaml`;
      mime = 'text/yaml';
    } else {
      content = exportToPostman(collections);
      filename = `postman-collection-${Date.now()}.json`;
      mime = 'application/json';
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Collections exported successfully');
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.yaml,.yml';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = await parseSpecText(text);
        const format = detectFormat(data);
        let imported: Collection[];
        if (format === 'native') imported = data as Collection[];
        else if (format === 'postman') imported = importFromPostman(data as Record<string, unknown>);
        else if (format === 'insomnia') imported = importFromInsomnia(data);
        else if (format === 'openapi') {
          const validation = validateOpenAPI(data);
          if (hasValidationErrors(validation)) {
            const errs = validation.filter((e) => e.severity === 'error');
            toast.error(`OpenAPI validation errors: ${errs.map((e) => e.message).join('; ')}`);
            return;
          }
          imported = importFromOpenAPI3(data);
        } else if (format === 'swagger') {
          const validation = validateOpenAPI(data);
          if (hasValidationErrors(validation)) {
            toast.error('Swagger validation failed');
            return;
          }
          imported = importFromSwagger2(data);
        } else throw new Error('Unknown or unsupported format');
        setCollections(imported);
        toast.success(`Imported ${imported.length} collection(s)`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to import');
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMockOpen(true)}
          className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
        >
          <Server className="w-3.5 h-3.5 mr-1.5" />
          Mock Server
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setApiDocsOpen(true)}
          className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
        >
          <FileText className="w-3.5 h-3.5 mr-1.5" />
          API Docs
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMonitoringOpen(true)}
          className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
        >
          <Activity className="w-3.5 h-3.5 mr-1.5" />
          Monitoring
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('native')}>
              Native JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('openapi-json')}>
              OpenAPI 3.0 JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('openapi-yaml')}>
              OpenAPI 3.0 YAML
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('postman')}>
              Postman v2.1
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="w-px h-4 bg-border" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
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
      <MockServer open={mockOpen} onOpenChange={setMockOpen} collections={collections} />
      <ApiDocs open={apiDocsOpen} onOpenChange={setApiDocsOpen} collections={collections} />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      <MonitoringSheet
        open={monitoringOpen}
        onOpenChange={setMonitoringOpen}
        collections={collections}
        environments={environments}
        globalVars={globalVars}
      />
    </header>
  );
}
