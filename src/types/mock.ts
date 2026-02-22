import type { KeyValuePair } from './api';

export interface MockExample {
  id: string;
  name?: string;
  status: number;
  headers: KeyValuePair[];
  body: string;
  /** When exampleSelection is 'query', match requests with this query param value */
  queryParam?: string;
}

export type ExampleSelection = 'first' | 'random' | 'sequential' | 'query';

export interface MockRoute {
  id: string;
  requestId: string;
  method: string;
  /** Path pattern e.g. /users/:id */
  path: string;
  /** Optional: require query params to match (key -> value) */
  queryMatch?: Record<string, string>;
  /** When exampleSelection is 'query', the query param name to match (e.g. "scenario") */
  queryParamName?: string;
  examples: MockExample[];
  exampleSelection: ExampleSelection;
  delayMs?: number;
}

export interface MockServerConfig {
  port: number;
  name?: string;
  routes: MockRoute[];
}
