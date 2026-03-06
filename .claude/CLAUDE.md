# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Team Agents (Parallel Work)

Specialized agents for concurrent team-based development. Located in `.claude/agents/`.

| Agent | File | Tools |
| ----- | ---- | ----- |
| web-developer | `web-developer.md` | Read/Write/Edit + Bash |
| test-engineer | `test-engineer.md` | Read/Write/Edit + Bash |
| code-reviewer | `code-reviewer.md` | Read-only + Bash |
| codex-plan-reviewer | `codex-plan-reviewer.md` | Read-only + Bash (codex exec) |

### Usage

Spawn agents as teammates for parallel work:

```
TeamCreate → TaskCreate (per agent) → Task (subagent_type, team_name) → TaskUpdate
```

### Rules for Team Work

1. Each agent works ONLY within its domain boundaries
2. Cross-domain changes require coordination via team lead
3. code-reviewer is read-only - it reviews but does not modify code
4. All agents follow CLAUDE.md rules (language, symbols, no backward compat)

When a task involves 2+ independent workstreams (e.g., multiple packages, implementation + tests + review), ALWAYS create a team with `TeamCreate` and spawn agents to work in parallel. Do NOT sequentially perform work that can be parallelized.

**Criteria — spawn a team when ANY of these apply:**

- Task touches 2+ packages or modules simultaneously
- Implementation and testing can proceed independently
- Code review can run alongside ongoing development
- Research/exploration and coding can happen concurrently
- Multiple files across different domains need modification

**Workflow:**

1. `TeamCreate` → create team with task list
2. `TaskCreate` → break work into independent tasks
3. `Task` → spawn teammates (`subagent_type` + `team_name`) for each parallel workstream
4. Coordinate via `SendMessage` and `TaskUpdate`

Do NOT ask the user "should I use a team?" — if parallelization is beneficial, just do it.


---

## CRITICAL RULES (ZERO TOLERANCE)

### 1. NO Backward Compatibility / NO Deprecated Code

This is a GREENFIELD project. NEVER write backward compatibility code. Delete old code completely when refactoring. Never add `@deprecated` - just DELETE.

### 2. Duplicate Pattern Refactoring

When identical patterns are found in 2+ files: STOP, EXTRACT to shared location, REFACTOR all usages, THEN continue.

### 3. Package-First Development

Reusable features MUST be implemented in `packages/`, not in consumer apps.

### 4. NO AI Attribution in Git

- NEVER add "Co-Authored-By: Claude" or any AI-related signatures to commit messages
- NEVER add "Generated with Claude Code" to commit messages or PR descriptions
- ALL commit messages MUST be in English using conventional commit format (feat:, fix:, docs:, refactor:, test:, etc.)
- Keep commit messages clean and professional — no AI attribution of any kind

### 5. Git Commit Discipline

- NEVER commit unless the user **explicitly requests** it
- Group related files into **logical commits** — do not lump unrelated changes into a single commit
- NEVER push to remote unless the user **explicitly requests** it

## Project Overview

**simplix-react** — Package-first React framework that auto-generates reusable domain packages from OpenAPI specs.

Monorepo (pnpm + Turborepo) with the following packages:

| Package | Description |
| --- | --- |
| `simplix-react` | Meta package that includes all packages |
| `@simplix-react/contract` | Zod-based type-safe API contract definitions |
| `@simplix-react/react` | React Query hooks derived from contracts |
| `@simplix-react/form` | Auto-derived form hooks based on TanStack Form |
| `@simplix-react/auth` | Auth middleware (Bearer, API Key, OAuth2, Custom scheme) |
| `@simplix-react/access` | Authorization and access control with CASL integration |
| `@simplix-react/mock` | Auto-generated MSW handlers + in-memory Map stores |
| `@simplix-react/i18n` | Internationalization framework based on i18next |
| `@simplix-react/cli` | Project scaffolding/validation CLI |
| `@simplix-react/ui` | CRUD UI component library (list, form, detail, tree, filters) |
| `@simplix-react/api` | Orval mutator singleton for generated domain packages |
| `@simplix-react/testing` | Test utilities (mock client, query wrapper) |
| `config-eslint` | Shared ESLint configuration |
| `config-typescript` | Shared TypeScript configuration |

### Extensions

Backend-specific implementations packaged under `extensions/`. Each extension implements core package interfaces for a target platform.

| Extension | Package Prefix | Description |
| --- | --- | --- |
| `simplix-boot` | `@simplix-react-ext/simplix-boot-*` | Spring Boot backend adapters (auth, access, CLI plugin, utils) |

Extensions are registered in `pnpm-workspace.yaml` and participate in Turborepo pipelines. CLI plugins are dynamically loaded at runtime.



---

## Theming & Font System

Full reference: [`.claude/references/font-system.md`](references/font-system.md)

### Font Variables (Tailwind v4)

| Variable | Utility | Role |
| --- | --- | --- |
| `--font-sans` | `font-sans` | Primary (body text, UI) |
| `--font-display` | `font-display` | Secondary (headings, display) |
| `--font-mono` | `font-mono` | Code, technical content |

- App defines font variables in `@theme inline`, body applies `font-sans antialiased`
- `Heading` and `Text` components accept `font` prop (`sans` / `display` / `mono`)
- `Text` with `font="mono"` defaults to `<code>` tag
- Framework UI components NEVER set `font-family` — they inherit from the app
- CLI template generates all three variables with system font defaults

---

## MCP Priority Guidelines (Code Intelligence)

ALWAYS use core-graph MCP tools **first** for code analysis and refactoring tasks.

### core-graph MCP (Primary)

Converts codebases into property graphs for structural code intelligence. MUST be used **before** Grep/Glob for the following tasks:

| Task | Tools |
| --- | --- |
| Project structure overview | `get_graph_overview`, `get_graph_summary` |
| High-impact symbol identification | `get_hotspots` |
| Function complexity analysis | `get_complexity` |
| Module cluster analysis | `detect_communities`, `get_community_symbols` |
| Circular dependency detection | `detect_cycles` |
| Dead code detection | `detect_dead_code` |
| Test coverage gap analysis | `analyze_test_gaps` |
| Symbol reference/call tracing | `get_references`, `trace_usage`, `get_dependents` |
| Change impact analysis | `affected_tests`, `analyze_impact_cross_project` |
| Refactoring planning | `prepare_refactor`, `find_path` |
| Cross-package dependencies | `cross_project_deps` |
| File/symbol deep exploration | `get_file_summary`, `get_symbol`, `explore_component` |

**Initialization:** If the project is not registered, run `analyze_folder` first. If `tier2Status` is `pending`, run `trigger_tier2` to start SCIP indexing.

### When to Use Grep/Glob

Use Grep/Glob only when core-graph is **not suitable**:

- TypeScript `interface`/`type`/`class` kind-based filtering (SCIP classifies all as `class`)
- Regex pattern matching (e.g., `export interface \w+`)
- Text search within specific files
- Simple filename/path lookup

### shadcn-ui MCP (UI Components)

When working with shadcn/ui components, ALWAYS use the `shadcn-ui` MCP tools:

| Task | Tools |
| --- | --- |
| List available components | `list_components` |
| Get component source code | `get_component` |
| Get component usage demo | `get_component_demo` |
| Get component metadata | `get_component_metadata` |
| List pre-built blocks | `list_blocks` |
| Get block source code | `get_block` |
| List available themes | `list_themes` |
| Get theme details | `get_theme` |
| Apply theme preset | `apply_theme` |

**Use cases:**

- Adding or customizing shadcn/ui components → check source with `get_component` first
- Building page layouts → browse `list_blocks` for pre-built patterns
- Theming → use `list_themes` / `apply_theme` for consistent styling
- Understanding component API → use `get_component_demo` for usage examples

### Caveats

- core-graph results are snapshots from the last `analyze_folder` run — re-analyze after code modifications if needed

---

## Proactive Skill Usage

| Priority | Skill/Agent/MCP | When to Use |
| --- | --- | --- |
| 1 | `core-graph` MCP | Code analysis, refactoring, complexity/dependency/test gap assessment |
| 2 | `shadcn-ui` MCP | shadcn/ui component lookup, block patterns, theming |
| 3 | `/vercel-react-best-practices` | ALL React code |
| 4 | `/frontend-design` | Creating new UI components |
| 5 | `/web-design-guidelines` | Reviewing UI accessibility, UX |
| 6 | `mermaid-to-ascii` agent | ANY ASCII diagram (flowchart, sequence, etc.) |

---

## Code Style Summary

- **File naming:** kebab-case (`api-client.ts`, `use-query.ts`)
- **Language:** Korean explanations, English code/comments
- **Markdown:** Headings and tables MUST have a blank line between them
- **Symbols:** Use allowed symbols below (no emojis)
  - Status: ✔ (success), ✖ (error), ⚠ (warning), ℹ (info)
  - Severity: ● (critical), ◐ (high), ○ (medium/low)
  - Arrows: → ← ↑ ↓ (direction), ▶ ▷ (action/play)
  - Triangles: △ ▽ ▲ ▼ (expand/collapse, sort)
  - Markers: ★ (important), ◆ ◇ ◈ (key point), • ‣ (bullet)
  - Checkbox: ☐ (todo), ☑ (done), ☒ (rejected)
  - Misc: ※ (note), § (section), ≠ ≤ ≥ ≈ (comparison)
  - Box drawing: ─ │ ├ └ ┌ ┐ ┘ ┤ (ASCII diagrams)

---

## Post-Modification Verification

After ANY code modification:

1. `pnpm typecheck` - Fix ALL errors
2. `pnpm lint` - Fix ALL errors AND warnings
3. `pnpm build` - Verify build for affected packages
4. `pnpm docs:api` - Regenerate TypeDoc API docs (0 errors required, warnings allowed only for internal type references)
5. **Documentation Update** - MUST update documentation related to changes

### ★ Documentation Update (MANDATORY)

After completing ALL code modifications, the documentation update procedure below MUST be performed. NEVER finish work without updating documentation.

**Criteria for determining which documents to update:**

| Change Type | Documents to Update |
| --- | --- |
| New package added | CLAUDE.md (Project Overview table), package README |
| Public API changed | Package README, TSDoc comments |
| CLI command added/changed | CLI README, CLAUDE.md (Quick Reference) |
| New CRITICAL RULE added | CLAUDE.md (CRITICAL RULES section) |
| Config/workflow changed | CLAUDE.md (relevant section) |
| Bug fix | CHANGELOG (if exists) |

**Procedure:**

1. Identify the impact scope of the code changes
2. Determine affected documents from the table above
3. Sync document content with the current code state
4. Refer to `/doc-guidelines` skill to maintain documentation quality

---

## General Workflow Rules

Before attempting to implement a feature via an API method, verify the API actually supports the intended operation by reading its source code or documentation. Do not silently retry an approach that produces no visible effect — instead, stop and ask the user or investigate alternative methods.

---

## Testing & Verification

After applying a bug fix, always test the immediate fix AND adjacent/downstream behavior. A fix is not complete until side effects are verified.

---

## Sample Project Testing (pnpm link)

sample 프로젝트(예: `sample-petstore`)에서 로컬 simplix-react 패키지를 사용할 때, package.json을 직접 수정하지 않고 `pnpm link`를 사용한다.

**절차:**

```bash
# 1. 프로젝트 초기화
cd /Users/taehwan/Workspace/accesscore
simplix init <project-name> -y

# 2. 의존성 설치
cd <project-name>
pnpm install

# 3. OpenAPI spec 변환 (Swagger 2.0인 경우)
npx -y swagger2openapi <spec>.json -o <spec>-v3.json

# 4. 도메인 패키지 생성
simplix openapi <spec>-v3.json -y
pnpm install

# 5. 로컬 simplix-react 패키지 링크 (package.json 수정 없음)
pnpm link /Users/taehwan/Workspace/accesscore/simplix-react/packages/contract
pnpm link /Users/taehwan/Workspace/accesscore/simplix-react/packages/react
pnpm link /Users/taehwan/Workspace/accesscore/simplix-react/packages/form
pnpm link /Users/taehwan/Workspace/accesscore/simplix-react/packages/mock
pnpm link /Users/taehwan/Workspace/accesscore/simplix-react/packages/auth
pnpm link /Users/taehwan/Workspace/accesscore/simplix-react/packages/i18n
pnpm link /Users/taehwan/Workspace/accesscore/simplix-react/packages/testing
pnpm link /Users/taehwan/Workspace/accesscore/simplix-react/packages/cli

# 6. 빌드 검증
pnpm build
```

**주의사항:**

- `pnpm link`는 root `node_modules/@simplix-react/*`에 심링크를 생성하며, root package.json에 dependencies를 자동 추가한다 (이것은 정상 동작)
- 도메인 패키지의 package.json은 수정되지 않는다 (`simplix-react: ^0.1.3` 유지)
- peer dependency 경고가 나올 수 있으나, 빌드에 영향 없음
- CLI는 로컬 경로로 실행: `node /Users/taehwan/Workspace/accesscore/simplix-react/packages/cli/dist/bin.js`

---

## Quick Reference

| Task | Command |
| --- | --- |
| Build all | `pnpm build` |
| Typecheck | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Run tests | `pnpm test` |
| API docs | `pnpm docs:api` |
