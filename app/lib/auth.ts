import { env } from "cloudflare:workers";

export type Plan = "trial" | "essential" | "growth" | "scale";
export type UserRole = "user" | "admin";
export type AccountStatus = "active" | "suspended" | "cancelled" | "deletion_requested";
export type AccountTokenPurpose = "verify_email" | "reset_password";

export type SessionUser = {
  id: string;
  name: string;
  company: string;
  email: string;
  plan: Plan;
  trialEndsAt: string;
  role: UserRole;
  status: AccountStatus;
  emailVerifiedAt: string;
};

type UserRow = {
  id: string;
  name: string;
  company: string;
  email: string;
  plan: Plan;
  trial_ends_at: string;
  role: UserRole;
  status: AccountStatus;
  email_verified_at: string;
};

const SESSION_COOKIE = "prospecta_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
// Cloudflare Workers currently caps PBKDF2 iteration counts at 100,000.
const PASSWORD_PBKDF2_ITERATIONS = 100_000;

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
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: PASSWORD_PBKDF2_ITERATIONS },
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
  const leftBytes = hexToBytes(left);
  const rightBytes = hexToBytes(right);
  if (leftBytes.byteLength !== rightBytes.byteLength || leftBytes.byteLength === 0) return false;
  const workerSubtle = crypto.subtle as SubtleCrypto & { timingSafeEqual(a: BufferSource, b: BufferSource): boolean };
  return workerSubtle.timingSafeEqual(leftBytes, rightBytes);
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
    `SELECT u.id, u.name, u.company, u.email, u.plan, u.trial_ends_at, u.role, u.status, u.email_verified_at
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP AND s.revoked_at IS NULL
       AND u.status = 'active' AND u.email_verified_at IS NOT NULL`,
  ).bind(tokenHash).first<UserRow>();
  if (!row) return null;
  await database().prepare("UPDATE sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE token_hash = ?").bind(tokenHash).run();
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    plan: row.plan,
    trialEndsAt: row.trial_ends_at,
    role: row.role,
    status: row.status,
    emailVerifiedAt: row.email_verified_at,
  };
}

export function initialAdminEmail() {
  const bindings = env as Cloudflare.Env & { INITIAL_ADMIN_EMAIL?: string };
  return normalizeEmail(bindings.INITIAL_ADMIN_EMAIL ?? "eduardonunesdrops@gmail.com");
}

export async function createAccountToken(userId: string, purpose: AccountTokenPurpose, ttlSeconds: number) {
  const rawToken = `${crypto.randomUUID()}.${bytesToHex(crypto.getRandomValues(new Uint8Array(24)))}`;
  const tokenHash = await hashToken(rawToken);
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  const id = crypto.randomUUID();
  await database().batch([
    database().prepare("UPDATE account_tokens SET consumed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND purpose = ? AND consumed_at IS NULL").bind(userId, purpose),
    database().prepare("INSERT INTO account_tokens (id, user_id, purpose, token_hash, expires_at) VALUES (?, ?, ?, ?, ?)").bind(id, userId, purpose, tokenHash, expiresAt),
  ]);
  return { id, rawToken, expiresAt };
}

export async function createOperationalAccessToken(user: SessionUser) {
  const rawToken = `${crypto.randomUUID()}.${bytesToHex(crypto.getRandomValues(new Uint8Array(24)))}`;
  const tokenHash = await hashToken(rawToken);
  const sessionLimit = Date.now() + SESSION_MAX_AGE * 1000;
  const trialLimit = user.plan === "trial" ? new Date(user.trialEndsAt).getTime() : sessionLimit;
  const expiresAt = new Date(Math.min(sessionLimit, Number.isFinite(trialLimit) ? trialLimit : sessionLimit)).toISOString();
  await database().prepare(
    "INSERT INTO operational_access_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
  ).bind(crypto.randomUUID(), user.id, tokenHash, expiresAt).run();
  return { rawToken, expiresAt };
}

export async function requireAdmin(request: Request) {
  const user = await currentUser(request);
  return user?.role === "admin" ? user : null;
}

export const planLimits: Record<Plan, { searches: number; results: number; export: boolean; enrichment: boolean; automation: boolean }> = {
  trial: { searches: 3, results: 5, export: false, enrichment: false, automation: false },
  essential: { searches: 150, results: 25, export: true, enrichment: false, automation: false },
  growth: { searches: 1_000, results: 100, export: true, enrichment: true, automation: true },
  scale: { searches: 5_000, results: 250, export: true, enrichment: true, automation: true },
};
