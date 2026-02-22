/**
 * OpenAPI / Swagger spec validation and linting
 */
export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export function validateOpenAPI(spec: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!spec || typeof spec !== 'object') {
    errors.push({ path: '$', message: 'Spec must be an object', severity: 'error' });
    return errors;
  }

  const o = spec as Record<string, unknown>;

  if ('openapi' in o) {
    const v = o.openapi;
    if (typeof v !== 'string') {
      errors.push({ path: 'openapi', message: 'openapi must be a string', severity: 'error' });
    } else if (!v.startsWith('3.')) {
      errors.push({ path: 'openapi', message: `Unsupported OpenAPI version: ${v}`, severity: 'warning' });
    }
  } else if ('swagger' in o) {
    const v = o.swagger;
    if (v !== '2.0') {
      errors.push({ path: 'swagger', message: `Unsupported Swagger version: ${v}`, severity: 'warning' });
    }
  } else {
    errors.push({ path: '$', message: 'Missing openapi or swagger version field', severity: 'error' });
  }

  if (!('info' in o) || typeof o.info !== 'object') {
    errors.push({ path: 'info', message: 'info object is required', severity: 'error' });
  } else {
    const info = o.info as Record<string, unknown>;
    if (!info.title) {
      errors.push({ path: 'info.title', message: 'info.title is recommended', severity: 'warning' });
    }
  }

  if (!('paths' in o)) {
    errors.push({ path: 'paths', message: 'paths object is required', severity: 'error' });
  } else if (typeof o.paths !== 'object' || o.paths === null) {
    errors.push({ path: 'paths', message: 'paths must be an object', severity: 'error' });
  } else {
    const paths = o.paths as Record<string, unknown>;
    const pathKeys = Object.keys(paths);
    if (pathKeys.length === 0) {
      errors.push({ path: 'paths', message: 'paths should contain at least one path', severity: 'warning' });
    }
    for (const path of pathKeys) {
      if (!path.startsWith('/')) {
        errors.push({ path: `paths.${path}`, message: 'Path must start with /', severity: 'error' });
      }
      const pathObj = paths[path];
      if (pathObj && typeof pathObj === 'object') {
        const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
        for (const m of Object.keys(pathObj as object)) {
          if (!methods.includes(m.toLowerCase())) {
            errors.push({ path: `paths.${path}.${m}`, message: `Unknown HTTP method: ${m}`, severity: 'warning' });
          }
        }
      }
    }
  }

  if ('servers' in o && Array.isArray(o.servers)) {
    for (let i = 0; i < o.servers.length; i++) {
      const s = o.servers[i];
      if (s && typeof s === 'object' && 'url' in s) {
        const url = (s as { url: unknown }).url;
        if (typeof url !== 'string' || !url.startsWith('http')) {
          errors.push({ path: `servers[${i}].url`, message: 'Server URL should be a valid HTTP(S) URL', severity: 'warning' });
        }
      }
    }
  }

  return errors;
}

export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.some((e) => e.severity === 'error');
}
