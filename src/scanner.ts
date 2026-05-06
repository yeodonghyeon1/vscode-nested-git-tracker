import * as fs from 'fs';
import * as path from 'path';

const SKIP_DIRS = new Set(['node_modules', '.git']);

export function findNestedGitRepos(rootDir: string, maxDepth: number): string[] {
  const results: string[] = [];
  scanDir(rootDir, rootDir, 0, maxDepth, results);
  return results;
}

function scanDir(
  rootDir: string,
  currentDir: string,
  depth: number,
  maxDepth: number,
  results: string[]
): void {
  if (maxDepth > 0 && depth > maxDepth) {
    return;
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(currentDir, entry.name);

    if (entryPath !== rootDir && hasGitDir(entryPath)) {
      results.push(entryPath);
    }

    scanDir(rootDir, entryPath, depth + 1, maxDepth, results);
  }
}

function hasGitDir(dirPath: string): boolean {
  try {
    return fs.statSync(path.join(dirPath, '.git')).isDirectory();
  } catch {
    return false;
  }
}
