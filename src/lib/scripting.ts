/**
 * Pre-request and test scripting with pm API (Postman-compatible)
 */

export interface ScriptVars {
  environment: Map<string, string>;
  globals: Map<string, string>;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export interface PmEnvironment {
  set(key: string, value: string): void;
  get(key: string): string;
  unset(key: string): void;
}

export interface PmGlobals {
  set(key: string, value: string): void;
  get(key: string): string;
  unset(key: string): void;
}

export interface PmResponse {
  code: number;
  status: string;
  headers: Record<string, string>;
  json(): unknown;
  text(): string;
  time: number;
}

/** Create pm object for pre-request script */
export function createPreRequestPm(scriptVars: ScriptVars) {
  const env: PmEnvironment = {
    set: (k, v) => scriptVars.environment.set(k, String(v)),
    get: (k) => scriptVars.environment.get(k) ?? '',
    unset: (k) => scriptVars.environment.delete(k),
  };
  const globals: PmGlobals = {
    set: (k, v) => scriptVars.globals.set(k, String(v)),
    get: (k) => scriptVars.globals.get(k) ?? '',
    unset: (k) => scriptVars.globals.delete(k),
  };
  return { environment: env, globals };
}

/** Run pre-request script. Returns combined vars (env + globals) to merge into resolution. */
export function runPreRequestScript(
  script: string,
  scriptVars: ScriptVars
): { envVars: Map<string, string>; globalVars: Map<string, string> } {
  if (!script?.trim()) return { envVars: scriptVars.environment, globalVars: scriptVars.globals };
  const pm = createPreRequestPm(scriptVars);
  try {
    const fn = new Function('pm', `
      "use strict";
      ${script}
    `);
    fn(pm);
  } catch (e) {
    console.error('Pre-request script error:', e);
    throw e;
  }
  return { envVars: scriptVars.environment, globalVars: scriptVars.globals };
}

/** Expect/assertion chain */
function createExpect(value: unknown) {
  return {
    to: {
      equal(expected: unknown, msg?: string) {
        if (value !== expected) throw new Error(msg ?? `Expected ${JSON.stringify(value)} to equal ${JSON.stringify(expected)}`);
      },
      eql(expected: unknown, msg?: string) {
        if (JSON.stringify(value) !== JSON.stringify(expected)) throw new Error(msg ?? `Expected deep equality`);
      },
      be: {
        ok: () => { if (!value) throw new Error(`Expected ${value} to be truthy`); },
        true: () => { if (value !== true) throw new Error(`Expected ${value} to be true`); },
        false: () => { if (value !== false) throw new Error(`Expected ${value} to be false`); },
        null: () => { if (value !== null) throw new Error(`Expected ${value} to be null`); },
        undefined: () => { if (value !== undefined) throw new Error(`Expected ${value} to be undefined`); },
      },
      have: {
        property(key: string, msg?: string) {
          if (value == null || typeof value !== 'object') throw new Error(msg ?? 'Expected object');
          if (!(key in (value as object))) throw new Error(msg ?? `Expected property '${key}'`);
          return createExpect((value as Record<string, unknown>)[key]);
        },
      },
      include(str: string, msg?: string) {
        if (typeof value !== 'string') throw new Error(msg ?? 'Expected string');
        if (!value.includes(str)) throw new Error(msg ?? `Expected "${value}" to include "${str}"`);
      },
      above(n: number, msg?: string) {
        if (typeof value !== 'number') throw new Error(msg ?? 'Expected number');
        if (value <= n) throw new Error(msg ?? `Expected ${value} to be above ${n}`);
      },
      below(n: number, msg?: string) {
        if (typeof value !== 'number') throw new Error(msg ?? 'Expected number');
        if (value >= n) throw new Error(msg ?? `Expected ${value} to be below ${n}`);
      },
      a(type: string, msg?: string) {
        const t = typeof value;
        if (type === 'number' && t !== 'number') throw new Error(msg ?? `Expected number, got ${t}`);
        if (type === 'string' && t !== 'string') throw new Error(msg ?? `Expected string, got ${t}`);
        if (type === 'object' && (value === null || t !== 'object')) throw new Error(msg ?? `Expected object`);
        if (type === 'array' && !Array.isArray(value)) throw new Error(msg ?? `Expected array`);
      },
    },
  };
}

/** Create pm object for test script */
export function createTestPm(response: PmResponse, results: TestResult[]) {
  const pm = {
    test: (name: string, fn: () => void) => {
      try {
        fn();
        results.push({ name, passed: true });
      } catch (e) {
        results.push({ name, passed: false, error: e instanceof Error ? e.message : String(e) });
      }
    },
    expect: (value: unknown) => createExpect(value),
    response,
  };
  return pm;
}

/** Run test script after response */
export function runTestScript(
  script: string,
  response: { status: number; statusText: string; headers: Record<string, string>; data: unknown; time: number }
): TestResult[] {
  const results: TestResult[] = [];
  if (!script?.trim()) return results;

  const pmResponse: PmResponse = {
    code: response.status,
    status: response.statusText,
    headers: response.headers,
    json: () => response.data,
    text: () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
    time: response.time,
  };

  const pm = createTestPm(pmResponse, results);

  try {
    const fn = new Function('pm', `"use strict";\n${script}`);
    fn(pm);
  } catch (e) {
    results.push({
      name: 'Script error',
      passed: false,
      error: e instanceof Error ? e.message : String(e),
    });
  }
  return results;
}
