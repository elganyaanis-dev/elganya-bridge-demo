import { BridgeCommand } from './contract';

export interface PreviewItem {
  index: number; cmd: string; repo: string | null; action: string;
  bytes?: number; sha?: string; elevated?: boolean; confirm?: string;
}

export function previewCommands(commands: BridgeCommand[]): PreviewItem[] {
  return commands.map((c, i) => {
    const base: PreviewItem = { index: i, cmd: c.cmd, repo: c.repo || c.name || null, action: 'inconnu' };
    switch (c.cmd) {
      case 'create_repo':   return { ...base, action: 'creer depot "' + c.name + '" (' + (c.private ? 'prive' : 'public') + ')' };
      case 'create_file':   return { ...base, action: 'creer ' + c.path, bytes: (c.content || '').length };
      case 'update_file':   return { ...base, action: 'mettre a jour ' + c.path, sha: c.sha || '(sans sha)' };
      case 'delete_file':   return { ...base, action: 'SUPPRIMER ' + c.path, elevated: true, confirm: c.confirm };
      case 'create_branch': return { ...base, action: 'branche ' + c.branch };
      case 'create_commit': return { ...base, action: 'commit: ' + c.message, elevated: true };
      case 'sync_repo':     return { ...base, action: 'sync ' + (c.direction || 'pull') };
      case 'get_repo':      return { ...base, action: 'lecture depot' };
      case 'list_files':    return { ...base, action: 'liste ' + (c.path || '/') };
      default:              return base;
    }
  });
}
