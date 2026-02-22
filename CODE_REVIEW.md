# Gravitee API Test Client — Code Review

## Overview

Postman/Insomnia-style API test client built with React 19, Vite 6, Tailwind CSS 4, and shadcn/ui.

---

## Running Locally

```bash
pnpm install
pnpm dev
```

App runs at **http://localhost:3000/**.

---

## Architecture

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | React 19 | Latest |
| Build | Vite 6 | Client root: `client/` |
| Styling | Tailwind CSS 4 + shadcn/ui (New York, neutral) | CSS variables enabled |
| Icons | lucide-react | |
| Toasts | sonner | |
| Data | localStorage | `api-client-collections` |

---

## Strengths

- Clear separation: Sidebar, RequestBuilder, ResponseViewer
- Postman/Insomnia import/export support
- Request history persisted (max 50 entries)
- HTTP method color coding (GET/POST/PUT/DELETE/PATCH)
- Collections with folders and requests
- Params, headers, and body tabs in RequestBuilder

---

## Issues & Recommendations

### 1. Branding Mismatch
- App is branded **Newton**; project is for **Gravitee**
- **Recommendation:** Rebrand to Gravitee (title, logo, copy)

### 2. Analytics Script
- `index.html` referenced `%VITE_ANALYTICS_ENDPOINT%` and `%VITE_ANALYTICS_WEBSITE_ID%` without `.env` values
- Caused malformed URI errors and Vite warnings
- **Fixed:** Analytics script removed for local development

### 3. Unused Dependencies & Code
- `wouter` imported but not used (no `Route`/`Switch` in app)
- Marketing pages (`Home`, `GettingStarted`, `Demo`, etc.) exist but are not routed
- **Recommendation:** Remove dead code or wire up routing

### 4. URL Handling in RequestBuilder
- `new URL(request.url)` fails for relative URLs (e.g. `/api/test`)
- **Recommendation:** Optionally prepend a configurable base URL or validate before sending

### 5. Body Type Not Applied
- `bodyType` (`none` | `json` | `form` | `raw`) is stored but not used when building the request
- JSON body should set `Content-Type: application/json` when `bodyType === 'json'`
- **Recommendation:** Apply body type and set headers accordingly

### 6. ThemeContext Unused
- `ThemeContext` for light/dark exists but `ThemeProvider` is not in `App`
- shadcn CSS variables support dark mode, but theme toggle is inactive
- **Recommendation:** Wrap app in `ThemeProvider` and add a theme toggle

### 7. Typography
- Google Fonts (Inter, Space Grotesk) loaded but `body` uses system fonts
- **Recommendation:** Use the loaded fonts for a more polished look

### 8. Duplicated Logic
- `getMethodColor()` duplicated in Sidebar and RequestBuilder
- **Recommendation:** Move to `lib/utils.ts` or a shared constant

### 9. Error Handling
- Request errors show a generic message; network failures could be clearer
- **Recommendation:** Handle CORS, timeouts, and network errors separately

### 10. RequestBuilder Params Bug
- `url.searchParams.append(param.key, param.value)` mutates and can duplicate params when `handleSend` runs multiple times (e.g. React Strict Mode)
- **Recommendation:** Build a fresh URL per request or clone `URL` before mutating

---

## UI/UX Observations

- Flat gray palette (`bg-gray-50`, `border-gray-200`) lacks depth
- Fonts not used; appearance is generic
- Gravitee’s teal (#007C7C) would give a stronger identity
- Good structure and tab layout; needs visual polish

---

## File Structure

```
client/src/
├── App.tsx              # Root, collections state, layout
├── components/
│   ├── RequestBuilder   # Method, URL, params, headers, body, Send
│   ├── ResponseViewer   # Status, timing, body/headers tabs
│   ├── Sidebar          # Collections, search, add request
│   ├── TopBar           # Branding, Import/Export, Settings
│   └── ui/              # shadcn primitives
├── lib/
│   ├── importExport.ts  # Postman/Insomnia import/export
│   ├── history.ts       # Request history
│   └── utils.ts         # cn()
└── contexts/ThemeContext.tsx  # Unused
```
