export const ALLOWED_COMMANDS = [
  'create_repo','create_file','update_file','delete_file',
  'create_branch','create_commit','sync_repo','get_repo','list_files',
] as const;

export type BridgeCommandType = typeof ALLOWED_COMMANDS[number];
export const ELEVATED_COMMANDS: readonly BridgeCommandType[] = ['delete_file','create_commit'];

export interface BridgeCommand {
  cmd: BridgeCommandType;
  repo?: string; name?: string; path?: string; content?: string;
  branch?: string; sha?: string; message?: string; confirm?: 'DELETE';
  private?: boolean; description?: string; direction?: 'pull'|'push';
  from?: string; files?: string[];
}

export interface BridgeParseResult {
  ok: boolean;
  commands: BridgeCommand[];
  errors: { index: number; reason: string }[];
  warnings: string[];
}

export const LIMITS = {
  MAX_COMMANDS: 200, MAX_CONTENT_BYTES: 512_000,
  MAX_PATH_LENGTH: 512, MAX_REPO_NAME: 100,
} as const;
