---
name: opensource-skill-creator
description: Creates agent skills from open-source project documentation and source code. Use when adding a new skill for a library, framework, or tool that lacks one. Reads docs in sources/ submodules and generates SKILL.md with proper frontmatter, progressive disclosure, and best practices compliance.
metadata:
  version: "1.0.0"
  created: "2026-06-09"
  updated: "2026-06-09"
  author: gmqiyue
---

## Workflow

1. Identify the target project in `sources/<project-name>/`
2. Locate documentation: look for `docs/`, `README.md`, API references, examples
3. Read source code for actual capabilities, CLI flags, configuration schemas
4. Determine skill scope — one skill per concern, not a monolith

## Analysis Priority

Focus on these in order:
1. **Core API / CLI commands** — what the tool actually does
2. **Configuration** — schemas, options, defaults, gotchas
3. **Common patterns** — how experienced users actually use it
4. **Error patterns** — what breaks and how to fix it
5. **Integration points** — how it connects to other tools

## What to Include

- Agent-actionable instructions (commands to run, files to edit, APIs to call)
- Non-obvious defaults, gotchas, and footguns
- Concrete examples (one example beats three paragraphs)
- Tool-specific terminology used consistently throughout

## What to Exclude

- Installation guides, getting started tutorials
- Conceptual introductions ("What is X?")
- Knowledge Claude already has from training data
- Version history, changelogs
- User-facing documentation prose

## Generating the SKILL.md

Structure the output as:

```yaml
---
name: <kebab-case, 1-64 chars, lowercase+numbers+hyphens>
description: <what it does + when to use it, be specific and slightly "pushy" for triggering>
---
```

Body rules:
- Under 500 lines total
- Third-person imperative voice ("Extract the text..." not "You should...")
- Step-by-step numbered workflows for multi-step operations
- Move dense reference material to `references/` subdirectory
- Use `references/` files one level deep only — no nesting
- All file paths use forward slashes
- Include negative boundaries ("Don't use for X")

## Quality Checklist

Before finalizing, verify:
- [ ] Description includes both what + when, with key terms
- [ ] SKILL.md body < 500 lines
- [ ] No time-sensitive info without deprecation markers
- [ ] Consistent terminology (pick one term per concept)
- [ ] Examples are concrete, not abstract
- [ ] File references are one level deep
- [ ] No content Claude already knows from training

## Reference

See `references/best-practices.md` for the full best practices guide.
