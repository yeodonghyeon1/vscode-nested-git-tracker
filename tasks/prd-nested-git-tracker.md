# PRD: Nested Git Tracker — VS Code Extension

## Introduction

VS Code의 기본 Git 익스텐션은 워크스페이스 루트 하나만 Source Control에 등록한다.
모노레포, 멀티 프로젝트 폴더, 서브모듈을 수동으로 사용하는 환경에서는
하위 디렉토리의 `.git` 폴더들이 Source Control 패널에 나타나지 않아 불편하다.

이 익스텐션은 워크스페이스 내 중첩된 `.git` 폴더를 자동으로 탐색하고,
VS Code 내장 Git 익스텐션 API에 등록해 Source Control 패널에서 바로 추적할 수 있게 한다.
등록된 이후의 커밋, 스테이징, diff, 배지 표시는 VS Code 내장 Git이 그대로 처리한다.

## Goals

- 워크스페이스 열릴 때 하위 `.git` 폴더를 자동으로 재귀 탐색
- 발견된 모든 repo를 `vscode.git` 내장 API에 등록 → Source Control 패널 자동 노출
- 탐색 깊이를 사용자가 설정 가능 (default: 무제한)
- 공개 GitHub 레포로 배포 가능한 구조로 개발

## User Stories

### US-001: 워크스페이스 오픈 시 자동 스캔
**Description:** As a developer, I want nested git repos to appear in Source Control automatically when I open a workspace, so I don't have to add them manually.

**Acceptance Criteria:**
- [ ] 워크스페이스 열릴 때 익스텐션이 자동으로 `.git` 폴더를 재귀 탐색
- [ ] 탐색 시작점은 각 워크스페이스 폴더 (multi-root 지원)
- [ ] `node_modules` 폴더는 기본적으로 탐색에서 제외
- [ ] 탐색 완료 후 찾은 repo 수를 상태바 또는 알림으로 표시
- [ ] Typecheck/lint 통과

### US-002: 중첩 Repo를 Source Control에 등록
**Description:** As a developer, I want each nested repo to appear as a separate entry in the Source Control panel, so I can manage them with full Git functionality.

**Acceptance Criteria:**
- [ ] 각 발견된 `.git` 폴더를 `vscode.git` API의 `git.openRepository(uri)`로 등록
- [ ] Source Control 패널에 각 repo가 독립 섹션으로 표시
- [ ] 변경 파일 수 배지, 커밋, 스테이징, diff가 내장 Git 익스텐션으로 동작
- [ ] Typecheck/lint 통과

### US-003: 탐색 깊이 설정
**Description:** As a developer, I want to configure the maximum search depth, so I can limit scanning in very large workspaces.

**Acceptance Criteria:**
- [ ] `settings.json`에 `nestedGitTracker.maxDepth` 설정 추가 (default: `0` = 무제한)
- [ ] 설정 변경 후 커맨드로 수동 재스캔 가능
- [ ] 잘못된 값 입력 시 오류 없이 default로 fallback
- [ ] Typecheck/lint 통과

### US-004: 수동 재스캔 커맨드
**Description:** As a developer, I want to manually trigger a rescan, so I can pick up newly added nested repos without restarting VS Code.

**Acceptance Criteria:**
- [ ] 커맨드 팔레트에 `Nested Git Tracker: Rescan Workspace` 커맨드 등록
- [ ] 실행 시 전체 탐색 재실행 → 새로 발견된 repo만 추가 등록
- [ ] 이미 등록된 repo는 중복 등록 없이 스킵
- [ ] Typecheck/lint 통과

## Functional Requirements

- FR-1: 익스텐션 활성화 시(`onStartupFinished`) 워크스페이스 폴더 기준으로 `.git` 재귀 탐색
- FR-2: `node_modules` 폴더는 탐색 제외 (하드코딩, 설정 불필요)
- FR-3: `vscode.git` 익스텐션 API(`getExtension('vscode.git').exports.getAPI(1)`)를 통해 repo 등록
- FR-4: `nestedGitTracker.maxDepth` 설정값(number, default 0)으로 탐색 깊이 제한 (0 = 무제한)
- FR-5: `Nested Git Tracker: Rescan Workspace` 커맨드로 수동 재스캔
- FR-6: 이미 등록된 repo 경로는 중복 등록 방지
- FR-7: multi-root 워크스페이스의 모든 루트 폴더를 탐색 기점으로 사용
- FR-8: 탐색 결과를 Output Channel(`Nested Git Tracker`)에 로깅

## Non-Goals

- 사용자 정의 제외 패턴 (node_modules 외 추가 제외 없음)
- Worktree, submodule 특별 처리 (일반 `.git` 폴더로 취급)
- 파일 변경 감지 기반 자동 재등록 (수동 재스캔으로 충분)
- 자체 SCM Provider 구현 (내장 Git에 위임)
- VS Code Marketplace 게시 자동화 (수동 배포)

## Technical Considerations

- **언어:** TypeScript (VS Code 익스텐션 표준)
- **빌드:** esbuild 번들 (vsce 패키지)
- **Git API 접근:** `vscode.git` 익스텐션의 공개 API 사용
  ```typescript
  const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')!.exports;
  const git = gitExtension.getAPI(1);
  await git.openRepository(vscode.Uri.file(repoPath));
  ```
- **탐색 구현:** Node.js `fs.readdirSync` 재귀 (비동기 처리로 UI 블로킹 방지)
- **활성화 이벤트:** `onStartupFinished` (워크스페이스 로드 완료 후 실행)
- **테스트:** `@vscode/test-electron` 기반 통합 테스트

## Success Metrics

- 워크스페이스 오픈 후 3초 이내에 중첩 repo가 Source Control 패널에 표시
- 10개 이상 중첩 repo가 있는 워크스페이스에서도 정상 동작
- 수동 재스캔으로 새로 추가된 repo가 즉시 등록

## Open Questions

- `git.openRepository`가 VS Code 버전에 따라 API가 다를 경우 fallback 전략 필요한지 검토
- 워크스페이스 폴더 자체(루트)가 이미 Git repo인 경우 중복 등록 방지 로직 확인 필요
