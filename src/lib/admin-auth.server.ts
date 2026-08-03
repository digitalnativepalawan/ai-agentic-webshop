import "@tanstack/react-start/server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_VERSION = "v1";
const DEFAULT_TTL_MINUTES = 120;

type AdminSessionPayload = {
  role: "operator-admin";
  issuedAt: number;
  expiresAt: number;
  nonce: string;
};

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET?.trim() || process.env.ADMIN_PASSKEY?.trim();
  if (!value) throw new Error("Admin session security is not configured.");
  return value;
}

function encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signature(payload: string): string {
  return createHmac("sha256", secret()).update(`${TOKEN_VERSION}.${payload}`).digest("base64url");
}

function passkeyMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSKEY;
  if (!expected) return false;
  const actualHash = createHash("sha256").update(input, "utf8").digest();
  const expectedHash = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(actualHash, expectedHash);
}

export function createAdminSession(passkey: string) {
  if (!passkeyMatches(passkey)) return { ok: false as const };
  const issuedAt = Date.now();
  const configuredTtl = Number(process.env.ADMIN_SESSION_TTL_MINUTES ?? DEFAULT_TTL_MINUTES);
  const ttlMinutes =
    Number.isFinite(configuredTtl) && configuredTtl > 0 ? configuredTtl : DEFAULT_TTL_MINUTES;
  const payload: AdminSessionPayload = {
    role: "operator-admin",
    issuedAt,
    expiresAt: issuedAt + ttlMinutes * 60_000,
    nonce: randomBytes(12).toString("base64url"),
  };
  const encoded = encode(JSON.stringify(payload));
  return {
    ok: true as const,
    sessionToken: `${TOKEN_VERSION}.${encoded}.${signature(encoded)}`,
    expiresAt: new Date(payload.expiresAt).toISOString(),
  };
}

export function requireAdminSession(token: string): AdminSessionPayload {
  const [version, encoded, suppliedSignature] = token.split(".");
  if (version !== TOKEN_VERSION || !encoded || !suppliedSignature) {
    throw new Error("Admin session is invalid. Sign in again.");
  }
  const expectedSignature = signature(encoded);
  const actualBuffer = Buffer.from(suppliedSignature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error("Admin session is invalid. Sign in again.");
  }
  let payload: AdminSessionPayload;
  try {
    payload = JSON.parse(decode(encoded)) as AdminSessionPayload;
  } catch {
    throw new Error("Admin session is invalid. Sign in again.");
  }
  if (payload.role !== "operator-admin" || payload.expiresAt <= Date.now()) {
    throw new Error("Admin session expired. Sign in again.");
  }
  return payload;
}
