import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// CORS proxy for dev: forwards API requests server-side to avoid CORS
function corsProxyPlugin(): Plugin {
  return {
    name: "cors-proxy",
    configureServer(server) {
      server.middlewares.use("/api-proxy", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let body = "";
        req.on("data", (chunk) => { body += chunk.toString(); });
        req.on("end", async () => {
          try {
            const { url, method = "GET", headers = {}, body: requestBody, formData } = JSON.parse(body);
            if (!url || typeof url !== "string") {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Missing url" }));
              return;
            }
            let fetchBody: string | undefined;
            const fetchHeaders = { ...(headers as Record<string, string>) };
            if (Array.isArray(formData) && formData.length > 0) {
              const params = new URLSearchParams();
              formData.forEach((p: { key: string; value: string }) => params.append(p.key, p.value));
              fetchBody = params.toString();
              fetchHeaders["Content-Type"] = "application/x-www-form-urlencoded";
            } else if (requestBody !== undefined && requestBody !== null) {
              fetchBody = String(requestBody);
            }
            const proxyRes = await fetch(url, {
              method: method as string,
              headers: fetchHeaders,
              body: fetchBody,
            });
            const respBody = await proxyRes.text();
            res.writeHead(proxyRes.status, proxyRes.statusText, {
              "Content-Type": proxyRes.headers.get("content-type") || "application/octet-stream",
            });
            res.end(respBody);
          } catch (e) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: String(e) }));
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), corsProxyPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
