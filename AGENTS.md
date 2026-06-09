# AGENTS.md

This file provides guidance to AI coding agents working with this repository.

## Project Overview

Agent skills collection — installable via `pnpx skills add`, compatible with Claude Code, Cursor, Codex, and 80+ other agents. Open-source project source code is managed as git submodules under `sources/`; skills are authored based on their documentation and source code.

## Commands

```bash
pnpm sync              # Sync git submodules to sources/ based on sources.yaml
pnpm exec tsc --noEmit # TypeScript type check (scripts/ only)
```

## Architecture

- `skills/<skill-name>/SKILL.md` — Skill definition, follows the [SKILL.md spec](https://agentskills.io/home)
- `sources/` — Open-source project git submodules, managed by `scripts/sync-sources.ts` via `sources.yaml`
- `sources.yaml` — Source project registry (repo / ref / sparse checkout / skill status)
- `templates/SKILL.md.template` — Starter template for new skills

## Creating Skills

### Authoring Rules

Strictly follow the [Skill Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) when authoring any skill.

- SKILL.md must not exceed 500 lines; put dense reference material in `references/` (one level deep)
- Frontmatter requires `name`, `description`, and `metadata` (version / created / updated / author)
- `description` should be specific, include trigger keywords, and define negative boundaries
- Use third-person imperative voice ("Extract the text..." not "You should...")
- One skill = one concern — no catch-all skills
- Keep terminology consistent across the entire skill

### What to Include

- Actionable instructions for the agent (commands, API calls, config patterns)
- Non-obvious defaults, pitfalls, and common mistakes
- Concrete examples (one example beats three paragraphs of explanation)

### What to Exclude

- User-facing introductions, getting-started guides, installation instructions
- General knowledge already in LLM training data
- Version history and changelogs
- Verbatim copies of upstream documentation

### Adding a Source Project

1. Add an entry in `sources.yaml` (repo required, ref defaults to main, sparse optional)
2. Run `pnpm sync` to add the submodule
3. Read `sources/<project>/` docs and source code, then author the skill under `skills/<name>/`
4. Set `skill: done` in `sources.yaml`
5. Update the skills table in README.md

### Skill Directory Structure

```
skills/<skill-name>/
  SKILL.md              # Required
  references/           # Optional, one level deep
  scripts/              # Optional
  assets/               # Optional
```

### Naming

- kebab-case, 1–64 characters, lowercase letters, digits, and hyphens only
- Directory name must match the `name` field in frontmatter

## Toolchain

- pnpm (not npm or yarn)
- TypeScript strict mode, ESM only
