import * as fs from 'node:fs';
import * as path from 'node:path';

export interface OpenCodeAuthEntry {
  type: 'api';
  key: string;
}

export interface OpenCodeAuthJson {
  chutes?: OpenCodeAuthEntry;
  openrouter?: OpenCodeAuthEntry;
  [key: string]: OpenCodeAuthEntry | undefined;
}

const AUTH_FILE_PATH = path.join(
  process.env.XDG_DATA_HOME || path.join(process.env.HOME || '~', '.local', 'share'),
  'opencode',
  'auth.json'
);

export function readOpenCodeAuth(): OpenCodeAuthJson | null {
  try {
    if (!fs.existsSync(AUTH_FILE_PATH)) {
      return null;
    }

    const content = fs.readFileSync(AUTH_FILE_PATH, 'utf-8');
    const auth = JSON.parse(content) as OpenCodeAuthJson;

    return auth;
  } catch {
    return null;
  }
}

export function getChutesApiKeyFromAuth(): string | null {
  const auth = readOpenCodeAuth();

  if (!auth?.chutes?.key) {
    return null;
  }

  return auth.chutes.key;
}
