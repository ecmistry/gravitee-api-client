# Gravitee API Client – Functional Overview

## Where It Lives

**Repository:** [https://github.com/gravitee-io-labs/gravitee-api-client](https://github.com/gravitee-io-labs/gravitee-api-client)

---

## Functional Areas

### 1. Core HTTP Client (MVP)
- **Request Builder:** HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS), URL params, headers, body (JSON, XML, text, HTML, form-data, x-www-form-urlencoded)
- **Response Viewer:** Status code, timing, size, Pretty/Raw/Preview, response headers, copy to clipboard
- **Tabs:** Multiple requests in tabs, unsaved indicator, rename, close
- **History:** Auto-log every request sent; click to re-open, clear history
- **CORS proxy:** Server-side proxy to avoid browser CORS when testing APIs

### 2. Collections & Environments
- **Collections:** Create/rename/delete collections, folders, save requests, drag-and-drop reorder, duplicate requests/folders
- **Environment variables:** Dev/Staging/Production, key/value per env, `{{variableName}}` in URL/headers/body, global variables
- **Import/Export:** Native JSON, Postman, Insomnia

### 3. Authentication
- **Auth types:** No Auth, API Key, Bearer, Basic, OAuth 2.0, Digest, AWS Sig v4, JWT Bearer (with claims decode)
- **Inheritance:** Collection/folder auth; requests can inherit from parent

### 4. Scripting & Testing
- **Pre-request scripts:** JavaScript sandbox, `pm.environment.set()`, `pm.globals.set()`, dynamic values
- **Test scripts:** `pm.test()`, `pm.expect()`, assertions on status, body, headers, timing
- **Dynamic variables:** `{{$randomUUID}}`, `{{$guid}}`, `{{$timestamp}}`, `{{$randomEmail}}`, `{{$randomInt}}`, etc.

### 5. Collection Runner
- **Config:** Select collection/folder, environment, iterations, delay, CSV/JSON data file
- **Execution:** Sequential run with progress, real-time pass/fail, stop mid-run
- **Reports:** Export results as JSON or HTML

### 6. Real-Time / Streaming Clients
- **WebSocket:** Connect to ws:// or wss://, status indicator, send/receive log
- **SSE:** Connect to SSE endpoint, streaming event log, reconnect, filter by type
- **Socket.IO:** Connect, emit events, listen with filter
- **Request types:** Switch between HTTP, WebSocket, SSE, Socket.IO, GraphQL

### 7. GraphQL
- **Client:** Endpoint, query editor (formatting), variables, operation name
- **Schema:** Introspection, explorer sidebar, type/field docs
- **Response:** Pretty-printed response, error highlighting

### 8. Mock Servers
- **Mock from collections:** Create mock server from collection, assign example responses per request
- **Routing:** Match by method + path, path params (`/users/:id`), query params
- **Response config:** Status, headers, body, multiple examples (random/sequential/first/match by query), delay
- **Control:** Start/stop via `npm run mock`

### 9. API Documentation
- **Docs:** Auto-generate from collection + descriptions + examples
- **Export:** Static HTML, OpenAPI 3.0 JSON/YAML
- **Markdown:** Rich descriptions on collections, folders, requests

### 10. Workspaces
- **Workspaces:** Personal default, multiple workspaces, switcher
- **Activity:** Local activity log (create/update/delete)
- **Data:** Local-first, stored in localStorage per workspace

### 11. Monitoring
- **Schedules:** Run collections every 5m/15m/1h/6h/1d
- **Dashboard:** Run history, pass/fail, per-request breakdown, response time trends
- **Alerts:** Webhook (Slack, etc.) on failure
- **Note:** Monitors run only when the app tab is open

### 12. OpenAPI / Swagger Import & Export
- **Import:** OpenAPI 3.0, Swagger 2.0, Postman v2.1 (with folders), validation
- **Export:** OpenAPI 3.0 JSON/YAML, Postman v2.1

### 13. Deployment & UX
- **Docker:** Multi-stage Dockerfile, docker-compose, CORS proxy in image
- **Save:** Fix for default/untitled tab save; toast feedback
- **Drag-and-drop:** Move requests between folders and across collections
- **Install:** Node 18+, pnpm/npm/yarn options in README

---

## Tech Stack

React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · React Router · @dnd-kit
