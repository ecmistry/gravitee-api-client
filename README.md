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

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
