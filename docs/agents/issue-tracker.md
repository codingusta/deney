# Issue tracker: GitHub

Issues and specs for this repo live in GitHub Issues at `codingusta/deney`. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: `gh issue create --parent <parent> ...`, or `gh issue edit <parent> --add-sub-issue <child>` afterwards (`gh` 2.94+). For older versions, use the GitHub API. Without sub-issues, put `Part of #<parent>` at the top of the child body.
- **Comment on an issue**: `gh issue comment <number> --body "..."`.
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`.
- **Close**: `gh issue close <number> --comment "..."`.

Infer the repo from `git remote -v`; `gh` does this automatically inside the clone.

## Pull requests as a triage surface

**PRs as a request surface: no.**

When enabled, PRs use the same labels and states as issues. This repo does not currently treat PRs as triage requests.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Read it with `gh issue view` as described above.

## Wayfinding operations

- **Map**: one issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body.
- **Child ticket**: create a GitHub sub-issue linked to the map. Where sub-issues aren't enabled, add it to the map’s task list and put `Part of #<map>` at the top of the child body. Use `wayfinder:<type>` labels (`research` / `prototype` / `grilling` / `task`).
- **Blocking**: use GitHub native issue dependencies. Where unavailable, add a `Blocked by: #<n>` line to the child body.
- **Frontier query**: list the map’s open children, excluding assigned issues and issues with open blockers; use the first remaining child in map order.
- **Claim**: `gh issue edit <n> --add-assignee @me`.
- **Resolve**: comment with the answer, close the issue, then append a context pointer to the map’s Decisions-so-far.
