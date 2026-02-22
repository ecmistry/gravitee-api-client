/**
 * Phase 11 — Monitoring & Scheduled Runs
 * Monitors tab: CRUD, schedule, environment, thresholds, alerts
 * Results tab: Run history, per-request breakdown, trend charts
 */
import { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  getMonitors,
  addMonitor,
  updateMonitor,
  removeMonitor,
  getRunHistory,
} from '@/lib/monitors';
import { runMonitor } from '@/lib/monitorRunner';
import { createScheduler, isMonitorDue } from '@/lib/monitorScheduler';
import type { Monitor, MonitorAlertThresholds, ScheduleInterval } from '@/types/monitor';
import type { Collection, KeyValuePair } from '@/types/api';
import type { Environment } from '@/lib/variables';
import {
  BarChart3,
  Activity,
  Plus,
  Pencil,
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const SCHEDULE_OPTIONS: { value: ScheduleInterval; label: string }[] = [
  { value: '5m', label: 'Every 5 minutes' },
  { value: '15m', label: 'Every 15 minutes' },
  { value: '1h', label: 'Every hour' },
  { value: '6h', label: 'Every 6 hours' },
  { value: '1d', label: 'Every day' },
];

const DEFAULT_THRESHOLDS: MonitorAlertThresholds = {
  maxResponseTimeMs: 0,
  minStatusCode: 0,
  alertOnTestFailure: true,
};

interface MonitoringSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
  environments: Environment[];
  globalVars: KeyValuePair[];
}

export function MonitoringSheet({
  open,
  onOpenChange,
  collections,
  environments,
  globalVars,
}: MonitoringSheetProps) {
  const { activeWorkspaceId } = useWorkspace();
  const [monitors, setMonitorsState] = useState<Monitor[]>([]);
  const [runHistory, setRunHistory] = useState(getRunHistory(100));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setMonitorsState(getMonitors(activeWorkspaceId));
    setRunHistory(getRunHistory(100));
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh, activeWorkspaceId]);

  // Scheduler: run due monitors
  useEffect(() => {
    if (!open) return;
    const checkAndRun = async () => {
      const list = getMonitors(activeWorkspaceId);
      for (const mon of list) {
        if (!mon.enabled || !isMonitorDue(mon)) continue;
        const col = collections.find((c) => c.id === mon.collectionId);
        if (!col) continue;
        setRunningId(mon.id);
        try {
          await runMonitor({
            monitor: mon,
            collection: col,
            environments,
            globalVars,
            workspaceId: activeWorkspaceId,
          });
          refresh();
        } catch {
          // ignore
        } finally {
          setRunningId(null);
        }
      }
    };
    const { start, stop } = createScheduler(checkAndRun);
    start();
    return stop;
  }, [open, activeWorkspaceId, collections, environments, globalVars, refresh]);

  const handleRunNow = async (monitor: Monitor) => {
    const col = collections.find((c) => c.id === monitor.collectionId);
    if (!col) return;
    setRunningId(monitor.id);
    try {
      await runMonitor({
        monitor,
        collection: col,
        environments,
        globalVars,
        workspaceId: activeWorkspaceId,
      });
      refresh();
    } catch {
      refresh();
    } finally {
      setRunningId(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Monitoring</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="monitors" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monitors" className="text-xs">
              <Activity className="w-3.5 h-3.5 mr-1" />
              Monitors
            </TabsTrigger>
            <TabsTrigger value="results" className="text-xs">
              <BarChart3 className="w-3.5 h-3.5 mr-1" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitors" className="mt-4 space-y-4">
            <MonitorList
              monitors={monitors}
              collections={collections}
              environments={environments}
              editingId={editingId}
              setEditingId={setEditingId}
              runningId={runningId}
              onRunNow={handleRunNow}
              onRefresh={refresh}
              workspaceId={activeWorkspaceId}
            />
          </TabsContent>

          <TabsContent value="results" className="mt-4 space-y-4">
            <ResultsDashboard
              runHistory={runHistory}
              expandedRunId={expandedRunId}
              setExpandedRunId={setExpandedRunId}
              onRefresh={refresh}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function MonitorList({
  monitors,
  collections,
  environments,
  editingId,
  setEditingId,
  runningId,
  onRunNow,
  onRefresh,
  workspaceId,
}: {
  monitors: Monitor[];
  collections: Collection[];
  environments: Environment[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  runningId: string | null;
  onRunNow: (m: Monitor) => void;
  onRefresh: () => void;
  workspaceId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Monitor>>({
    name: '',
    collectionId: '',
    folderId: undefined,
    environmentId: null,
    schedule: '1h',
    thresholds: DEFAULT_THRESHOLDS,
    webhook: { enabled: false, url: '' },
    email: { enabled: false },
    enabled: true,
  });

  const handleAdd = () => {
    if (!form.name?.trim() || !form.collectionId) return;
    const m = addMonitor(workspaceId, {
      name: form.name.trim(),
      collectionId: form.collectionId,
      folderId: form.folderId || undefined,
      environmentId: form.environmentId ?? null,
      schedule: (form.schedule as ScheduleInterval) ?? '1h',
      thresholds: form.thresholds ?? DEFAULT_THRESHOLDS,
      webhook: form.webhook ?? { enabled: false, url: '' },
      email: form.email ?? { enabled: false },
      enabled: form.enabled ?? true,
    });
    setForm({ name: '', collectionId: '', environmentId: null, schedule: '1h', thresholds: DEFAULT_THRESHOLDS, webhook: { enabled: false, url: '' }, email: { enabled: false }, enabled: true });
    setShowForm(false);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-xs">Scheduled monitors</Label>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add monitor
        </Button>
      </div>

      {showForm && (
        <MonitorForm
          form={form}
          setForm={setForm}
          collections={collections}
          environments={environments}
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      <ScrollArea className="h-[280px] rounded border">
        <div className="p-2 space-y-1">
          {monitors.length === 0 && !showForm && (
            <p className="text-xs text-muted-foreground py-4 text-center">No monitors. Add one to run collections on a schedule.</p>
          )}
          {monitors.map((m) => (
            <MonitorRow
              key={m.id}
              monitor={m}
              collection={collections.find((c) => c.id === m.collectionId)}
              collections={collections}
              environments={environments}
              isEditing={editingId === m.id}
              onEdit={() => setEditingId(editingId === m.id ? null : m.id)}
              onDelete={() => {
                removeMonitor(workspaceId, m.id);
                onRefresh();
              }}
              onRunNow={() => onRunNow(m)}
              isRunning={runningId === m.id}
              workspaceId={workspaceId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      </ScrollArea>
      <p className="text-[10px] text-muted-foreground">
        Monitors run when the app is open. Email alerts require a backend.
      </p>
    </div>
  );
}

function MonitorForm({
  form,
  setForm,
  collections,
  environments,
  onSave,
  onCancel,
}: {
  form: Partial<Monitor>;
  setForm: (f: Partial<Monitor>) => void;
  collections: Collection[];
  environments: Environment[];
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="border rounded p-3 space-y-3 text-xs">
      <div>
        <Label className="text-xs">Name</Label>
        <Input
          value={form.name ?? ''}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Monitor name"
          className="mt-1 h-8"
        />
      </div>
      <div>
        <Label className="text-xs">Collection</Label>
        <Select value={form.collectionId ?? ''} onValueChange={(v) => setForm({ ...form, collectionId: v, folderId: undefined })}>
          <SelectTrigger className="mt-1 h-8">
            <SelectValue placeholder="Select collection" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {form.collectionId && (
        <div>
          <Label className="text-xs">Folder (optional)</Label>
          <Select value={form.folderId ?? 'all'} onValueChange={(v) => setForm({ ...form, folderId: v === 'all' ? undefined : v })}>
            <SelectTrigger className="mt-1 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Entire collection</SelectItem>
              {collections.find((c) => c.id === form.collectionId)?.folders.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label className="text-xs">Environment</Label>
        <Select value={form.environmentId ?? 'none'} onValueChange={(v) => setForm({ ...form, environmentId: v === 'none' ? null : v })}>
          <SelectTrigger className="mt-1 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No environment</SelectItem>
            {environments.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Schedule</Label>
        <Select value={form.schedule ?? '1h'} onValueChange={(v) => setForm({ ...form, schedule: v as ScheduleInterval })}>
          <SelectTrigger className="mt-1 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCHEDULE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={onSave} disabled={!form.name?.trim() || !form.collectionId}>
          Add
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function MonitorRow({
  monitor,
  collection,
  collections,
  environments,
  isEditing,
  onEdit,
  onDelete,
  onRunNow,
  isRunning,
  workspaceId,
  onRefresh,
}: {
  monitor: Monitor;
  collection: Collection | undefined;
  collections: Collection[];
  environments: Environment[];
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRunNow: () => void;
  isRunning: boolean;
  workspaceId: string;
  onRefresh: () => void;
}) {
  const [local, setLocal] = useState(monitor);
  useEffect(() => {
    setLocal(monitor);
  }, [monitor]);

  if (isEditing) {
    return (
      <MonitorEditForm
        monitor={local}
        setMonitor={setLocal}
        collection={collection}
        onSave={() => {
          updateMonitor(workspaceId, monitor.id, local);
          onEdit();
          onRefresh();
        }}
        onCancel={onEdit}
        collections={collections}
        environments={environments}
      />
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded border bg-card">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-xs truncate">{monitor.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {collection?.name ?? 'Unknown'} · {SCHEDULE_OPTIONS.find((o) => o.value === monitor.schedule)?.label ?? monitor.schedule}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onRunNow} disabled={isRunning || !collection}>
          <Play className="w-3.5 h-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function MonitorEditForm({
  monitor,
  setMonitor,
  collection,
  onSave,
  onCancel,
  collections,
  environments,
}: {
  monitor: Monitor;
  setMonitor: (m: Monitor) => void;
  collection: Collection | undefined;
  onSave: () => void;
  onCancel: () => void;
  collections: Collection[];
  environments: Environment[];
}) {
  return (
    <div className="border rounded p-3 space-y-2 text-xs">
      <div>
        <Label>Name</Label>
        <Input value={monitor.name} onChange={(e) => setMonitor({ ...monitor, name: e.target.value })} className="h-8" />
      </div>
      <div>
        <Label>Environment</Label>
        <Select value={monitor.environmentId ?? 'none'} onValueChange={(v) => setMonitor({ ...monitor, environmentId: v === 'none' ? null : v })}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No environment</SelectItem>
            {environments.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Schedule</Label>
        <Select value={monitor.schedule} onValueChange={(v) => setMonitor({ ...monitor, schedule: v as ScheduleInterval })}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCHEDULE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={monitor.enabled} onCheckedChange={(v) => setMonitor({ ...monitor, enabled: v })} />
        <Label>Enabled</Label>
      </div>
      <div>
        <Label>Webhook URL (e.g. Slack)</Label>
        <Input
          value={monitor.webhook.url}
          onChange={(e) => setMonitor({ ...monitor, webhook: { ...monitor.webhook, url: e.target.value } })}
          placeholder="https://hooks.slack.com/..."
          className="h-8"
        />
        <div className="flex items-center gap-2 mt-1">
          <Switch
            checked={monitor.webhook.enabled}
            onCheckedChange={(v) => setMonitor({ ...monitor, webhook: { ...monitor.webhook, enabled: v } })}
          />
          <Label className="text-[10px]">Send on failure</Label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={onSave}>Save</Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function ResultsDashboard({
  runHistory,
  expandedRunId,
  setExpandedRunId,
  onRefresh,
}: {
  runHistory: Array<{
    id: string;
    monitorName: string;
    startTime: number;
    endTime: number;
    passed: boolean;
    totalRequests: number;
    passedTests: number;
    failedTests: number;
    maxResponseTimeMs: number;
    itemsSummary: Array<{ requestName: string; method: string; passed: boolean; statusCode: number; responseTimeMs: number }>;
  }>;
  expandedRunId: string | null;
  setExpandedRunId: (id: string | null) => void;
  onRefresh: () => void;
}) {
  // Trend data: last 20 runs for chart
  const trendData = runHistory
    .slice(0, 20)
    .reverse()
    .map((r) => ({
      name: format(r.startTime, 'HH:mm'),
      time: r.endTime - r.startTime,
      passRate: r.totalRequests > 0 ? Math.round(((r.passedTests) / (r.passedTests + r.failedTests)) * 100) || 0 : 100,
    }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-xs">Run history</Label>
        <Button size="sm" variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {trendData.length >= 2 && (
        <div>
          <Label className="text-xs mb-2 block">Response time trend</Label>
          <ChartContainer config={{ time: { label: 'Total ms', color: 'hsl(var(--primary))' } }} className="h-32">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="time" stroke="var(--color-time)" name="Duration (ms)" />
            </LineChart>
          </ChartContainer>
        </div>
      )}

      <ScrollArea className="h-[320px] rounded border">
        <div className="p-2 space-y-1">
          {runHistory.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center">No runs yet. Run a monitor to see results.</p>
          )}
          {runHistory.map((r) => {
            const isExpanded = expandedRunId === r.id;
            return (
              <div key={r.id} className="border rounded overflow-hidden">
                <button
                  className="w-full flex items-center gap-2 p-2 text-left hover:bg-muted/50"
                  onClick={() => setExpandedRunId(isExpanded ? null : r.id)}
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                  {r.passed ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> : <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs truncate">{r.monitorName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(r.startTime), 'MMM d, HH:mm')} · {r.totalRequests} requests · {r.passedTests} passed, {r.failedTests} failed
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
                {isExpanded && (
                  <div className="border-t px-2 py-2 bg-muted/30 text-xs space-y-1">
                    {r.itemsSummary.map((item, i) => (
                      <div key={i} className="flex justify-between gap-2">
                        <span className="truncate">{item.method} {item.requestName}</span>
                        <span className={item.passed ? 'text-green-600' : 'text-red-600'}>
                          {item.statusCode} · {item.responseTimeMs}ms
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
