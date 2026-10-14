# Domain Docs

How engineering skills should consume this repo's domain documentation.

## Before exploring, read these

- `GLOSSARY.md` at the repo root.
- `docs/adr/` for decisions that touch the area being changed.

If these files don't exist, proceed silently. Don't flag their absence or suggest creating them upfront. Create them when terms or decisions are resolved through domain modeling.

## File structure

This is a single-context repo:

```
/
├── GLOSSARY.md
├── docs/adr/
└── proje2/
```

## Use the glossary's vocabulary

When output names a domain concept (in an issue title, refactor proposal, hypothesis, or test name), use the term defined in `GLOSSARY.md`. If a needed concept isn't there, reconsider the wording or note the gap for domain modeling.

## Flag ADR conflicts

If output contradicts an existing ADR, surface the conflict explicitly rather than silently overriding it.
