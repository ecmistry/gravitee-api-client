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

### Additional

- CORS proxy for development (avoids browser CORS when testing APIs)
- Collections and requests: create, rename, delete, organize
- Import/export collections (native, Postman, Insomnia formats)
- Gravitee branding and orange theme
