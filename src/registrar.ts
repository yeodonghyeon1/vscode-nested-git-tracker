import * as vscode from 'vscode';

interface GitExtension {
  getAPI(version: 1): GitAPI;
}

interface GitAPI {
  openRepository(uri: vscode.Uri): Promise<void>;
  repositories: { rootUri: vscode.Uri }[];
}

export async function registerRepositories(
  paths: string[],
  outputChannel: vscode.OutputChannel
): Promise<void> {
  const gitExt = vscode.extensions.getExtension<GitExtension>('vscode.git');
  if (!gitExt) {
    outputChannel.appendLine('[Nested Git Tracker] Warning: vscode.git extension not found.');
    return;
  }

  const git = gitExt.exports.getAPI(1);
  const registeredPaths = new Set(
    git.repositories.map((r) => r.rootUri.fsPath)
  );

  let registered = 0;
  for (const repoPath of paths) {
    if (registeredPaths.has(repoPath)) {
      outputChannel.appendLine(`[Nested Git Tracker] Already registered: ${repoPath}`);
      continue;
    }
    try {
      await git.openRepository(vscode.Uri.file(repoPath));
      outputChannel.appendLine(`[Nested Git Tracker] Registered: ${repoPath}`);
      registered++;
    } catch (err) {
      outputChannel.appendLine(`[Nested Git Tracker] Failed to register ${repoPath}: ${err}`);
    }
  }

  outputChannel.appendLine(`[Nested Git Tracker] Done — ${registered} new repo(s) registered.`);
}
