import { Request, Response } from 'express';
import crypto from 'crypto';

export function parseCookies(req: Request): Record<string, string> {
  const list: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    try {
      list[name] = decodeURIComponent(value);
    } catch {
      list[name] = value;
    }
  });
  return list;
}

/**
 * Authoritative Server Session Identity:
 * The server-issued HttpOnly cookie 'aura_session_id' is the sole authoritative identity.
 * Client-controlled headers (x-session-id) or query parameters (?sid=) CANNOT override or switch session identity.
 */
export function getOrCreateSessionId(req: Request, res?: Response): string {
  // If already resolved on this request object during current lifecycle, return cached value
  if ((req as any).sessionId) {
    return (req as any).sessionId;
  }

  const cookies = parseCookies(req);
  let sessionId = cookies['aura_session_id'];

  const isValidToken = (token?: string): boolean =>
    typeof token === 'string' && /^usr_[a-zA-Z0-9_-]{16,64}$/.test(token);

  // If cookie is absent or invalid, generate a cryptographically secure token and issue HttpOnly cookie
  if (!isValidToken(sessionId)) {
    sessionId = `usr_${crypto.randomBytes(16).toString('hex')}`;
    if (res && !res.headersSent) {
      const isHttps =
        req.secure ||
        req.headers['x-forwarded-proto'] === 'https' ||
        process.env.NODE_ENV === 'production';
      const secureFlag = isHttps ? '; Secure' : '';
      res.setHeader(
        'Set-Cookie',
        `aura_session_id=${sessionId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secureFlag}`
      );
    }
  }

  (req as any).sessionId = sessionId;
  return sessionId;
}
