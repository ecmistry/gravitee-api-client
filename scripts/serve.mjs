#!/usr/bin/env node
/**
 * Production server: serves built static files and /api-proxy for CORS bypass.
 * Run after: npm run build (with VITE_USE_CORS_PROXY=true for Docker)
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "..", "dist");
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function collectBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString();
}

async function handleApiProxy(bodyStr, res) {
  try {
    const { url, method = "GET", headers = {}, body: requestBody, formData } = JSON.parse(bodyStr);
    if (!url || typeof url !== "string") {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing url" }));
      return;
    }
    let fetchBody;
    const fetchHeaders = { ...(headers || {}) };
    if (Array.isArray(formData) && formData.length > 0) {
      const params = new URLSearchParams();
      formData.forEach((p) => params.append(p.key, p.value));
      fetchBody = params.toString();
      fetchHeaders["Content-Type"] = "application/x-www-form-urlencoded";
    } else if (requestBody !== undefined && requestBody !== null) {
      fetchBody = String(requestBody);
    }
    const proxyRes = await fetch(url, {
      method: method,
      headers: fetchHeaders,
      body: fetchBody,
    });
    const respBody = await proxyRes.text();
    const contentType = proxyRes.headers.get("content-type") || "application/octet-stream";
    res.writeHead(proxyRes.status, proxyRes.statusText, { "Content-Type": contentType });
    res.end(respBody);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: String(e) }));
  }
}

async function serveStatic(res, urlPath) {
  const safePath = urlPath === "/" ? "/index.html" : urlPath.split("?")[0];
  const filePath = path.join(DIST, safePath === "/" ? "index.html" : safePath.slice(1));
  const parent = path.resolve(DIST);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(parent)) {
    res.writeHead(403);
    res.end();
    return;
  }
  if (!existsSync(resolved)) {
    const indexPath = path.join(DIST, "index.html");
    if (existsSync(indexPath)) {
      const html = await readFile(indexPath, "utf-8");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
      return;
    }
    res.writeHead(404);
    res.end();
    return;
  }
  try {
    const data = await readFile(resolved);
    const ext = path.extname(resolved);
    const mime = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  } catch {
    res.writeHead(500);
    res.end();
  }
}

const server = createServer(async (req, res) => {
  const url = req.url ?? "/";
  const pathname = url.split("?")[0];

  if (pathname === "/api-proxy" && req.method === "POST") {
    const body = await collectBody(req);
    await handleApiProxy(body, res);
    return;
  }

  await serveStatic(res, pathname);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Gravitee API Client running at http://localhost:${PORT}/`);
});
