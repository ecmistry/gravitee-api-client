import { describe, it, expect } from 'vitest';
import { importFromOpenAPI3, importFromSwagger2, isOpenAPI3, isSwagger2 } from './openApiImport';

describe('openApiImport', () => {
  describe('isOpenAPI3 / isSwagger2', () => {
    it('detects OpenAPI 3', () => {
      expect(isOpenAPI3({ openapi: '3.0.0', info: {}, paths: {} })).toBe(true);
      expect(isOpenAPI3({ openapi: '3.1.0', info: {}, paths: {} })).toBe(true);
    });
    it('detects Swagger 2', () => {
      expect(isSwagger2({ swagger: '2.0', info: {}, paths: {} })).toBe(true);
    });
    it('rejects non-specs', () => {
      expect(isOpenAPI3({ swagger: '2.0' })).toBe(false);
      expect(isSwagger2({ openapi: '3.0.0' })).toBe(false);
    });
  });

  describe('importFromOpenAPI3', () => {
    it('imports OpenAPI 3 spec to collection', () => {
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Pet API', version: '1.0' },
        servers: [{ url: 'https://api.example.com' }],
        paths: {
          '/pets': {
            get: { summary: 'List pets', operationId: 'listPets' },
            post: { summary: 'Create pet', requestBody: { content: { 'application/json': { example: { name: 'Fluffy' } } } } },
          },
          '/pets/{id}': {
            get: { summary: 'Get pet' },
          },
        },
      };
      const result = importFromOpenAPI3(spec);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Pet API');
      expect(result[0].requests).toHaveLength(3);
      const getPets = result[0].requests.find((r) => r.name === 'List pets');
      expect(getPets?.method).toBe('GET');
      expect(getPets?.url).toBe('https://api.example.com/pets');
    });
  });

  describe('importFromSwagger2', () => {
    it('imports Swagger 2 spec to collection', () => {
      const spec = {
        swagger: '2.0',
        info: { title: 'Store API' },
        host: 'api.example.com',
        basePath: '/v1',
        schemes: ['https'],
        paths: {
          '/orders': {
            get: { summary: 'List orders' },
          },
        },
      };
      const result = importFromSwagger2(spec);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Store API');
      expect(result[0].requests).toHaveLength(1);
      expect(result[0].requests[0].url).toBe('https://api.example.com/v1/orders');
      expect(result[0].requests[0].method).toBe('GET');
    });
  });
});
