# Obsidian Setup

Open the Notewell vault directory directly in Obsidian. The Markdown files are
the source of truth, so Obsidian does not need plugins for the baseline flow.

## Attachments

Use `raw/assets/` as the default attachment path. Screenshots, diagrams, PDFs,
and exported notes stay in `raw/`; durable summaries and concepts stay in
`wiki/`.

## Templates

Recommended template targets:

- `src/templates/wiki/source.md` for source summaries.
- `src/templates/wiki/concept.md` for Android, CS, and AI concepts.
- `src/templates/wiki/paper.md` for research paper notes.
- `src/templates/wiki/playbook.md` for repeatable debugging or engineering flows.
- `src/templates/wiki/analysis.md` for longer reasoning traces.

## Graph View

Use graph view to inspect whether concepts, papers, and playbooks are connected.
Orphan pages are not always wrong, but repeated orphan warnings usually mean a
page needs a durable link or should remain raw material.

## Daily Flow

```bash
notewell init .
notewell index .
notewell search "compose performance" .
notewell lint .
notewell log --type note "Updated Compose performance notes" .
notewell doctor .
```
