import {
  ALLOWED_COMMANDS, BridgeCommand, BridgeCommandType,
  BridgeParseResult, ELEVATED_COMMANDS, LIMITS,
} from './contract';
import { validatePath } from './paths';

const REPO_NAME_RE = /^[A-Za-z0-9._-]{1,100}$/;
const SHA_RE = /^[0-9a-f]{7,40}$/i;

interface Schema { required: string[]; optional: string[] }
const SCHEMA: Record<BridgeCommandType, Schema> = {
  create_repo:   { required: ['name'],                        optional: ['private','description'] },
  create_file:   { required: ['repo','path','content'],       optional: ['branch','message'] },
  update_file:   { required: ['repo','path','content'],       optional: ['branch','sha','message'] },
  delete_file:   { required: ['repo','path','sha','confirm'], optional: ['branch','message'] },
  create_branch: { required: ['repo','branch'],               optional: ['from'] },
  create_commit: { required: ['repo','message'],              optional: ['branch','files'] },
  sync_repo:     { required: ['repo'],                        optional: ['branch','direction'] },
  get_repo:      { required: ['repo'],                        optional: [] },
  list_files:    { required: ['repo'],                        optional: ['path','branch'] },
};

export function extractBridgeBlock(text: unknown): string | null {
  if (typeof text !== 'string') return null;
  const m = text.match(/```bridge[ \t]*\r?\n([\s\S]*?)\r?\n?```/);
  return m ? m[1] : null;
}

function isAllowed(cmd: unknown): cmd is BridgeCommandType {
  return typeof cmd === 'string' && (ALLOWED_COMMANDS as readonly string[]).includes(cmd);
}

export function parseBridgeCommands(rawText: unknown): BridgeParseResult {
  const errors: BridgeParseResult['errors'] = [];
  const warnings: string[] = [];

  if (typeof rawText !== 'string') {
    return { ok: false, commands: [], errors: [{ index: -1, reason: 'entree non textuelle' }], warnings };
  }

  let parsed: unknown;
  try { parsed = JSON.parse(rawText); }
  catch (e) {
    return { ok: false, commands: [], errors: [{ index: -1, reason: 'JSON invalide: ' + (e as Error).message }], warnings };
  }
  if (!Array.isArray(parsed)) {
    return { ok: false, commands: [], errors: [{ index: -1, reason: 'racine non-tableau' }], warnings };
  }
  if (parsed.length === 0) warnings.push('tableau vide');
  if (parsed.length > LIMITS.MAX_COMMANDS) {
    errors.push({ index: -1, reason: 'trop de commandes (' + parsed.length + ' > ' + LIMITS.MAX_COMMANDS + ')' });
    return { ok: false, commands: [], errors, warnings };
  }

  const commands: BridgeCommand[] = [];
  parsed.forEach((item, i) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      errors.push({ index: i, reason: 'element non-objet' }); return;
    }
    const obj = item as Record<string, unknown>;
    const cmd = obj.cmd;
    if (!isAllowed(cmd)) {
      errors.push({ index: i, reason: 'commande inconnue: ' + String(cmd) }); return;
    }
    const schema = SCHEMA[cmd];
    for (const f of schema.required) {
      if (obj[f] === undefined || obj[f] === null) {
        errors.push({ index: i, reason: cmd + ' exige "' + f + '"' }); return;
      }
    }
    if (cmd === 'create_repo') {
      if (typeof obj.name !== 'string' || !REPO_NAME_RE.test(obj.name)) {
        errors.push({ index: i, reason: 'name invalide' }); return;
      }
      if (obj.private !== undefined && typeof obj.private !== 'boolean') {
        errors.push({ index: i, reason: 'private doit etre booleen' }); return;
      }
    }
    if (cmd === 'create_file' || cmd === 'update_file' || cmd === 'delete_file') {
      const pv = validatePath(obj.path);
      if (!pv.ok) { errors.push({ index: i, reason: 'path: ' + pv.reason }); return; }
      if (obj.content !== undefined) {
        if (typeof obj.content !== 'string') { errors.push({ index: i, reason: 'content doit etre string' }); return; }
        if (obj.content.length > LIMITS.MAX_CONTENT_BYTES) { errors.push({ index: i, reason: 'content > 512 Ko' }); return; }
      }
    }
    if (cmd === 'delete_file') {
      if (obj.confirm !== 'DELETE') { errors.push({ index: i, reason: 'delete_file exige confirm:"DELETE"' }); return; }
      if (typeof obj.sha !== 'string' || !SHA_RE.test(obj.sha)) { errors.push({ index: i, reason: 'sha invalide' }); return; }
    }
    if (cmd === 'update_file' && obj.sha !== undefined) {
      if (typeof obj.sha !== 'string' || !SHA_RE.test(obj.sha)) { errors.push({ index: i, reason: 'sha invalide' }); return; }
    }
    if (ELEVATED_COMMANDS.includes(cmd)) {
      const w = cmd + ' — confirmation renforcee requise';
      if (!warnings.includes(w)) warnings.push(w);
    }
    commands.push(Object.freeze({ ...obj }) as BridgeCommand);
  });
  return { ok: errors.length === 0, commands, errors, warnings };
}
