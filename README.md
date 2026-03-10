# Gravitee API Client

An API test client for Gravitee.io. Send requests, organize collections, and explore your APIs.

## Installation

**Prerequisites:** Node.js 18+ and npm, pnpm, or yarn.

```sh
# With pnpm (recommended)
pnpm install

# With npm
npm install

# With yarn
yarn install
```

## Getting Started

```sh
pnpm run dev   # or: npm run dev / yarn dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Build

```sh
pnpm run build
pnpm run preview   # or: npm run preview / yarn preview
```

## Docker (Mac / Linux)

Run the app in Docker for easy installation on Mac or Linux.

**Build and run with Docker:**
```sh
docker build -t gravitee-api-client .
docker run -p 3000:3000 gravitee-api-client
```

**Or with Docker Compose:**
```sh
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). The Docker image includes a CORS proxy so you can test any API from the browser.

## MCP, LLM, and AI testing

The client supports testing **MCP** (Model Context Protocol) servers, **LLM** chat completions, and **AI** (embeddings, image generation) from the same UI.

- **MCP**: Switch request type to **MCP**. Use **stdio (via bridge)** and set the server command (e.g. `npx`) and args as JSON (e.g. `["-y", "@modelcontextprotocol/server-filesystem"]`). List tools, then select a tool and run it with JSON arguments. The bridge runs in Node (dev server or production `serve`).
- **LLM**: Switch to **LLM**. Choose OpenAI or Anthropic, model, system/user message, and optional temperature/max tokens/stream. Set **OPENAI_API_KEY** or **ANTHROPIC_API_KEY** in Environment or Global variables (see Settings → API Keys).
- **AI**: Switch to **AI**. Use **Embeddings** (OpenAI, e.g. `text-embedding-3-small`) or **Image** (DALL·E). Set **OPENAI_API_KEY** in Environment or Global variables.

API keys are only sent to the provider; they are not logged. Configure them via the environment selector and global variables in the top bar, or see Settings → API Keys.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router

## Repository

[https://github.com/gravitee-io-labs/gravitee-api-client](https://github.com/gravitee-io-labs/gravitee-api-client)
