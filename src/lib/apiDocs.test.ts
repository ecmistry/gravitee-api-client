import { describe, it, expect } from 'vitest';
import { collectionToOpenAPI, collectionToStaticHTML } from './apiDocs';
import type { Collection } from '@/types/api';

const mockCollection: Collection = {
  id: 'col-1',
  name: 'Test API',
  description: '# Overview\nTest collection',
  folders: [
    {
      id: 'f1',
      name: 'Users',
      requests: [
        {
          id: 'req-1',
          name: 'Get User',
          method: 'GET',
          url: 'https://api.example.com/users/:id',
          params: [{ key: 'fields', value: 'name,email', enabled: true }],
          headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
          body: '',
          bodyType: 'none',
          formData: [],
        },
      ],
    },
  ],
  requests: [
    {
      id: 'req-2',
      name: 'List Users',
      method: 'GET',
      url: 'https://api.example.com/users',
      params: [],
      headers: [],
      body: '',
      bodyType: 'none',
      formData: [],
    },
  ],
};

describe('apiDocs', () => {
  describe('collectionToOpenAPI', () => {
    it('produces valid OpenAPI 3.0 JSON', () => {
      const json = collectionToOpenAPI(mockCollection, 'json');
      const spec = JSON.parse(json);
      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info.title).toBe('Test API');
      expect(spec.paths).toBeDefined();
      expect(Object.keys(spec.paths).length).toBeGreaterThan(0);
    });

    it('includes paths for all HTTP requests', () => {
      const json = collectionToOpenAPI(mockCollection, 'json');
      const spec = JSON.parse(json);
      expect(spec.paths['/users']).toBeDefined();
      expect(spec.paths['/users']['get']).toBeDefined();
      expect(spec.paths['/users/:id']).toBeDefined();
      expect(spec.paths['/users/:id']['get']).toBeDefined();
    });

    it('produces YAML when format is yaml', () => {
      const yaml = collectionToOpenAPI(mockCollection, 'yaml');
      expect(yaml).toContain('openapi:');
      expect(yaml).toContain('3.0.0');
      expect(yaml).toContain('paths:');
    });
  });

  describe('collectionToStaticHTML', () => {
    it('produces valid HTML with collection name', () => {
      const html = collectionToStaticHTML(mockCollection);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<title>Test API');
      expect(html).toContain('Test API');
    });

    it('includes endpoint sections', () => {
      const html = collectionToStaticHTML(mockCollection);
      expect(html).toContain('Get User');
      expect(html).toContain('List Users');
      expect(html).toContain('GET');
    });

    it('includes sidebar navigation', () => {
      const html = collectionToStaticHTML(mockCollection);
      expect(html).toContain('class="sidebar"');
      expect(html).toContain('nav-item');
    });
  });
});
