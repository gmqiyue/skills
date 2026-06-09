# Skill Authoring Best Practices Reference

## Progressive Disclosure (Three Levels)

| Level | What | When Loaded | Budget |
|-------|------|-------------|--------|
| L1 Discovery | `name` + `description` in frontmatter | Always in context | ~100 words |
| L2 Activation | SKILL.md body | When skill triggers | <500 lines |
| L3 Execution | `references/`, `scripts/`, `assets/` | On demand | Unlimited |

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No (defaults to dir name) | 1-64 chars, lowercase+numbers+hyphens |
| `description` | Recommended | What it does + when to use it (max 1024 chars) |
| `when_to_use` | Optional | Extra trigger context, appended to description |
| `argument-hint` | Optional | Autocomplete hint, e.g. `[issue-number]` |
| `arguments` | Optional | Named positional args for `$name` substitution |
| `disable-model-invocation` | Optional | `true` = only explicit `/skill-name` activation |
| `user-invocable` | Optional | `false` = hidden from menu, background knowledge only |
| `allowed-tools` | Optional | Tools allowed without permission during skill |
| `disallowed-tools` | Optional | Tools blocked during skill |
| `model` | Optional | Model override for this skill's turn |
| `effort` | Optional | `medium`, `high`, or `xhigh` |
| `context` | Optional | `fork` for isolated subagent context |
| `agent` | Optional | Subagent type when `context: fork` |
| `paths` | Optional | Glob patterns limiting auto-activation |

## Description Writing

The description is a **trigger mechanism**, not documentation. Claude does fuzzy matching against it.

Rules:
- Third person: "Processes Excel files..." not "I can help you..."
- Include what it does AND when to use it
- Include negative triggers: "Don't use for Vue or Svelte"
- Be slightly "pushy" to combat under-triggering
- Lead with the phrase a user would actually type

## Degrees of Freedom

| Level | Use When | Example |
|-------|----------|---------|
| High (text) | Multiple valid approaches | Code review guidelines |
| Medium (pseudocode) | Preferred pattern, some variation OK | Report generation |
| Low (exact scripts) | Fragile ops, consistency critical | Database migrations |

## Directory Layout

```
skill-name/
  SKILL.md              # Required: core instructions (<500 lines)
  scripts/              # Executable scripts (tiny CLIs)
  references/           # Supplementary context (ONE level deep)
  assets/               # Templates, static files
```

Keep reference files flat — `references/schema.md` not `references/db/v1/schema.md`.

For reference files >100 lines, add a table of contents at the top.

## Content Anti-Patterns

- Don't explain what Claude already knows from training
- Don't create README/CHANGELOG/INSTALLATION files
- Don't mix multiple concerns in one skill
- Don't use Windows-style paths
- Don't offer many options without a clear default
- Don't use inconsistent terminology
- Don't nest file references deeper than one level
