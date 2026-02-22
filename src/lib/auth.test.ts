import { describe, it, expect } from 'vitest';
import { applyAuth, decodeJwtPayload } from './auth';
import type { AuthConfig } from '@/types/auth';

describe('auth', () => {
  describe('applyAuth', () => {
    it('returns empty for undefined or no-auth', () => {
      expect(applyAuth(undefined)).toEqual({ headers: {}, params: {} });
      expect(applyAuth({ type: 'no-auth' })).toEqual({ headers: {}, params: {} });
    });

    it('adds API key to header', () => {
      const config: AuthConfig = {
        type: 'api-key',
        key: 'x-api-key',
        value: 'secret123',
        addTo: 'header',
        keyName: 'X-API-Key',
      };
      const result = applyAuth(config);
      expect(result.headers['X-API-Key']).toBe('secret123');
      expect(result.params).toEqual({});
    });

    it('adds API key to query params', () => {
      const config: AuthConfig = {
        type: 'api-key',
        key: '',
        value: 'keyval',
        addTo: 'query',
        keyName: 'api_key',
      };
      const result = applyAuth(config);
      expect(result.params['api_key']).toBe('keyval');
      expect(result.headers).toEqual({});
    });

    it('uses default key name for API key when keyName empty', () => {
      const config: AuthConfig = {
        type: 'api-key',
        key: 'X-API-Key',
        value: 'val',
        addTo: 'header',
      };
      const result = applyAuth(config);
      expect(result.headers['X-API-Key']).toBe('val');
    });

    it('adds Bearer token to Authorization header', () => {
      const result = applyAuth({ type: 'bearer', token: 'my-token' });
      expect(result.headers['Authorization']).toBe('Bearer my-token');
    });

    it('skips empty Bearer token', () => {
      const result = applyAuth({ type: 'bearer', token: '' });
      expect(result.headers).toEqual({});
    });

    it('encodes Basic auth as Base64', () => {
      const result = applyAuth({ type: 'basic', username: 'user', password: 'pass' });
      expect(result.headers['Authorization']).toBe('Basic dXNlcjpwYXNz');
      expect(atob('dXNlcjpwYXNz')).toBe('user:pass');
    });

    it('skips Basic auth when both username and password empty', () => {
      const result = applyAuth({ type: 'basic', username: '', password: '' });
      expect(result.headers['Authorization']).toBeUndefined();
    });

    it('adds OAuth2 access token as Bearer', () => {
      const result = applyAuth({
        type: 'oauth2',
        grantType: 'client_credentials',
        accessToken: 'oauth-token',
      });
      expect(result.headers['Authorization']).toBe('Bearer oauth-token');
    });

    it('adds JWT Bearer token', () => {
      const result = applyAuth({ type: 'jwt-bearer', token: 'eyJ.eyJ0ZXN0IjoxfQ.sig' });
      expect(result.headers['Authorization']).toBe('Bearer eyJ.eyJ0ZXN0IjoxfQ.sig');
    });

    it('returns empty for digest (deferred)', () => {
      const result = applyAuth({ type: 'digest', username: 'u', password: 'p' });
      expect(result.headers).toEqual({});
      expect(result.params).toEqual({});
    });

    it('returns empty for aws-sig-v4 (deferred)', () => {
      const result = applyAuth({
        type: 'aws-sig-v4',
        accessKeyId: 'AKIA',
        secretAccessKey: 'secret',
        region: 'us-east-1',
        service: 'execute-api',
      });
      expect(result.headers).toEqual({});
      expect(result.params).toEqual({});
    });
  });

  describe('decodeJwtPayload', () => {
    it('decodes valid JWT payload', () => {
      const claims = { sub: '123', exp: 999 };
      const payload = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const token = `header.${payload}.signature`;
      const result = decodeJwtPayload(token);
      expect(result).toEqual(claims);
    });

    it('returns null for invalid token', () => {
      expect(decodeJwtPayload('')).toBeNull();
      expect(decodeJwtPayload('one-part')).toBeNull();
      expect(decodeJwtPayload('a.b')).toBeNull();
      expect(decodeJwtPayload('a.b.c!!!')).toBeNull();
    });

    it('decodes standard JWT claims', () => {
      const claims = { sub: 'user-id', iat: 1234567890 };
      const payload = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const token = `header.${payload}.sig`;
      const result = decodeJwtPayload(token);
      expect(result).toEqual(claims);
    });
  });
});
