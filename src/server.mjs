import http from "node:http";
import { HttpError, verifyRequest } from "./auth.mjs";
import { loadConfig } from "./config.mjs";
import { createRepository } from "./repository.mjs";

/*
 * Loopback HTTP service. Every route except /health requires a signed PL
 * envelope. The service is not meant to be exposed beyond the workstation.
 */

const MAX_BODY_BYTES = 16_000;
const TOPIC_ROUTE = /^\/v1\/topics\/([a-z][a-z0-9-]{1,60})$/;

function send(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  let size = 0;
  const parts = [];
  for await (const part of req) {
    size += part.length;
    if (size > MAX_BODY_BYTES) throw new HttpError("Request too large", 413);
    parts.push(part);
  }
  return Buffer.concat(parts).toString();
}

export function createServer(config, repository) {
  const allowedHosts = new Set([`127.0.0.1:${config.port}`, `localhost:${config.port}`]);
  return http.createServer(async (req, res) => {
    try {
      if (!allowedHosts.has(req.headers.host || "") || req.headers.origin) return send(res, 403, { error: "Access denied" });
      if (req.method === "GET" && req.url === "/health") {
        return send(res, 200, { status: "ok", service: "platformtraining", playerVersion: 2 });
      }
      const raw = await readBody(req);
      const context = verifyRequest(req, raw, config.signingSecret);
      if (req.method === "GET" && req.url === "/v1/experience") return send(res, 200, await repository.experience(context));
      const topicMatch = req.method === "GET" ? TOPIC_ROUTE.exec(req.url || "") : null;
      if (topicMatch) return send(res, 200, await repository.topic(context, topicMatch[1]));
      if (req.method === "POST" && req.url === "/v1/progress") return send(res, 200, await repository.act(context, JSON.parse(raw)));
      return send(res, 404, { error: "Not found" });
    } catch (error) {
      const status = error instanceof HttpError ? error.status : error?.name === "ZodError" || error instanceof SyntaxError ? 400 : 503;
      const message =
        status === 503 ? "Training is temporarily unavailable" : status === 401 ? "Unauthorized" : error.message || "Request failed";
      if (status === 503) console.error("[platformtraining]", error?.message || error);
      send(res, status, { error: message });
    }
  });
}

async function main() {
  const config = await loadConfig();
  const repository = await createRepository(config.databaseUrl, { channel: config.channel });
  const server = createServer(config, repository);
  server.requestTimeout = 20_000;
  server.listen(config.port, "127.0.0.1", () => console.log(`Platform Training listening on ${config.port}`));
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      server.close();
      void repository.pool.end();
    });
  }
}

const invokedDirectly = process.argv[1] && /server\.mjs$/.test(process.argv[1]);
if (invokedDirectly) await main();
