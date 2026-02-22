/**
 * Mock server route matching and response selection logic.
 * Used by both the UI (to validate) and the Node mock server script.
 */
import type { MockRoute, MockExample } from '@/types/mock';

/** Convert path pattern /users/:id to regex, capture param names */
function pathToRegex(pattern: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];
  const escaped = pattern.replace(/:[^/]+/g, (m) => {
    paramNames.push(m.slice(1));
    return '([^/]+)';
  });
  const regex = new RegExp(`^${escaped}$`);
  return { regex, paramNames };
}

/** Check if path matches pattern; returns params or null */
export function matchPath(pattern: string, pathname: string): Record<string, string> | null {
  const { regex, paramNames } = pathToRegex(pattern);
  const m = pathname.match(regex);
  if (!m) return null;
  const params: Record<string, string> = {};
  paramNames.forEach((name, i) => {
    params[name] = m[i + 1] ?? '';
  });
  return params;
}

/** Check if query string matches rules (all rules must match) */
export function matchQuery(rules: Record<string, string> | undefined, searchParams: URLSearchParams): boolean {
  if (!rules || Object.keys(rules).length === 0) return true;
  for (const [key, expected] of Object.entries(rules)) {
    const actual = searchParams.get(key);
    if (actual !== expected) return false;
  }
  return true;
}

/** Pick example based on selection mode */
export function selectExample(
  route: MockRoute,
  pathParams: Record<string, string>,
  searchParams: URLSearchParams,
  sequentialIndex: Map<string, number>
): MockExample | undefined {
  const examples = route.examples ?? [];
  if (examples.length === 0) return undefined;

  switch (route.exampleSelection) {
    case 'first':
      return examples[0];
    case 'random':
      return examples[Math.floor(Math.random() * examples.length)]!;
    case 'sequential': {
      const key = route.id;
      const idx = (sequentialIndex.get(key) ?? 0) % examples.length;
      sequentialIndex.set(key, idx + 1);
      return examples[idx];
    }
    case 'query': {
      const paramKey = route.queryParamName ?? Object.keys(route.queryMatch ?? {})[0];
      const requested = paramKey ? searchParams.get(paramKey) : undefined;
      const match = examples.find((e) => (e.queryParam ?? '') === (requested ?? ''));
      return match ?? examples[0];
    }
    default:
      return examples[0];
  }
}

/** Find matching route for method + path + query */
export function findMatchingRoute(
  routes: MockRoute[],
  method: string,
  pathname: string,
  search: string,
  sequentialIndex: Map<string, number>
): { route: MockRoute; example: MockExample; pathParams: Record<string, string> } | null {
  const searchParams = new URLSearchParams(search);
  for (const route of routes) {
    if (route.method.toUpperCase() !== method.toUpperCase()) continue;
    const pathParams = matchPath(route.path, pathname);
    if (!pathParams) continue;
    if (!matchQuery(route.queryMatch, searchParams)) continue;
    const example = selectExample(route, pathParams, searchParams, sequentialIndex);
    if (!example) continue;
    return { route, example, pathParams };
  }
  return null;
}

/** Extract path from full URL (no host, no hash) */
export function getPathFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname;
  } catch {
    const path = url.split('?')[0] ?? '/';
    return path.startsWith('/') ? path : '/';
  }
}

/** Convert /users/123 to /users/:id style (simple heuristic: replace numeric segments) */
export function toPathPattern(path: string): string {
  return path.replace(/\/\d+/g, '/:id').replace(/\/[a-f0-9-]{36}/gi, '/:id');
}
