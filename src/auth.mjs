import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const AUDIENCE = "platformtraining";
/** Requests are accepted for at most 90 seconds after signing. */
const MAX_LIFETIME_MS = 90_000;

/** The signed envelope PL attaches to every server-to-server request. */
export const ContextSchema = z
  .object({
    tenantId: z.string().min(1).max(200),
    userId: z.uuid(),
    capabilities: z.array(z.string().min(1).max(200)).max(200),
    stage: z.string().max(200).default("welcome"),
    exp: z.number(),
    aud: z.literal(AUDIENCE),
  })
  .strict();

export class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const digest = (value) => createHash("sha256").update(value).digest("hex");

function signature(method, path, raw, encodedContext, secret) {
  return createHmac("sha256", secret)
    .update(`${method}\n${path}\n${digest(raw)}\n${encodedContext}`)
    .digest("hex");
}

/** Produce the two headers a caller must send. Used by tests and the wire check. */
export function signRequest({ method, path, raw = "", context, secret }) {
  const encoded = Buffer.from(JSON.stringify(context)).toString("base64url");
  return {
    "x-training-context": encoded,
    "x-training-signature": signature(method, path, raw, encoded, secret),
  };
}

/**
 * Verify the signature over method, path, body digest and context, then parse
 * the context. The signature binds the body so a replay with a different body
 * or route fails; the expiry bounds replay in time.
 */
export function verifyRequest(req, raw, secret, now = Date.now()) {
  const encoded = req.headers["x-training-context"];
  const provided = req.headers["x-training-signature"];
  if (typeof encoded !== "string" || typeof provided !== "string" || encoded.length > 20_000) {
    throw new HttpError("Unauthorized", 401);
  }
  const expected = signature(req.method, req.url, raw, encoded, secret);
  if (provided.length !== expected.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
    throw new HttpError("Unauthorized", 401);
  }
  const context = ContextSchema.parse(JSON.parse(Buffer.from(encoded, "base64url").toString()));
  const expiresAt = context.exp * 1000;
  if (expiresAt < now || expiresAt > now + MAX_LIFETIME_MS) throw new HttpError("Expired request", 401);
  return context;
}
