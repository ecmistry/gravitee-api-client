# Gravitee API Client - Docker image for Mac/Linux
# Build: docker build -t gravitee-api-client .
# Run:  docker run -p 3000:3000 gravitee-api-client

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile || npm install

# Copy source
COPY . .

# Build with CORS proxy enabled (for API testing from browser)
ENV VITE_USE_CORS_PROXY=true
RUN pnpm run build || npm run build

# Stage 2: Run
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built assets, server scripts (serve + mcp-bridge), and package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/pnpm-lock.yaml* ./

# Install production deps (needed for /mcp-bridge which uses @modelcontextprotocol/sdk)
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "scripts/serve.mjs"]
