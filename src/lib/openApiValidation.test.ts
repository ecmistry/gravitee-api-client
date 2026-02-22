import { describe, it, expect } from 'vitest';
import { validateOpenAPI, hasValidationErrors } from './openApiValidation';

describe('openApiValidation', () => {
  it('returns errors for null/undefined', () => {
    const r1 = validateOpenAPI(null);
    expect(r1).toHaveLength(1);
    expect(r1[0].message).toContain('object');

    const r2 = validateOpenAPI(undefined);
    expect(r2).toHaveLength(1);
  });

  it('validates OpenAPI 3 structure', () => {
    const valid = { openapi: '3.0.0', info: { title: 'API' }, paths: { '/': { get: {} } } };
    const errors = validateOpenAPI(valid);
    expect(hasValidationErrors(errors)).toBe(false);
  });

  it('reports missing paths', () => {
    const spec = { openapi: '3.0.0', info: {} };
    const errors = validateOpenAPI(spec);
    expect(errors.some((e) => e.path === 'paths')).toBe(true);
    expect(hasValidationErrors(errors)).toBe(true);
  });

  it('reports invalid path format', () => {
    const spec = { openapi: '3.0.0', info: {}, paths: { invalid: {} } };
    const errors = validateOpenAPI(spec);
    expect(errors.some((e) => e.message.includes('start with /'))).toBe(true);
  });
});
