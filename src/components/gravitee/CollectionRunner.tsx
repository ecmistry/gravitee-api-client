import { useState, useRef, useCallback } from 'react';
import { Play, Square, CheckCircle2, XCircle, FileJson, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { executeRequest } from '@/lib/executeRequest';
import { getAllRequests } from '@/lib/collections';
import {
  parseDataFile,
  exportRunResultJSON,
  exportRunResultHTML,
  type RunResult,
  type RunItemResult,
} from '@/lib/collectionRunner';
import type { Collection, ApiRequest } from '@/types/api';
import type { Environment } from '@/lib/variables';
import type { KeyValuePair } from '@/types/api';
import { METHOD_COLORS } from '@/types/api';

interface CollectionRunnerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
  activeEnvId: string | null;
  environments: Environment[];
  globalVars: KeyValuePair[];
}

type RunTarget = { type: 'collection'; collection: Collection } | { type: 'folder'; collection: Collection; folderId: string };

function getRequestsFromTarget(target: RunTarget): ApiRequest[] {
  if (target.type === 'folder') {
    const folder = target.collection.folders.find(f => f.id === target.folderId);
    return folder?.requests ?? [];
  }
  return getAllRequests(target.collection);
}

export function CollectionRunner({
  open,
  onOpenChange,
  collections,
  activeEnvId,
  environments,
  globalVars,
}: CollectionRunnerProps) {
  const [target, setTarget] = useState<RunTarget | null>(null);
  const [envId, setEnvId] = useState<string | null>(activeEnvId);
  const [iterations, setIterations] = useState(1);
  const [delayMs, setDelayMs] = useState(0);
  const [dataFile, setDataFile] = useState<{ name: string; rows: Map<string, string>[] } | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const stopRef = useRef(false);

  const requests = target ? getRequestsFromTarget(target) : [];
  const dataRows = dataFile?.rows ?? [];
  const iterationCount = Math.max(1, dataFile ? dataRows.length : iterations);
  const totalRuns = requests.length * iterationCount;

  const handleRun = useCallback(async () => {
    if (!target || requests.length === 0) return;
    setRunning(true);
    setResult(null);
    stopRef.current = false;
    const runId = `run-${Date.now()}`;
    const startTime = Date.now();
    const scriptVars = new Map<string, string>();
    const _dataRows = dataFile?.rows ?? [new Map()];
    const _iterationCount = Math.max(1, dataFile ? _dataRows.length : iterations);
    setProgress({ current: 0, total: requests.length * _iterationCount });
    const items: RunItemResult[] = [];
    let passedTests = 0;
    let failedTests = 0;

    let runIndex = 0;
    for (let iter = 0; iter < _iterationCount && !stopRef.current; iter++) {
      const iterationVars = _dataRows[iter % _dataRows.length];
      for (const req of requests) {
        if (stopRef.current) break;
        const folder = target.type === 'folder'
          ? target.collection.folders.find(f => f.id === target.folderId)
          : undefined;
        try {
          const { response, testResults } = await executeRequest({
            request: req,
            collection: target.collection,
            folder,
            activeEnvId: envId,
            environments,
            globalVars,
            scriptVars,
            iterationVars: iterationVars.size > 0 ? iterationVars : undefined,
          });
          const passed = testResults.filter(r => r.passed).length;
          const failed = testResults.filter(r => !r.passed).length;
          passedTests += passed;
          failedTests += failed;
          items.push({
            requestId: req.id,
            requestName: req.name,
            method: req.method,
            url: typeof response.data === 'object' && response.data && 'error' in response.data
              ? '—'
              : req.url,
            response,
            testResults,
            duration: response.time,
          });
        } catch (e) {
          failedTests += 1;
          items.push({
            requestId: req.id,
            requestName: req.name,
            method: req.method,
            url: req.url,
            response: {
              status: 0,
              statusText: 'Error',
              headers: {},
              data: { error: e instanceof Error ? e.message : String(e) },
              time: 0,
              size: 0,
            },
            testResults: [{ name: 'Request failed', passed: false, error: e instanceof Error ? e.message : String(e) }],
            duration: 0,
          });
        }
        runIndex++;
        setProgress({ current: runIndex, total: requests.length * _iterationCount });
        if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
      }
    }

    setResult({
      runId,
      startTime,
      endTime: Date.now(),
      totalRequests: requests.length,
      totalIterations: _iterationCount,
      passedTests,
      failedTests,
      items,
      stopped: stopRef.current,
    });
    setRunning(false);
  }, [target, requests, envId, environments, globalVars, iterations, delayMs, dataFile]);

  const handleStop = useCallback(() => {
    stopRef.current = true;
  }, []);

  const handleDataFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const rows = parseDataFile(content, file.name);
      setDataFile(rows.length > 0 ? { name: file.name, rows } : null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportJSON = () => {
    if (!result) return;
    const blob = new Blob([exportRunResultJSON(result)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `run-${result.runId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportHTML = () => {
    if (!result) return;
    const blob = new Blob([exportRunResultHTML(result)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `run-${result.runId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const collectionOptions = collections.filter(c => {
    const hasRoot = c.requests.length > 0;
    const hasFolderReqs = c.folders.some(f => f.requests.length > 0);
    return hasRoot || hasFolderReqs;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Collection Runner</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Collection / Folder</Label>
              <Select
                value={target?.type === 'collection' ? target.collection.id : target?.type === 'folder' ? `${target.collection.id}:${target.folderId}` : ''}
                onValueChange={(v) => {
                  if (!v) { setTarget(null); return; }
                  const [colId, folderId] = v.split(':');
                  const col = collections.find(c => c.id === colId);
                  if (!col) return;
                  if (folderId) {
                    setTarget({ type: 'folder', collection: col, folderId });
                  } else {
                    setTarget({ type: 'collection', collection: col });
                  }
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select collection or folder" />
                </SelectTrigger>
                <SelectContent>
                  {collectionOptions.flatMap(col => [
                    <SelectItem key={col.id} value={col.id}>
                      {col.name} (all)
                    </SelectItem>,
                    ...col.folders.filter(f => f.requests.length > 0).map(f => (
                      <SelectItem key={`${col.id}:${f.id}`} value={`${col.id}:${f.id}`}>
                        {col.name} › {f.name}
                      </SelectItem>
                    )),
                  ])}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Environment</Label>
              <Select value={envId ?? 'none'} onValueChange={(v) => setEnvId(v === 'none' ? null : v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Environment</SelectItem>
                  {environments.map(env => (
                    <SelectItem key={env.id} value={env.id}>{env.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Iterations</Label>
              <Input
                type="number"
                min={1}
                value={iterations}
                onChange={(e) => setIterations(Math.max(1, parseInt(e.target.value, 10) || 1))}
                disabled={!!dataFile}
                className="h-9"
              />
              {dataFile && <p className="text-[10px] text-muted-foreground">Using {dataFile.rows.length} rows from {dataFile.name}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Delay between requests (ms)</Label>
              <Input
                type="number"
                min={0}
                value={delayMs}
                onChange={(e) => setDelayMs(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="h-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Data file (CSV/JSON for data-driven testing)</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".csv,.json"
                onChange={handleDataFileChange}
                className="h-9 text-xs"
              />
              {dataFile && (
                <span className="text-xs text-muted-foreground self-center">
                  {dataFile.name} ({dataFile.rows.length} rows)
                </span>
              )}
            </div>
          </div>

          {/* Run / Stop */}
          <div className="flex gap-2">
            <Button
              onClick={handleRun}
              disabled={!target || requests.length === 0 || running}
              className="bg-primary"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Run
            </Button>
            {running && (
              <Button variant="outline" onClick={handleStop}>
                <Square className="w-3.5 h-3.5 mr-1.5" />
                Stop
              </Button>
            )}
          </div>

          {/* Progress */}
          {running && (
            <div className="space-y-1">
              <Progress value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0} className="h-2" />
              <p className="text-xs text-muted-foreground">Executing… {progress.current} / {progress.total}</p>
            </div>
          )}

          {/* Results */}
          {result && !running && (
            <div className="flex-1 flex flex-col min-h-0 border rounded-lg border-border">
              <div className="p-3 border-b border-border flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs">
                  <span className="font-semibold">Summary:</span> {result.items.length} run(s) |{' '}
                  <span className="text-status-success">{result.passedTests} passed</span> |{' '}
                  <span className="text-status-client-error">{result.failedTests} failed</span> |{' '}
                  {(result.endTime - result.startTime)}ms
                  {result.stopped && <span className="text-status-client-error ml-1">(stopped)</span>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportJSON} className="h-8 text-xs">
                    <FileJson className="w-3.5 h-3.5 mr-1" />
                    Export JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportHTML} className="h-8 text-xs">
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    Export HTML
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1 h-[240px]">
                <Accordion type="multiple" className="px-3 py-2">
                  {result.items.map((item, i) => {
                    const allPassed = item.testResults.every(r => r.passed);
                    return (
                      <AccordionItem key={`${item.requestId}-${i}`} value={`item-${i}`}>
                        <AccordionTrigger className="py-2 text-xs hover:no-underline">
                          <div className="flex items-center gap-2 text-left">
                            {allPassed ? <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" /> : <XCircle className="w-4 h-4 text-status-client-error shrink-0" />}
                            <span className={`font-mono ${METHOD_COLORS[item.method] ?? ''}`}>{item.method}</span>
                            <span className="text-muted-foreground truncate">{item.requestName}</span>
                            <span className="text-muted-foreground">{item.response.status} {item.response.statusText}</span>
                            <span className="text-muted-foreground">{item.duration}ms</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pb-2 text-xs">
                            {item.testResults.map((t, j) => (
                              <div key={j} className={t.passed ? 'text-status-success' : 'text-status-client-error'}>
                                {t.passed ? '✓' : '✗'} {t.name}
                                {t.error && <span className="block text-muted-foreground ml-4">{t.error}</span>}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
