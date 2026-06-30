// Minimal zero-dependency dev server. Runs the same handler used by the
// serverless function. Start with: npm run server  (listens on :8787)

import { createServer } from "node:http";
import { handleGenerate, type GenerateRequest } from "./handler.ts";

const PORT = Number(process.env.PORT ?? 8787);

const server = createServer((httpReq, httpRes) => {
  // CORS for local dev (Vite proxies, but allow direct calls too).
  httpRes.setHeader("Access-Control-Allow-Origin", "*");
  httpRes.setHeader("Access-Control-Allow-Headers", "Content-Type");
  httpRes.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (httpReq.method === "OPTIONS") {
    httpRes.writeHead(204).end();
    return;
  }

  if (httpReq.method === "POST" && httpReq.url === "/api/generate") {
    let raw = "";
    httpReq.on("data", (c) => (raw += c));
    httpReq.on("end", async () => {
      try {
        const body = JSON.parse(raw || "{}") as GenerateRequest;
        const result = await handleGenerate(body);
        httpRes
          .writeHead(result.status, { "Content-Type": "application/json" })
          .end(JSON.stringify(result.body));
      } catch (err) {
        httpRes
          .writeHead(400, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "Bad request", detail: (err as Error).message }));
      }
    });
    return;
  }

  httpRes.writeHead(404, { "Content-Type": "application/json" }).end(
    JSON.stringify({ error: "Not found" })
  );
});

server.listen(PORT, () => {
  console.log(`retake-studio api listening on http://localhost:${PORT}`);
  console.log(`provider: ${process.env.IMAGE_PROVIDER ?? "mock"}`);
});
