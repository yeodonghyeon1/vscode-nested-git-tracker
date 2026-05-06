import * as vscode from 'vscode';
import { findNestedGitRepos } from './scanner';
import { registerRepositories } from './registrar';
import { getMaxDepth } from './config';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext): void {
  outputChannel = vscode.window.createOutputChannel('Nested Git Tracker');
  context.subscriptions.push(outputChannel);

  const rescanCommand = vscode.commands.registerCommand(
    'nested-git-tracker.rescan',
    () => runScan()
  );
  context.subscriptions.push(rescanCommand);

  runScan();
}

async function runScan(): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    outputChannel.appendLine('[Nested Git Tracker] No workspace folders open.');
    return;
  }

  const maxDepth = getMaxDepth();
  outputChannel.appendLine(
    `[Nested Git Tracker] Scanning (maxDepth=${maxDepth === 0 ? 'unlimited' : maxDepth})...`
  );

  const allPaths: string[] = [];
  for (const folder of workspaceFolders) {
    const found = findNestedGitRepos(folder.uri.fsPath, maxDepth);
    outputChannel.appendLine(
      `[Nested Git Tracker] Found ${found.length} nested repo(s) under ${folder.uri.fsPath}`
    );
    allPaths.push(...found);
  }

  await registerRepositories(allPaths, outputChannel);
}

export function deactivate(): void {
  // VS Code disposes subscriptions automatically
}
