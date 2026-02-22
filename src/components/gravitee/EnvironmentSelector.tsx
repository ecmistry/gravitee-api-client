import { useState } from 'react';
import { ChevronDown, Settings2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import type { Environment } from '@/lib/variables';
import type { KeyValuePair } from '@/types/api';

interface EnvironmentSelectorProps {
  environments: Environment[];
  activeEnvId: string | null;
  globalVars: KeyValuePair[];
  onEnvironmentsChange: (envs: Environment[]) => void;
  onActiveEnvChange: (id: string | null) => void;
  onGlobalVarsChange: (vars: KeyValuePair[]) => void;
}

export function EnvironmentSelector({
  environments,
  activeEnvId,
  globalVars,
  onEnvironmentsChange,
  onActiveEnvChange,
  onGlobalVarsChange,
}: EnvironmentSelectorProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const addEnvironment = () => {
    const env: Environment = {
      id: `env-${Date.now()}`,
      name: 'New Environment',
      variables: []
    };
    onEnvironmentsChange([...environments, env]);
    onActiveEnvChange(env.id);
  };

  const removeEnvironment = (id: string) => {
    onEnvironmentsChange(environments.filter(e => e.id !== id));
    if (activeEnvId === id) onActiveEnvChange(environments[0]?.id ?? null);
  };

  const updateEnvName = (id: string, name: string) => {
    onEnvironmentsChange(environments.map(e => e.id === id ? { ...e, name } : e));
  };

  const updateEnvVar = (envId: string, idx: number, field: 'key' | 'value' | 'enabled', val: string | boolean) => {
    onEnvironmentsChange(environments.map(e => {
      if (e.id !== envId) return e;
      const v = [...e.variables];
      v[idx] = { ...v[idx], [field]: val };
      return { ...e, variables: v };
    }));
  };

  const addEnvVar = (envId: string) => {
    onEnvironmentsChange(environments.map(e =>
      e.id === envId ? { ...e, variables: [...e.variables, { key: '', value: '', enabled: true }] } : e
    ));
  };

  const removeEnvVar = (envId: string, idx: number) => {
    onEnvironmentsChange(environments.map(e =>
      e.id === envId ? { ...e, variables: e.variables.filter((_, i) => i !== idx) } : e
    ));
  };

  const addGlobalVar = () => {
    onGlobalVarsChange([...globalVars, { key: '', value: '', enabled: true }]);
  };

  const updateGlobalVar = (idx: number, field: 'key' | 'value' | 'enabled', val: string | boolean) => {
    const v = [...globalVars];
    v[idx] = { ...v[idx], [field]: val };
    onGlobalVarsChange(v);
  };

  const removeGlobalVar = (idx: number) => {
    onGlobalVarsChange(globalVars.filter((_, i) => i !== idx));
  };

  const activeEnv = environments.find(e => e.id === activeEnvId);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-border">
            <Globe className="w-3.5 h-3.5" />
            {activeEnv ? activeEnv.name : 'No Environment'}
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => onActiveEnvChange(null)}>
            No Environment
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {environments.map(env => (
            <DropdownMenuItem key={env.id} onClick={() => onActiveEnvChange(env.id)}>
              {env.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSheetOpen(true)}>
            <Settings2 className="w-3.5 h-3.5 mr-2" />
            Manage environments
          </DropdownMenuItem>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Environments</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Global variables
                    </h4>
                    <Button variant="ghost" size="sm" onClick={addGlobalVar} className="h-7 text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {globalVars.map((v, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input type="checkbox" checked={v.enabled} onChange={e => updateGlobalVar(i, 'enabled', e.target.checked)} className="accent-primary" />
                        <Input placeholder="Key" value={v.key} onChange={e => updateGlobalVar(i, 'key', e.target.value)} className="h-8 text-xs flex-1" />
                        <Input placeholder="Value" value={v.value} onChange={e => updateGlobalVar(i, 'value', e.target.value)} className="h-8 text-xs flex-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeGlobalVar(i)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Environments</h4>
                    <Button variant="ghost" size="sm" onClick={addEnvironment} className="h-7 text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {environments.map(env => (
                      <div key={env.id} className="rounded-lg border border-border p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Input
                            value={env.name}
                            onChange={e => updateEnvName(env.id, e.target.value)}
                            className="h-8 text-xs font-medium"
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeEnvironment(env.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {env.variables.map((v, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input type="checkbox" checked={v.enabled} onChange={e => updateEnvVar(env.id, i, 'enabled', e.target.checked)} className="accent-primary" />
                              <Input placeholder="Key" value={v.key} onChange={e => updateEnvVar(env.id, i, 'key', e.target.value)} className="h-8 text-xs flex-1" />
                              <Input placeholder="Value" value={v.value} onChange={e => updateEnvVar(env.id, i, 'value', e.target.value)} className="h-8 text-xs flex-1" />
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeEnvVar(env.id, i)}>
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                              </Button>
                            </div>
                          ))}
                          <Button variant="ghost" size="sm" onClick={() => addEnvVar(env.id)} className="h-7 text-xs">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add variable
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
