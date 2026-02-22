import { describe, it, expect } from 'vitest';
import {
  runPreRequestScript,
  runTestScript,
  createPreRequestPm,
  createTestPm,
  type ScriptVars,
  type TestResult,
} from './scripting';

describe('scripting', () => {
  describe('runPreRequestScript', () => {
    it('returns empty when script is empty or whitespace', () => {
      const sv: ScriptVars = { environment: new Map(), globals: new Map() };
      runPreRequestScript('', sv);
      expect(sv.environment.size).toBe(0);
      expect(sv.globals.size).toBe(0);

      runPreRequestScript('   \n  ', sv);
      expect(sv.environment.size).toBe(0);
    });

    it('sets environment variables via pm.environment.set', () => {
      const sv: ScriptVars = { environment: new Map(), globals: new Map() };
      runPreRequestScript('pm.environment.set("token", "secret123");', sv);
      expect(sv.environment.get('token')).toBe('secret123');
    });

    it('sets global variables via pm.globals.set', () => {
      const sv: ScriptVars = { environment: new Map(), globals: new Map() };
      runPreRequestScript('pm.globals.set("apiUrl", "https://api.example.com");', sv);
      expect(sv.globals.get('apiUrl')).toBe('https://api.example.com');
    });

    it('pm.environment.get returns set value', () => {
      const sv: ScriptVars = { environment: new Map(), globals: new Map() };
      runPreRequestScript('pm.environment.set("x", "y"); if (pm.environment.get("x") !== "y") throw new Error("get failed");', sv);
      expect(sv.environment.get('x')).toBe('y');
    });

    it('pm.environment.unset removes variable', () => {
      const sv: ScriptVars = { environment: new Map(), globals: new Map() };
      runPreRequestScript('pm.environment.set("temp", "val"); pm.environment.unset("temp");', sv);
      expect(sv.environment.has('temp')).toBe(false);
    });

    it('can generate timestamp', () => {
      const sv: ScriptVars = { environment: new Map(), globals: new Map() };
      runPreRequestScript('pm.environment.set("ts", Date.now().toString());', sv);
      const ts = sv.environment.get('ts');
      expect(ts).toBeDefined();
      expect(parseInt(ts!, 10)).toBeGreaterThan(0);
    });

    it('throws when script has syntax error', () => {
      const sv: ScriptVars = { environment: new Map(), globals: new Map() };
      expect(() => runPreRequestScript('pm.environment.set("x"', sv)).toThrow();
    });

    it('throws when script throws at runtime', () => {
      const sv: ScriptVars = { environment: new Map(), globals: new Map() };
      expect(() => runPreRequestScript('throw new Error("oops");', sv)).toThrow('oops');
    });
  });

  describe('runTestScript', () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      data: { id: 1, name: 'Test' },
      time: 150,
    };

    it('returns empty when script is empty', () => {
      const results = runTestScript('', mockResponse);
      expect(results).toEqual([]);
    });

    it('returns empty when script is whitespace', () => {
      const results = runTestScript('   \n  ', mockResponse);
      expect(results).toEqual([]);
    });

    it('passes test when assertion succeeds', () => {
      const results = runTestScript(
        'pm.test("Status is 200", function() { pm.expect(pm.response.code).to.equal(200); });',
        mockResponse
      );
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({ name: 'Status is 200', passed: true });
    });

    it('fails test when assertion fails', () => {
      const results = runTestScript(
        'pm.test("Status is 404", function() { pm.expect(pm.response.code).to.equal(404); });',
        mockResponse
      );
      expect(results).toHaveLength(1);
      expect(results[0].passed).toBe(false);
      expect(results[0].name).toBe('Status is 404');
      expect(results[0].error).toContain('Expected');
    });

    it('pm.response.json returns response data', () => {
      const results = runTestScript(
        'pm.test("Has id", function() { pm.expect(pm.response.json()).to.have.property("id"); });',
        mockResponse
      );
      expect(results[0].passed).toBe(true);
    });

    it('pm.response.text returns stringified body', () => {
      const results = runTestScript(
        'pm.test("Text includes id", function() { pm.expect(pm.response.text()).to.include("id"); });',
        mockResponse
      );
      expect(results[0].passed).toBe(true);
    });

    it('pm.expect().to.a() works for type checks', () => {
      const results = runTestScript(
        'pm.test("Response is object", function() { pm.expect(pm.response.json()).to.a("object"); });',
        mockResponse
      );
      expect(results[0].passed).toBe(true);
    });

    it('pm.expect().to.eql() checks deep equality', () => {
      const results = runTestScript(
        'pm.test("Body matches", function() { pm.expect(pm.response.json()).to.eql({ id: 1, name: "Test" }); });',
        mockResponse
      );
      expect(results[0].passed).toBe(true);
    });

    it('pm.expect().above() and below() work', () => {
      const results = runTestScript(
        `pm.test("Time above 100", function() { pm.expect(pm.response.time).to.above(100); });
         pm.test("Time below 200", function() { pm.expect(pm.response.time).to.below(200); });`,
        mockResponse
      );
      expect(results).toHaveLength(2);
      expect(results.every(r => r.passed)).toBe(true);
    });

    it('adds Script error when script throws', () => {
      const results = runTestScript('throw new Error("crash");', mockResponse);
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({ name: 'Script error', passed: false, error: 'crash' });
    });

    it('collects multiple test results', () => {
      const results = runTestScript(
        `pm.test("One", function() { pm.expect(1).to.equal(1); });
         pm.test("Two", function() { pm.expect(2).to.equal(2); });
         pm.test("Three fails", function() { pm.expect(1).to.equal(2); });`,
        mockResponse
      );
      expect(results).toHaveLength(3);
      expect(results[0].passed).toBe(true);
      expect(results[1].passed).toBe(true);
      expect(results[2].passed).toBe(false);
    });
  });

  describe('createPreRequestPm', () => {
    it('creates pm with environment and globals', () => {
      const sv: ScriptVars = { environment: new Map(), globals: new Map() };
      const pm = createPreRequestPm(sv);
      expect(pm.environment).toBeDefined();
      expect(pm.globals).toBeDefined();
      pm.environment.set('a', '1');
      pm.globals.set('b', '2');
      expect(sv.environment.get('a')).toBe('1');
      expect(sv.globals.get('b')).toBe('2');
    });
  });

  describe('createTestPm', () => {
    it('creates pm with test, expect, response', () => {
      const results: TestResult[] = [];
      const pmResponse = { code: 200, status: 'OK', headers: {} as Record<string, string>, json: () => ({}), text: () => '{}', time: 0 };
      const pm = createTestPm(pmResponse, results);
      pm.test('My test', () => {});
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('My test');
      expect(results[0].passed).toBe(true);
      expect(pm.expect).toBeDefined();
      expect(pm.response.code).toBe(200);
    });
  });
});
