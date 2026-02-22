/** Built-in dynamic variables: {{$randomUUID}}, {{$timestamp}}, etc. */

export const DYNAMIC_VAR_PATTERN = /\{\{\$(\w+)(?::(\d+))?\}\}/g;

export interface DynamicVarResolvers {
  [key: string]: () => string;
}

const uuid = () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  const v = c === 'x' ? r : (r & 0x3) | 0x8;
  return v.toString(16);
});

/** Default resolvers for {{$varName}} or {{$varName:param}} */
export const defaultDynamicResolvers: DynamicVarResolvers = {
  randomUUID: () => uuid(),
  guid: () => uuid(),
  timestamp: () => String(Date.now()),
  randomInt: () => String(Math.floor(Math.random() * 1001)),
  randomEmail: () => {
    const part = () => Math.random().toString(36).slice(2, 10);
    return `${part()}@${part()}.com`;
  },
  randomBoolean: () => String(Math.random() > 0.5),
  randomString: () => Math.random().toString(36).slice(2, 12),
};

/** Resolve {{$varName}} or {{$varName:param}} in text. Param can be length for randomString, max for randomInt */
export function resolveDynamicVariables(
  text: string,
  resolvers: DynamicVarResolvers = defaultDynamicResolvers
): string {
  return text.replace(DYNAMIC_VAR_PATTERN, (_, name, param) => {
    const fn = resolvers[name];
    if (!fn) return `{{$${name}}}`;
    try {
      const p = param ? parseInt(param, 10) : undefined;
      if (name === 'randomInt' && p !== undefined) return String(Math.floor(Math.random() * (p + 1)));
      if (name === 'randomString' && p !== undefined) return Math.random().toString(36).slice(2, 2 + Math.min(p, 32));
      return String(fn());
    } catch {
      return `{{$${name}}}`;
    }
  });
}
