import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { decodeJwtPayload } from '@/lib/auth';
import type { AuthConfig, AuthType } from '@/types/auth';

const AUTH_TYPES: { value: AuthType; label: string }[] = [
  { value: 'no-auth', label: 'No Auth' },
  { value: 'api-key', label: 'API Key' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'oauth2', label: 'OAuth 2.0' },
  { value: 'digest', label: 'Digest Auth' },
  { value: 'aws-sig-v4', label: 'AWS Signature v4' },
  { value: 'jwt-bearer', label: 'JWT Bearer' },
];

const DEFAULT_CONFIGS: Record<AuthType, AuthConfig> = {
  'no-auth': { type: 'no-auth' },
  'api-key': { type: 'api-key', key: '', value: '', addTo: 'header', keyName: 'X-API-Key' },
  'bearer': { type: 'bearer', token: '' },
  'basic': { type: 'basic', username: '', password: '' },
  'oauth2': { type: 'oauth2', grantType: 'client_credentials', accessToken: '' },
  'digest': { type: 'digest', username: '', password: '' },
  'aws-sig-v4': { type: 'aws-sig-v4', accessKeyId: '', secretAccessKey: '', region: 'us-east-1', service: 'execute-api' },
  'jwt-bearer': { type: 'jwt-bearer', token: '' },
};

interface AuthTabProps {
  auth: AuthConfig | undefined;
  authInherit: 'inherit' | 'none';
  canInherit: boolean;
  inheritedAuthLabel?: string;
  onChangeAuth: (auth: AuthConfig) => void;
  onChangeAuthInherit: (v: 'inherit' | 'none') => void;
}

export function AuthTab({
  auth,
  authInherit,
  canInherit,
  inheritedAuthLabel = 'Folder/Collection',
  onChangeAuth,
  onChangeAuthInherit,
}: AuthTabProps) {
  const effective = auth ?? DEFAULT_CONFIGS['no-auth'];
  const type = effective.type;

  const setType = (t: AuthType) => {
    if (t === type) return;
    onChangeAuth(DEFAULT_CONFIGS[t]);
  };

  const update = <K extends keyof AuthConfig>(key: K, value: AuthConfig[K]) => {
    onChangeAuth({ ...effective, [key]: value });
  };

  const jwtClaims = type === 'jwt-bearer' && effective.token
    ? decodeJwtPayload(effective.token)
    : null;

  return (
    <div className="p-5 space-y-4 m-0 max-h-64 overflow-y-auto">
      {canInherit && (
        <div className="space-y-2">
          <Label className="text-xs">Auth Source</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="authInherit"
                checked={authInherit === 'inherit'}
                onChange={() => onChangeAuthInherit('inherit')}
                className="accent-primary"
              />
              <span className="text-xs">Inherit from {inheritedAuthLabel}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="authInherit"
                checked={authInherit === 'none'}
                onChange={() => onChangeAuthInherit('none')}
                className="accent-primary"
              />
              <span className="text-xs">Use request auth</span>
            </label>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs">Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as AuthType)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {AUTH_TYPES.map(({ value, label }) => (
              <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {type === 'api-key' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Key name</Label>
              <Input
                placeholder="X-API-Key"
                value={effective.keyName ?? ''}
                onChange={(e) => update('keyName', e.target.value)}
                className="h-8 text-xs mt-0.5"
              />
            </div>
            <div>
              <Label className="text-xs">Add to</Label>
              <Select value={effective.addTo} onValueChange={(v: 'header' | 'query') => update('addTo', v)}>
                <SelectTrigger className="h-8 text-xs mt-0.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header" className="text-xs">Header</SelectItem>
                  <SelectItem value="query" className="text-xs">Query Param</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Value</Label>
            <Input
              type="password"
              placeholder="API key value"
              value={effective.value ?? ''}
              onChange={(e) => update('value', e.target.value)}
              className="h-8 text-xs font-mono mt-0.5"
            />
          </div>
        </div>
      )}

      {type === 'bearer' && (
        <div>
          <Label className="text-xs">Token</Label>
          <Input
            type="password"
            placeholder="Bearer token"
            value={effective.token ?? ''}
            onChange={(e) => update('token', e.target.value)}
            className="h-8 text-xs font-mono mt-0.5"
          />
        </div>
      )}

      {type === 'basic' && (
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Username</Label>
            <Input
              placeholder="username"
              value={effective.username ?? ''}
              onChange={(e) => update('username', e.target.value)}
              className="h-8 text-xs mt-0.5"
            />
          </div>
          <div>
            <Label className="text-xs">Password</Label>
            <Input
              type="password"
              placeholder="password"
              value={effective.password ?? ''}
              onChange={(e) => update('password', e.target.value)}
              className="h-8 text-xs mt-0.5"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">Encoded as Base64 on send</p>
        </div>
      )}

      {type === 'oauth2' && (
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Grant Type</Label>
            <Select value={effective.grantType} onValueChange={(v) => update('grantType', v as typeof effective.grantType)}>
              <SelectTrigger className="h-8 text-xs mt-0.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="authorization_code" className="text-xs">Authorization Code</SelectItem>
                <SelectItem value="client_credentials" className="text-xs">Client Credentials</SelectItem>
                <SelectItem value="password" className="text-xs">Password</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Access Token</Label>
            <Input
              type="password"
              placeholder="Paste token (from token endpoint)"
              value={effective.accessToken ?? ''}
              onChange={(e) => update('accessToken', e.target.value)}
              className="h-8 text-xs font-mono mt-0.5"
            />
          </div>
          {effective.grantType === 'authorization_code' && (
            <>
              <div><Label className="text-xs">Auth URL</Label><Input placeholder="https://..." value={effective.authUrl ?? ''} onChange={(e) => update('authUrl', e.target.value)} className="h-8 text-xs mt-0.5" /></div>
              <div><Label className="text-xs">Token URL</Label><Input placeholder="https://..." value={effective.tokenUrl ?? ''} onChange={(e) => update('tokenUrl', e.target.value)} className="h-8 text-xs mt-0.5" /></div>
              <div><Label className="text-xs">Client ID</Label><Input value={effective.clientId ?? ''} onChange={(e) => update('clientId', e.target.value)} className="h-8 text-xs mt-0.5" /></div>
              <div><Label className="text-xs">Client Secret</Label><Input type="password" value={effective.clientSecret ?? ''} onChange={(e) => update('clientSecret', e.target.value)} className="h-8 text-xs mt-0.5" /></div>
              <div><Label className="text-xs">Redirect URI</Label><Input placeholder="https://..." value={effective.redirectUri ?? ''} onChange={(e) => update('redirectUri', e.target.value)} className="h-8 text-xs mt-0.5" /></div>
              <div><Label className="text-xs">Scope</Label><Input placeholder="read write" value={effective.scope ?? ''} onChange={(e) => update('scope', e.target.value)} className="h-8 text-xs mt-0.5" /></div>
            </>
          )}
          <p className="text-[10px] text-muted-foreground">Paste token manually or configure flow URLs for reference</p>
        </div>
      )}

      {type === 'digest' && (
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Username</Label>
            <Input placeholder="username" value={effective.username ?? ''} onChange={(e) => update('username', e.target.value)} className="h-8 text-xs mt-0.5" />
          </div>
          <div>
            <Label className="text-xs">Password</Label>
            <Input type="password" placeholder="password" value={effective.password ?? ''} onChange={(e) => update('password', e.target.value)} className="h-8 text-xs mt-0.5" />
          </div>
          <p className="text-[10px] text-muted-foreground">Digest auth requires server challenge; full flow may need retry</p>
        </div>
      )}

      {type === 'aws-sig-v4' && (
        <div className="space-y-2">
          <div><Label className="text-xs">Access Key ID</Label><Input placeholder="AKIA..." value={effective.accessKeyId ?? ''} onChange={(e) => update('accessKeyId', e.target.value)} className="h-8 text-xs font-mono mt-0.5" /></div>
          <div><Label className="text-xs">Secret Access Key</Label><Input type="password" placeholder="..." value={effective.secretAccessKey ?? ''} onChange={(e) => update('secretAccessKey', e.target.value)} className="h-8 text-xs font-mono mt-0.5" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Region</Label><Input placeholder="us-east-1" value={effective.region ?? ''} onChange={(e) => update('region', e.target.value)} className="h-8 text-xs mt-0.5" /></div>
            <div><Label className="text-xs">Service</Label><Input placeholder="execute-api" value={effective.service ?? ''} onChange={(e) => update('service', e.target.value)} className="h-8 text-xs mt-0.5" /></div>
          </div>
          <p className="text-[10px] text-muted-foreground">AWS Sig v4 signing (placeholder; full impl requires crypto)</p>
        </div>
      )}

      {type === 'jwt-bearer' && (
        <div className="space-y-2">
          <div>
            <Label className="text-xs">JWT Token</Label>
            <Input
              type="password"
              placeholder="eyJhbGciOiJSUzI1NiIs..."
              value={effective.token ?? ''}
              onChange={(e) => update('token', e.target.value)}
              className="h-8 text-xs font-mono mt-0.5"
            />
          </div>
          {jwtClaims && (
            <div className="rounded border border-border p-2 bg-muted/30">
              <Label className="text-xs">Claims (decoded)</Label>
              <pre className="text-[10px] font-mono mt-1 overflow-x-auto text-muted-foreground">
                {JSON.stringify(jwtClaims, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
