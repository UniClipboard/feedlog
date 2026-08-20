<!--
Thanks for opening a PR! A few quick checks before you submit:

1. Have you signed off your commits? (git commit -s)
   FeedLog uses DCO, not CLA. No form to fill out — just `-s` on every commit.
2. Does your change need a discussion first?
   For anything non-trivial, please link the Issue or Discussion that led to it.
3. Does CI pass locally? `pnpm build` and a docker build are the bare minimum.
-->

## What this PR does

<!-- One or two sentences. Bullets for multi-part changes are fine. -->

## Why

<!-- Link the Issue, Discussion, or describe the user problem. -->

Closes #

## How to review

<!-- Any tips for the reviewer: where to start reading, what to try locally,
what NOT to worry about (e.g. an intentional-but-odd-looking change). -->

## Checklist

- [ ] Commits are signed off (`git commit -s`)
- [ ] Tests pass locally (`pnpm build`)
- [ ] If schema changed, migration was generated (`pnpm generate:migration`) and committed
- [ ] If public API or env vars changed, `README.md` / `.env.example` / `docs/deploy/*` updated
- [ ] No secrets, internal URLs, or team member names in the diff
