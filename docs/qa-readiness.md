# QA Readiness

This document records the minimum readiness gate for Space People Counter PRs.

## Scope

Story A adds automated CI coverage only. It does not change runtime behavior, map rendering, chart behavior, Cloudflare Pages Functions, Supabase, Core DB, secrets, or UI.

## Automated checks

GitHub Actions workflow: `.github/workflows/ci.yml`.

The workflow runs on:

- pull requests targeting `main`
- pushes to `main`
- manual `workflow_dispatch`

Required commands:

```bash
npm ci
npm run lint
npm run type-check
npm run build
```

## Install strategy

The repository includes `.npmrc` with `legacy-peer-deps=true`, so `npm ci` is the preferred reproducible install command while preserving the existing peer dependency strategy required by the project.

Do not replace `npm ci` with `npm install` unless CI proves that the lockfile or peer dependency state blocks reproducible installation. If that happens, document the exact failure and the smallest safe alternative.

## Manual smoke areas for future PRs

Because this story intentionally avoids runtime/UI changes, visual smoke testing remains manual until a later story adds browser automation.

Future PRs that touch runtime, map, charts, fallback states, or layout should verify:

- home route loads
- people counter renders live or degraded state clearly
- ISS map loads or shows an understandable fallback/loading state
- mission cards remain readable on desktop and mobile
- charts/visualization sections still render
- `/api/space-people`, `/api/iss-location`, and `/api/health` work in Cloudflare Pages Functions preview/production
- external CTA behavior does not create unexpected trust or conversion friction

## Known validation limitation from this PR

The ChatGPT container used for this implementation could not clone GitHub because DNS resolution for `github.com` failed. Repository review and file changes were therefore performed through the GitHub connector. The new workflow is expected to provide the authoritative install/lint/type-check/build validation after the PR opens.

## Constraints preserved

- No secrets added.
- No Supabase or Core DB work.
- No runtime changes.
- No map/chart/UI changes.
- No direct push to `main`.
