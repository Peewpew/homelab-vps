import crypto from 'node:crypto';
import path from 'node:path';

export function hashPassword(
  password: string,
  saltHex = crypto.randomBytes(16).toString('hex')
): { hash: string; salt: string } {
  const derived = crypto.scryptSync(password, saltHex, 64);
  return {
    hash: derived.toString('hex'),
    salt: saltHex,
  };
}

export function verifyPassword(
  password: string,
  expectedHashHex: string,
  saltHex: string
): boolean {
  if (!password || !expectedHashHex || !saltHex) return false;
  try {
    const derived = crypto.scryptSync(password, saltHex, 64);
    const expected = Buffer.from(expectedHashHex, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function timingSafeEqualStrings(a: string, b: string): boolean {
  const aHash = crypto.createHash('sha256').update(a).digest();
  const bHash = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(aHash, bHash);
}

export function signSessionToken(secret: string, ttlMs = 1000 * 60 * 60 * 12): string {
  const payload = Buffer.from(
    JSON.stringify({ role: 'owner', exp: Date.now() + ttlMs }),
    'utf8'
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(
  token: string,
  secret: string,
  nowMs = Date.now()
): boolean {
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!payload || !signature) return false;

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
  if (!timingSafeEqualStrings(signature, expectedSig)) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    return decoded.role === 'owner' && typeof decoded.exp === 'number' && decoded.exp > nowMs;
  } catch {
    return false;
  }
}

export function resolveConfinedPath(baseDir: string, fileName: string): string {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(resolvedBase, fileName);
  if (!resolvedTarget.startsWith(resolvedBase + path.sep)) {
    throw new Error('Resolved path escapes confined directory');
  }
  return resolvedTarget;
}
