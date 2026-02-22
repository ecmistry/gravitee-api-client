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

---

## Phase 6 — WebSocket & SSE Support

### WebSocket Client

| Feature | Status |
|--------|--------|
| Connect to ws:// or wss:// URL | Done |
| Connection status indicator (connecting / connected / disconnected) | Done |
| Message composer with send button (text or JSON) | Done |
| Message log showing sent vs received with timestamps | Done |
| Custom headers tab (stored for reference; browser API does not support handshake headers) | Done |
| Save WebSocket connections to collections | Done |

### Server-Sent Events (SSE)

| Feature | Status |
|--------|--------|
| Connect to SSE endpoint | Done |
| Live streaming event log (event name, data, id) | Done |
| Reconnect on disconnect | Done |
| Filter events by type | Done |

### Socket.IO (Bonus)

| Feature | Status |
|--------|--------|
| Connect to Socket.IO server | Done |
| Emit events with JSON payload | Done |
| Listen to all events with filter | Done |

### Request Type Switching

| Feature | Status |
|--------|--------|
| HTTP / WebSocket / SSE / Socket.IO / GraphQL type selector | Done |
| Save WebSocket, SSE, Socket.IO, GraphQL configs to collections | Done |
| Collection Runner skips non-HTTP requests | Done |

### Tests (Phase 6)

- **Phase6.integration.test.tsx**: Request type selectors (HTTP, WebSocket, SSE, Socket.IO), WebSocket client UI, SSE client UI, Socket.IO client UI
- **WebSocketClient.test.tsx**: URL input, Connect button, Messages/Headers tabs, Send button
- **SSEClient.test.tsx**: URL input, Connect button, reconnect checkbox, event filter
- **SocketIOClient.test.tsx**: URL input, Connect button, Emit section, event filter

---

## Phase 7 — GraphQL Support

### GraphQL Request Type

| Feature | Status |
|--------|--------|
| Endpoint URL input | Done |
| Query editor with syntax highlighting and auto-formatting | Done (format; full syntax highlighting deferred) |
| Variables panel (JSON key/value pairs) | Done |
| Operation name support | Done |

### Schema Introspection

| Feature | Status |
|--------|--------|
| Auto-fetch schema on connect | Done |
| Schema explorer sidebar (types, fields, descriptions) | Done |
| Query autocompletion based on schema | Deferred |
| Documentation panel per type/field | Done |

### Response Viewer

| Feature | Status |
|--------|--------|
| Pretty-printed GraphQL response | Done |
| Error highlighting from the errors array | Done |

### Tests (Phase 7)

- **graphql.test.ts**: formatGraphQL, getExplorableTypes, introspectSchema, executeGraphQL
- **GraphQLClient.test.tsx**: URL input, Schema/Execute buttons, Query tab, Response tab, Schema sidebar
- **Phase7.integration.test.tsx**: GraphQL type selector, GraphQL client UI

---

## Phase 8 — Mock Servers

### Mock Server Creation

| Feature | Status |
|--------|--------|
| Create a mock server from a collection | Done |
| Assign example responses to each saved request | Done |
| Start/stop mock server on a local port | Done (`npm run mock`) |

### Route Matching

| Feature | Status |
|--------|--------|
| Match by method + path | Done |
| Path parameter support (e.g., /users/:id) | Done |
| Query parameter matching rules | Done |

### Response Configuration

| Feature | Status |
|--------|--------|
| Set status code, headers, body per route | Done |
| Multiple examples with selection (random, sequential, first, match by query param) | Done |
| Response delay simulation | Done |

### Tests (Phase 8)

- **mockServer.test.ts**: matchPath, matchQuery, selectExample, findMatchingRoute, getPathFromUrl, toPathPattern
- **MockServer.test.tsx**: Dialog, collection selector, Apply/Stop buttons

---

## Phase 9 — API Documentation Generator

### Documentation View

| Feature | Status |
|--------|--------|
| Auto-generate docs from collection + request descriptions + examples | Done |
| Sidebar navigation by folder/request | Done |
| Display: method badge, endpoint URL, description, parameters, headers, body schema | Done |
| Example request/response from history or body | Done |

### Markdown Support

| Feature | Status |
|--------|--------|
| Rich text descriptions on collections | Done |
| Rich text descriptions on folders | Done |
| Rich text descriptions on requests | Done (existing) |

### Export / Publish

| Feature | Status |
|--------|--------|
| Export as static HTML site | Done |
| Export as OpenAPI 3.0 JSON | Done |
| Export as OpenAPI 3.0 YAML | Done |
| Shareable link (host exported HTML on static host) | Note: Host on Vercel, Netlify, GitHub Pages, etc. |

### Tests (Phase 9)

- **apiDocs.test.ts**: collectionToOpenAPI, collectionToStaticHTML
- **ApiDocs.test.tsx**: Dialog, Export buttons, collection selector
- **Phase9.integration.test.tsx**: API Docs button, dialog open

---

## Phase 10 — Workspaces & Collaboration (Local-First Foundation)

### User Accounts (Placeholder)

| Feature | Status |
|--------|--------|
| Sign up / login (backend required) | Placeholder UI in Settings |
| User profile in Settings | Placeholder (Sign in when backend available) |
| API key management | Note: Future with backend |

### Workspaces

| Feature | Status |
|--------|--------|
| Personal workspace (default) | Done |
| Multiple workspaces (add, rename, remove) | Done |
| Workspace switcher in sidebar | Done |
| Team workspaces | Structure ready; sharing requires backend |

### Collaboration & Activity

| Feature | Status |
|--------|--------|
| Activity log (who changed what, when) | Done (local; actor "You") |
| Create/update/delete events for collections, folders, requests | Done |
| Role-based access (Viewer, Editor, Admin) | Types ready; enforcement requires backend |

### Sync & Conflict Resolution

| Feature | Status |
|--------|--------|
| Cloud sync | Requires backend |
| Conflict resolution | Types ready; sync engine deferred |

### Implementation Notes

- **Local-first**: All workspace data, collections, and activity stored in localStorage per workspace.
- **Migration**: Legacy `api-client-collections` migrated to `gravitee-collections-personal` on first load.
- **Settings sheet**: Workspaces tab (switch, add, rename, remove), Profile tab (placeholder), Activity tab (recent changes).

### Tests (Phase 10)

- **workspaces.test.ts**: getWorkspaces, setWorkspaces, active workspace, add/rename/remove, getActivity, logActivity
- **workspaceStorage.test.ts**: getCollections, setCollections per workspace, legacy migration, logCollectionActivity
- **Phase10.integration.test.tsx**: Workspace switcher in sidebar, Settings button opens sheet with Workspaces/Profile/Activity tabs

---

## Phase 11 — Monitoring & Scheduled Runs

### Monitors

| Feature | Status |
|--------|--------|
| Schedule collection to run every 5m/15m/1h/6h/1d | Done |
| Select environment per monitor | Done |
| Run collection or folder | Done |
| Alert thresholds: max response time, min status code, test failures | Done (structure) |
| Run now (manual trigger) | Done |

### Results Dashboard

| Feature | Status |
|--------|--------|
| Run history timeline with pass/fail per run | Done |
| Per-request breakdown per run | Done |
| Trend graph (response time over time) | Done |

### Alerting

| Feature | Status |
|--------|--------|
| Webhook notifications (POST to Slack, etc.) on failure | Done |
| Email notifications | Placeholder (requires backend) |

### Implementation Notes

- Monitors run only when the app tab is open; no background execution.
- Run history stored in localStorage (last 500 runs).
- Workspace-scoped monitors; run history is global.

### Tests (Phase 11)

- **monitors.test.ts**: getMonitors, setMonitors, add/update/remove, getRunHistory, addRunRecord, getIntervalMs
- **monitorScheduler.test.ts**: isMonitorDue, getNextRunTime, createScheduler (start/stop)
- **monitorAlerts.test.ts**: runMonitorAlert (webhook enabled/disabled, URL validation)
- **Phase11.integration.test.tsx**: Monitoring button in top bar, opens sheet with Monitors and Results tabs

---

## Phase 12 — OpenAPI / Swagger Import & Export

### Import

| Feature | Status |
|--------|--------|
| Import OpenAPI 3.0 YAML/JSON → collection with endpoints, params, example bodies | Done |
| Import Swagger 2.0 YAML/JSON → collection | Done |
| Import Postman Collection v2.1 (folders supported) | Done |
| Validate OpenAPI specs with linting and error reporting on import | Done |

### Export

| Feature | Status |
|--------|--------|
| Export to OpenAPI 3.0 JSON | Done |
| Export to OpenAPI 3.0 YAML | Done |
| Export to Postman v2.1 format | Done |
| Export dropdown in top bar | Done |

### Implementation Notes

- Import accepts .json, .yaml, .yml
- YAML parsed via `yaml` package
- OpenAPI/Swagger validation blocks import on critical errors

### Tests (Phase 12)

- **openApiImport.test.ts**: isOpenAPI3, isSwagger2, importFromOpenAPI3, importFromSwagger2
- **openApiValidation.test.ts**: validateOpenAPI, hasValidationErrors
- **importExport.test.ts**: detectFormat openapi/swagger, exportToOpenAPI, exportToPostman
- **Phase12.integration.test.tsx**: Import/Export buttons, Export dropdown format options
