import * as vscode from 'vscode';

export function getMaxDepth(): number {
  const config = vscode.workspace.getConfiguration('nestedGitTracker');
  const value = config.get<number>('maxDepth', 0);
  return typeof value === 'number' && value >= 0 ? Math.floor(value) : 0;
}
