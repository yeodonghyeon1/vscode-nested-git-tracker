# Nested Git Tracker

A VS Code extension that automatically discovers and registers nested `.git` repositories so they appear in the **Source Control** panel — no manual setup required.

## Why

VS Code's built-in Git extension only tracks the workspace root. In monorepos, multi-project folders, or workspaces with manually-managed submodules, nested repos are invisible in Source Control. This extension fixes that.

## How it works

1. On workspace open, recursively scans all workspace folders for `.git` directories.
2. Registers each discovered repo with the built-in `vscode.git` extension via its public API.
3. The built-in Git extension handles everything else: commit, stage, diff, change count badges.

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `nestedGitTracker.maxDepth` | `0` | Max folder depth to scan. `0` = unlimited. |

## Commands

| Command | Description |
|---------|-------------|
| `Nested Git Tracker: Rescan Workspace` | Re-run discovery to pick up newly added repos. |

## Requirements

- VS Code 1.85+
- Built-in Git extension enabled (enabled by default)

## Development

```bash
npm install
npm run compile   # type-check
npm run build     # emit JS to out/
```

Press `F5` in VS Code to launch the Extension Host for local testing.
