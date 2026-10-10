# Domain docs

Read the repository's domain documentation before exploring or updating docs.

## Required context

- Read the root `GLOSSARY.md`.
- Read ADRs under `docs/adr/` that affect the area being changed.
- If a file does not exist, continue without flagging its absence.

## Layout

This is a single-context repository:

```text
/
├── GLOSSARY.md
├── docs/
│   └── adr/
└── src/
```

## Vocabulary

Use the terms defined in `GLOSSARY.md` in issue titles, specifications, tests, and docs.

Do not replace defined terms with synonyms that the glossary tells you to avoid. If a needed concept is missing, note it for later domain-modeling work.

## ADR conflicts

Call out any proposal that contradicts an existing ADR. Identify the ADR and explain why the decision may need reconsideration instead of silently overriding it.
