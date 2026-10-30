# Security: dependency remediation (2026-10-29)

## Scope and evidence

Repository: `elelier/space-people-counter`. Base: `main` at `36a7c721d6bb4ba4dbdfec91852b33374cf23ca8`.
Review: [PR #38](https://github.com/elelier/space-people-counter/pull/38).
CI evidence: [GitHub Actions run #40989931191](https://github.com/elelier/space-people-counter/actions/runs/40989931191).
The project exports static Next.js pages (`output: 'export'` and `images.unoptimized: true`). Runtime APIs are separate Cloudflare Pages Functions under `functions/api`; there is no Next.js HTTP application server in this deployment configuration.

The Cloudflare deployment log on 2026-10-29 showed **1 critical, 10 high, 3 moderate** alerts (14). A prior full npm audit of the base lockfile reported **1 critical, 25 high, 12 moderate, 1 low** (39); the original audit JSON was not preserved, so this baseline is historical evidence rather than a newly reproduced scan. The full npm audit of the updated lockfile was executed in run #40989931191:

| Severity | Earlier full audit | Updated lockfile |
|---|---:|---:|
| Critical | 1 | **0** |
| High | 25 | **0** |
| Moderate | 12 | **0** |
| Low | 1 | **0** |
| Total | 39 | **0** |

`npm audit --omit=dev --audit-level=high` also returned **0 vulnerabilities**. Future PRs must pass `npm audit --audit-level=high`; this is a gate, not a substitute for review of runtime exploitability.

## Remediation and direct/transitive risk

| Component | Former resolution | Updated resolution | Reason and production relevance |
|---|---|---|---|
| `next` (direct) | 14.2.35 | **15.5.28** | Unsupported 14.x receives no October 2026 security fixes. App Router cache-components RCE ([GHSA-673q-mjm6-r5xr](https://github.com/advisories/GHSA-673q-mjm6-r5xr)), image SVG RCE ([GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw), CVE-2026-96889), and Server Actions DoS ([GHSA-p3m5-59mp-jv5r](https://github.com/advisories/GHSA-p3m5-59mp-jv5r)). App is statically exported: affected dynamic server/image endpoints are not exposed; upgrading removes vulnerable dependency nevertheless. |
| `sharp` (optional transitively through Next) | version on base lockfile not separately recorded | **0.35.5** | Fixed SVG image-processing library. Runtime remote image optimization is disabled, but fix is installed for defense in depth. |
| `postcss` (transitive via Next) | nested **8.4.31** on the first upgraded lockfile | **8.5.32** (single root resolution) | Older Next 15 still pins a vulnerable PostCSS. GHSA-qx2v-qp2m-jg93 (CSS XSS), GHSA-6g55-p6wh-862q / GHSA-fxqj-rqcc-2cmp / GHSA-r28c-9q8g-f849 (source-map file disclosure/traversal). Primarily build-time for this static project; still fixed through explicit npm `overrides`. |
| `react`, `react-dom` (direct) | 18.2.0 | **19.3.1** | Required by App Router in Next 15 and incorporates October 2026 upstream React security fixes. |
| `react-leaflet` (direct) | 4.2.1 | **5.0.0** | React Leaflet 5 requires React 19. Map behavior and CSS must be checked visually in Preview, in addition to code regression tests. |
| `eslint` (dev) and `eslint-config-next` (dev) | 8.57.1 and 14.2.15 | **9.39.5** and **15.5.28** | Update toolchain and transition from `.eslintrc` to flat `eslint.config.mjs`. Dev-only packages are not equivalent to server-side production exploit paths. |

The `overrides.postcss = '^8.5.32'` override is deliberate and bounded to this vulnerable package, required because Next 15.5.28 pins `postcss@8.4.31`; remove it only when a verified Next release no longer resolves vulnerable PostCSS. The direct PostCSS range is identical to the override to satisfy npm's override consistency rules. **No `npm audit fix --force` was run.**

## Compatibility changes and checks

- `src/app/robots.ts` and `src/app/sitemap.ts`: explicit `dynamic = 'force-static'` is required by Next 15 static export; outputs are still prerendered and SEO URLs unchanged.
- Next 15 App Router + React 19 + React Leaflet 5, with the existing `MapContainer`, tile and follow/navigation code preserved. No application redesign, API contract changes or new services.
- Passed in the linked GitHub Actions run on Node.js 22: `npm ci`, `npm run lint`, `npm run type-check`, all source/runtime and API contract checks, counter delta, historical dates, map attribution/navigation/follow/orbital-speed tests, sharing tests, `npm run build`, full `npm audit`, and production-scope audit.
- **39 unit/contract regression tests passed** (runtime 6, counter 3, history 3, attribution 4, navigation 2, follow 5, orbital speed 6, share 10).
- `next build` successfully produced static `/`, `/robots.txt`, `/sitemap.xml`, `/404`, and `out/` exports.

## Residual and release decision

Dependency advisories remaining in the audited lockfile: **none**. This does not demonstrate absence of vulnerabilities in authored application code or remote services.

**Release remains NO-GO until** Cloudflare Pages Preview for this final head is verified for daytime/nighttime map tiles, marker visibility, tracking, zoom, attributions, roster, missions, history, sharing, SEO metadata and mobile layout. Validate that Cloudflare builds the static `out/` and preserves the separate `functions/api` endpoints. Do not merge or deploy to production before owner approval.

Next 15 is Maintenance LTS (security support through 2027-01-31); plan transition to Next 16 Active LTS separately, not inside this patch. ESLint 9 emitted an upstream deprecation notice during npm install; it is a development-only maintenance follow-up, not an unresolved npm advisory. Avoid conflating Node/runner or library deprecation notices with exploitable runtime findings.

References:
- Next.js October security update: https://nextjs.org/blog/nextjs-security-update-october-14-2026
- Next.js 15 migration and static export: https://nextjs.org/docs/15/app/guides/upgrading/version-15 and https://nextjs.org/docs/15/app/guides/static-exports
- React Leaflet v5 breaking changes: https://github.com/PaulLeCam/react-leaflet/blob/master/CHANGELOG.md
- npm PostCSS advisory: https://github.com/advisories/GHSA-r28c-9q8g-f849
