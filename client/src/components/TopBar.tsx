import { Upload, Download, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { exportToJSON, detectFormat, importFromPostman, importFromInsomnia } from '../lib/importExport';
import type { Collection } from '../App';
import { toast } from 'sonner';

interface TopBarProps {
  collections: Collection[];
  setCollections: (collections: Collection[]) => void;
}

export function TopBar({ collections, setCollections }: TopBarProps) {
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
        if (format === 'native') {
          imported = data;
        } else if (format === 'postman') {
          imported = importFromPostman(data);
        } else if (format === 'insomnia') {
          imported = importFromInsomnia(data);
        } else {
          throw new Error('Unknown format');
        }
        
        setCollections(imported);
        toast.success(`Imported ${imported.length} collection(s)`);
      } catch (error) {
        toast.error('Failed to import collections');
      }
    };

    input.click();
  };

  return (
    <div className="h-16 border-b border-[var(--gravitee-border)] bg-[var(--gravitee-panel-bg)] flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-[var(--gravitee-primary)] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            G
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900 tracking-tight">Gravitee API Client</h1>
            <p className="text-xs text-gray-500">Test and debug your APIs</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImport}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <div className="w-px h-5 bg-[var(--gravitee-border)] mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
