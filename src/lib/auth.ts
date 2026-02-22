import type { AuthConfig } from '@/types/auth';

export interface AuthResult {
  headers: Record<string, string>;
  params: Record<string, string>;
}

/** Apply auth config to produce headers and query params for the request */
export function applyAuth(config: AuthConfig | undefined): AuthResult {
  const headers: Record<string, string> = {};
  const params: Record<string, string> = {};

  if (!config || config.type === 'no-auth') return { headers, params };

  switch (config.type) {
    case 'api-key': {
      const key = config.keyName?.trim() || config.key?.trim() || 'X-API-Key';
      const value = config.value?.trim();
      if (value) {
        if (config.addTo === 'header') headers[key] = value;
        else params[key] = value;
      }
      break;
    }
    case 'bearer':
      if (config.token?.trim()) {
        headers['Authorization'] = `Bearer ${config.token.trim()}`;
      }
      break;
    case 'basic': {
      const u = config.username?.trim() ?? '';
      const p = config.password ?? '';
      if (u || p) {
        const encoded = btoa(`${u}:${p}`);
        headers['Authorization'] = `Basic ${encoded}`;
      }
      break;
    }
    case 'oauth2':
      if (config.accessToken?.trim()) {
        headers['Authorization'] = `Bearer ${config.accessToken.trim()}`;
      }
      break;
    case 'digest':
      // Digest auth requires challenge-response; full impl needs initial request + retry with computed response
      // For now, credentials are stored but not sent - full flow deferred
      break;
    case 'aws-sig-v4':
      // AWS Sig v4 requires crypto; placeholder - full impl would need aws4 or similar
      break;
    case 'jwt-bearer':
      if (config.token?.trim()) {
        headers['Authorization'] = `Bearer ${config.token.trim()}`;
      }
      break;
    default:
      break;
  }

  return { headers, params };
}

/** Decode JWT payload (middle part) for display - does not verify signature */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}
