/** Base auth config shared across request, folder, collection */
export type AuthType =
  | 'no-auth'
  | 'api-key'
  | 'bearer'
  | 'basic'
  | 'oauth2'
  | 'digest'
  | 'aws-sig-v4'
  | 'jwt-bearer';

export interface AuthConfigBase {
  type: AuthType;
}

export interface NoAuthConfig extends AuthConfigBase {
  type: 'no-auth';
}

export interface ApiKeyConfig extends AuthConfigBase {
  type: 'api-key';
  key: string;
  value: string;
  addTo: 'header' | 'query';
  keyName?: string; // header/param name, e.g. X-API-Key
}

export interface BearerConfig extends AuthConfigBase {
  type: 'bearer';
  token: string;
}

export interface BasicAuthConfig extends AuthConfigBase {
  type: 'basic';
  username: string;
  password: string;
}

export type OAuth2GrantType = 'authorization_code' | 'client_credentials' | 'password';

export interface OAuth2Config extends AuthConfigBase {
  type: 'oauth2';
  grantType: OAuth2GrantType;
  accessToken?: string; // manual paste or from flow
  // Auth code flow
  authUrl?: string;
  tokenUrl?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scope?: string;
  // Client credentials
  // Password flow
  username?: string;
  password?: string;
}

export interface DigestAuthConfig extends AuthConfigBase {
  type: 'digest';
  username: string;
  password: string;
}

export interface AwsSigV4Config extends AuthConfigBase {
  type: 'aws-sig-v4';
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  service: string;
  sessionToken?: string;
}

export interface JwtBearerConfig extends AuthConfigBase {
  type: 'jwt-bearer';
  token: string;
  // Decoded claims shown in UI (readonly, from token)
  claims?: Record<string, unknown>;
}

export type AuthConfig =
  | NoAuthConfig
  | ApiKeyConfig
  | BearerConfig
  | BasicAuthConfig
  | OAuth2Config
  | DigestAuthConfig
  | AwsSigV4Config
  | JwtBearerConfig;

export const DEFAULT_AUTH: NoAuthConfig = { type: 'no-auth' };
