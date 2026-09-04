import { env } from "cloudflare:workers";

export type Plan = "trial" | "essential" | "growth" | "scale";

export type SessionUser = {
  id: string;
  name: string;
  company: string;
  email: string;
  plan: Plan;
  trialEndsAt: string;
};

type UserRow = {
  id: string;
  name: string;
  company: string;
  email: string;
  plan: Plan;
  trial_ends_at: string;
};

const SESSION_COOKIE = "prospecta_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function database() {
  const databaseBinding = (env as Cloudflare.Env & { DB?: D1Database }).DB;
  if (!databaseBinding) throw new Error("D1 binding DB is not configured");
  return databaseBinding;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string) {
  const pairs = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(pairs.map((pair) => Number.parseInt(pair, 16)));
}

export function normalizeEmail(value: string) {
  return value.trim().toLocaleLowerCase("en-US");
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function hashPassword(password: string, saltHex?: string) {
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: 210_000 },
    key,
    256,
  );
  return { hash: bytesToHex(new Uint8Array(bits)), salt: bytesToHex(salt) };
}

export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return bytesToHex(new Uint8Array(digest));
}

export function secureCompare(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}

export async function createSession(userId: string) {
  const rawToken = `${crypto.randomUUID()}.${bytesToHex(crypto.getRandomValues(new Uint8Array(24)))}`;
  const tokenHash = await hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();
  await database().prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)")
    .bind(crypto.randomUUID(), userId, tokenHash, expiresAt).run();
  return { rawToken, expiresAt };
}

export function sessionCookie(token: string) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE}`;
}

export function expiredSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function readSessionToken(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : null;
}

export async function currentUser(request: Request): Promise<SessionUser | null> {
  const token = readSessionToken(request);
  if (!token) return null;
  const tokenHash = await hashToken(token);
  const row = await database().prepare(
    `SELECT u.id, u.name, u.company, u.email, u.plan, u.trial_ends_at
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP`,
  ).bind(tokenHash).first<UserRow>();
  if (!row) return null;
  return { id: row.id, name: row.name, company: row.company, email: row.email, plan: row.plan, trialEndsAt: row.trial_ends_at };
}

export const planLimits: Record<Plan, { searches: number; results: number; export: boolean; enrichment: boolean; automation: boolean }> = {
  trial: { searches: 3, results: 5, export: false, enrichment: false, automation: false },
  essential: { searches: 150, results: 25, export: true, enrichment: false, automation: false },
  growth: { searches: 1_000, results: 100, export: true, enrichment: true, automation: true },
  scale: { searches: 5_000, results: 250, export: true, enrichment: true, automation: true },
};
