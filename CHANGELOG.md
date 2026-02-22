# Changelog

## Phase 1 — Core HTTP Client (MVP)

### Request Builder

| Feature | Status |
|--------|--------|
| HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS | Done |
| URL bar with parameter builder (key/value that auto-append to URL) | Done |
| Request Headers tab (add/edit/toggle/delete headers) | Done |
| Request Body tab with modes | Done |
| Raw modes: JSON, XML, Text, HTML | Done |
| Form-data (key/value pairs) | Done |
| x-www-form-urlencoded | Done |
| Pretty-print JSON body editor | Done (monospace textarea) |
| Syntax highlighting for body | Deferred (basic monospace; full highlighting in future) |

### Response Viewer

| Feature | Status |
|--------|--------|
| Status code, response time, response size displayed prominently | Done |
| Body tab with Pretty/Raw/Preview toggle | Done |
| Pretty: formatted JSON with 2-space indent | Done |
| Raw: minified JSON / raw string | Done |
| Preview: HTML rendered in sandboxed iframe | Done |
| Syntax highlighted JSON/XML response | Done (pretty-print; full highlight deferred) |
| Response headers tab | Done |
| Copy response to clipboard | Done |

### Tabs Interface

| Feature | Status |
|--------|--------|
| Open multiple requests in tabs simultaneously | Done |
| Unsaved changes indicator (dot on tab) | Done |
| Rename tabs (double-click) | Done |
| Close tab (X on hover) | Done |

### Basic History

| Feature | Status |
|--------|--------|
| Auto-log every request sent with timestamp, method, URL | Done |
| Click to re-open from history | Done |
| Clear history option | Done |

### Tests (Phase 1)

- **history.test.ts**: Save/get/clear history
- **importExport.test.ts**: Detect format, export, import Postman/Insomnia
- **Phase1.integration.test.tsx**: Index page header, Request Builder, Params/Headers/Body tabs, sidebar, history

### Additional

- CORS proxy for development (avoids browser CORS when testing APIs)
- Collections and requests: create, rename, delete, organize
- Import/export collections (native, Postman, Insomnia formats)
- Gravitee branding and orange theme

---

## Phase 2 — Collections & Environment Variables

### Collections

| Feature | Status |
|--------|--------|
| Create/rename/delete collections | Done |
| Create folders inside collections | Done |
| Save requests with name and description | Done |
| Drag-and-drop reordering (collections) | Done |
| Duplicate requests/folders | Done |
| Import/export collections as JSON | Done |

### Environment Variables

| Feature | Status |
|--------|--------|
| Named environments (Dev, Staging, Production) | Done |
| Key/value variables per environment | Done |
| Switch active environment via dropdown | Done |
| Reference variables with `{{variableName}}` in URL, headers, body | Done |
| Variable hint when `{{var}}` present in URL or body | Done |
| Global variables (shared across environments) | Done |
| Pre-request variable resolution | Done |

### Tests (Phase 2)

- **variables.test.ts**: Environment CRUD, global vars, `resolveVariables`, `resolveRequestVariables` (URL, headers, body, params, formData)
- **collections.test.ts**: `getAllRequests`, `getAllRequestsFromCollections`, `findRequestLocation` (root and folder requests)
- **Phase2.integration.test.tsx**: Environment selector, description field, URL variable placeholder, Add folder/request in collections

---

## Phase 3 — Authentication Support

### Auth Types

| Feature | Status |
|--------|--------|
| No Auth | Done |
| API Key (header or query param) | Done |
| Bearer Token | Done |
| Basic Auth (username + password → Base64) | Done |
| OAuth 2.0 (Authorization Code, Client Credentials, Password flows) | Done (config + manual token paste) |
| Digest Auth | Done (config; full challenge-response deferred) |
| AWS Signature v4 | Done (config; full signing deferred) |
| JWT Bearer (paste token, auto-decode claims) | Done |

### Inherit from Parent

| Feature | Status |
|--------|--------|
| Collection-level auth (right-click → Set auth) | Done |
| Folder-level auth (right-click → Set auth) | Done |
| Request inherits from folder or collection | Done |
| Auth tab with "Inherit from Parent" option | Done |

### Tests (Phase 3)

- **auth.test.ts**: `applyAuth` for all auth types (API Key, Bearer, Basic, OAuth2, JWT, Digest, AWS), `decodeJwtPayload` for JWT
- **collections.test.ts**: `getEffectiveAuth` — inherit from folder/collection, request auth when not inheriting
- **Phase3.integration.test.tsx**: Auth tab in Request Builder

---

## Phase 4 — Scripting & Testing

### Pre-request Scripts

| Feature | Status |
|--------|--------|
| JavaScript sandbox run before each request | Done |
| pm.environment.set() / pm.globals.set() for variables | Done |
| Script vars merged into variable resolution ({{varName}}) | Done |
| Generate dynamic values (timestamps, UUIDs, signatures) | Done |
| Pre-request script errors block the request and show error | Done |

### Test Scripts (Post-response)

| Feature | Status |
|--------|--------|
| JavaScript sandbox after response received | Done |
| pm.test("name", fn) assertion syntax | Done |
| pm.expect() chainable assertions (status, body, headers, response time) | Done |
| pm.response.json(), pm.response.text(), pm.response.code | Done |
| Test results panel with pass/fail per assertion | Done |
| Failure messages shown for failed assertions | Done |

### Built-in Dynamic Variables

| Feature | Status |
|--------|--------|
| {{$randomUUID}}, {{$guid}} | Done |
| {{$timestamp}} | Done |
| {{$randomEmail}}, {{$randomInt}}, {{$randomBoolean}}, {{$randomString}} | Done |
| {{$randomInt:100}}, {{$randomString:20}} (param support) | Done |

### Tests (Phase 4)

- **dynamicVars.test.ts**: `resolveDynamicVariables` for $randomUUID, $guid, $timestamp, $randomInt, $randomEmail, $randomBoolean, $randomString, custom resolvers, unknown vars
- **scripting.test.ts**: `runPreRequestScript` (pm.environment.set/get/unset, pm.globals.set), `runTestScript` (pm.test, pm.expect, pm.response.json/text), createPreRequestPm, createTestPm
- **variables.test.ts**: `resolveRequestVariables` and `resolveVariables` with scriptVars from pre-request
- **ResponseViewer.test.tsx**: Tests tab, empty state, pass/fail test results display
- **Phase4.integration.test.tsx**: Pre-request tab, Tests tab in Request Builder

---

## Phase 5 — Collection Runner

### Runner Configuration

| Feature | Status |
|--------|--------|
| Select collection or folder to run | Done |
| Choose environment | Done |
| Set iteration count | Done |
| Set delay between requests (ms) | Done |
| Upload CSV/JSON data file for data-driven testing | Done |

### Run Execution

| Feature | Status |
|--------|--------|
| Sequential execution with progress indicator | Done |
| Display pass/fail per test per request in real time | Done |
| Stop run mid-execution | Done |

### Run Results

| Feature | Status |
|--------|--------|
| Summary: total requests, passed/failed tests, total time | Done |
| Per-request breakdown with expandable test results | Done |
| Export results as JSON report | Done |
| Export results as HTML report | Done |

### Tests (Phase 5)

- **executeRequest.test.ts**: Variable resolution, pre-request scripts, test scripts, iteration vars, invalid URL, pre-request errors
- **collectionRunner.test.ts**: `parseCSV`, `parseJSONData`, `parseDataFile`, `exportRunResultJSON`, `exportRunResultHTML`
- **Phase5.integration.test.tsx**: Run Collection button, Collection Runner dialog
- **CollectionRunner.test.tsx**: Dialog configuration, Run button, closed state
