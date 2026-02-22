/**
 * GraphQL utilities: introspection, execution, formatting
 */

const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        kind
        name
        description
        fields {
          name
          description
          type { name kind ofType { name kind } }
          args { name type { name kind } defaultValue }
        }
        inputFields {
          name
          description
          type { name kind }
        }
      }
    }
  }
`;

export interface IntrospectionField {
  name: string;
  description?: string;
  type: { name?: string; kind: string; ofType?: { name?: string; kind: string } };
  args?: Array<{ name: string; type: { name?: string; kind: string } }>;
}

export interface IntrospectionType {
  kind: string;
  name: string;
  description?: string;
  fields?: IntrospectionField[];
  inputFields?: IntrospectionField[];
}

export interface IntrospectionSchema {
  queryType?: { name: string };
  mutationType?: { name: string };
  subscriptionType?: { name: string };
  types: IntrospectionType[];
}

export interface GraphQLIntrospectionResult {
  data?: { __schema: IntrospectionSchema };
  errors?: Array<{ message: string; locations?: Array<{ line: number; column: number }> }>;
}

/** Fetch schema via introspection. Returns null on error. */
export async function introspectSchema(
  url: string,
  headers: Record<string, string> = {}
): Promise<IntrospectionSchema | null> {
  try {
    const res = import.meta.env.DEV
      ? await fetch('/api-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: INTROSPECTION_QUERY }),
          }),
        }).then(r => r.json())
      : await fetch(url, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: INTROSPECTION_QUERY }),
        }).then(r => r.json());

    const data = res?.data ?? res;
    const schema = data?.__schema;
    if (schema?.types) return schema;
    return null;
  } catch {
    return null;
  }
}

/** Execute a GraphQL query/mutation. */
export async function executeGraphQL(
  url: string,
  query: string,
  variables?: Record<string, unknown>,
  operationName?: string,
  headers: Record<string, string> = {}
): Promise<{ data: unknown; errors?: Array<{ message: string }>; status: number }> {
  const payload = { query, variables: variables ?? undefined, operationName: operationName || undefined };
  try {
    const res = import.meta.env.DEV
      ? await fetch('/api-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }),
        }).then(async (r) => {
          const text = await r.text();
          return new Response(text, { status: r.status, statusText: r.statusText, headers: r.headers });
        })
      : await fetch(url, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { errors: [{ message: 'Invalid JSON response' }] };
    }
    return {
      data: json,
      errors: (json as { errors?: Array<{ message: string }> })?.errors,
      status: res.status,
    };
  } catch (e) {
    return {
      data: { errors: [{ message: e instanceof Error ? e.message : String(e) }] },
      errors: [{ message: e instanceof Error ? e.message : String(e) }],
      status: 0,
    };
  }
}

/** Simple GraphQL query formatter - adds newlines and indentation. */
export function formatGraphQL(query: string): string {
  let out = '';
  let depth = 0;
  let i = 0;
  const len = query.length;
  const indent = () => '  '.repeat(depth);

  while (i < len) {
    const c = query[i];
    if (c === '{' || c === '(' || c === '[') {
      out += c;
      i++;
      depth++;
      out += '\n' + indent();
    } else if (c === '}' || c === ')' || c === ']') {
      depth = Math.max(0, depth - 1);
      out += '\n' + indent() + c;
      i++;
    } else if (c === ',') {
      out += c + '\n' + indent();
      i++;
    } else if (c === ' ' || c === '\n' || c === '\t') {
      if (out.length > 0 && out[out.length - 1] !== '\n' && out[out.length - 1] !== ' ') out += ' ';
      i++;
    } else {
      out += c;
      i++;
    }
  }
  return out.trim();
}

/** Filter out introspection types (__*) and scalars for schema explorer. */
export function getExplorableTypes(schema: IntrospectionSchema): IntrospectionType[] {
  return (schema.types ?? []).filter(
    t =>
      t.name &&
      !t.name.startsWith('__') &&
      ['OBJECT', 'INPUT_OBJECT', 'INTERFACE', 'UNION', 'ENUM'].includes(t.kind)
  );
}
