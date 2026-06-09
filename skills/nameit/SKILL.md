---
name: nameit
description: Generates creative project codenames or names and creates the project directory. Use when the user is starting a new project and needs a name, codename, alias, or identifier for it. Also trigger when the user asks for naming suggestions, project name ideas, or says things like "help me name this project", "what should I call this", "give me a codename", "I need a project name", even if they don't explicitly say "codename".
metadata:
  version: "1.0.0"
  created: "2026-06-09"
  updated: "2026-06-09"
  author: gmqiyue
---

## What This Skill Does

Generate short, punchy project codenames based on the user's hints, then create the chosen name as a directory at the specified path.

## Naming Rules

- Maximum 2 words. One word is preferred when it works.
- Languages: English, Pinyin, or invented/coined words. Mix freely.
- If a candidate exceeds 2 words or 15 characters, offer an abbreviation alongside it (e.g., `NightOwl` → `nowl`).
- Final directory name: lowercase, no spaces. Multi-word joined with hyphen (e.g., `iron-bee`).
- Aim for personality — playful, unexpected, slightly weird names are better than safe generic ones. Think codenames, not product marketing.

## Naming Strategies

Pick from these approaches based on context. Combine freely:

- **Metaphor**: map the project's core idea to something unexpected (a build tool → `anvil`, a monitoring service → `lighthouse`)
- **Mashup**: smash two relevant words together (`logpilot`, `datamoth`, `rushfin`)
- **Pinyin twist**: use Chinese meaning with English spelling appeal (`kuaibao` 快报, `lingxi` 灵犀)
- **Coined word**: invent something that sounds good and feels right (`zephon`, `tarvex`, `quelm`)
- **Allusion**: subtle reference to mythology, science, animals, astronomy (`cygnus`, `mantis`, `redux`)
- **Sound-first**: pick for phonetic punch, meaning optional (`bonk`, `grux`, `navi`)

## Workflow

1. Read the user's description of what the project does or is about.
2. Generate candidates (3–5 个, no more than 5). For each candidate show:
   - The name (and abbreviation if long)
   - One short line explaining the vibe or reasoning
3. Let the user pick or request another round.
4. Once chosen, ask for the target parent directory if not already specified.
5. Create the directory: `mkdir -p <parent>/<chosen-name>`
6. Confirm the path created.

## Boundaries

- Don't suggest names longer than 2 words.
- Don't create files inside the directory — only `mkdir`.
- Don't suggest names that collide with common CLI tools or packages (e.g., `test`, `build`, `run`, `app`).
