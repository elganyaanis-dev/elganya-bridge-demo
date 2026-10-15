import { LIMITS } from './contract';

const FORBIDDEN: { re: RegExp; reason: string }[] = [
  { re: /\.\./,                 reason: 'traversee (..)' },
  { re: /^\/|^[A-Za-z]:\\/,      reason: 'chemin absolu' },
  { re: /(^|\/)\.git(\/|$)/,     reason: '.git interne' },
  { re: /(^|\/)\.env(\.|$)/,     reason: '.env' },
  { re: /(^|\/)secrets?(\/|$)/i, reason: 'secrets/' },
  { re: /(^|\/)\.ssh(\/|$)/,     reason: '.ssh/' },
  { re: /\.(pem|key|p12|pfx)$/i, reason: 'cle privee' },
  { re: /\0/,                    reason: 'octet nul' },
];

export interface PathCheck { ok: boolean; reason?: string }

export function validatePath(p: unknown): PathCheck {
  if (typeof p !== 'string' || p.length === 0) return { ok: false, reason: 'chemin vide' };
  if (p.length > LIMITS.MAX_PATH_LENGTH) return { ok: false, reason: 'chemin trop long' };
  for (const { re, reason } of FORBIDDEN) if (re.test(p)) return { ok: false, reason };
  return { ok: true };
}
