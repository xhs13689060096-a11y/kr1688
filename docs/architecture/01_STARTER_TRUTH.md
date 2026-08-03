# KR1688 Phase 2B T02 — Starter Truth Audit

**Audit Date**: 2026-08-03
**Executor**: File Agent (Marvis)
**Repository**: `https://github.com/xhs13689060096-a11y/kr1688`, branch `main`
**Target**: `/app` directory — Payload Website Starter
**Phase 2B Goal**: Saudi-first Arabic story site, Payload 4 + Next.js 16

---

## Executive Summary

The `/app` directory contains **201 files** from the official Payload Website Starter. The starter provides a solid foundation: Payload CMS with MongoDB, Next.js 16 App Router, TypeScript, Lexical rich text, SEO/search/redirects plugins, layout builder, and shadcn/ui components.

### Key Findings

| Category | Count | % |
|---|---|---|
| reusable | 89 | 44.3% |
| retain | 32 | 15.9% |
| rewrite | 57 | 28.4% |
| risk | 6 | 3.0% |
| out-of-scope | 17 | 8.5% |
| **Total** | **201** | **100%** |

### Risk Items (6 — requires immediate attention)

| # | Path | Risk | Action |
|---|---|---|---|
| 1 | `next-sitemap.config.cjs` | Hardcoded `https://example.com` fallback | Replace with KR1688 domain placeholder |
| 2 | `src/components/Logo/Logo.tsx` | Hardcoded Payload logo SVG URL from GitHub | Replace with KR1688 logo |
| 3 | `src/endpoints/seed/index.ts` | Fetches images from `raw.githubusercontent.com`; hardcoded demo credentials | Replace seed system entirely for KR1688 demo data |
| 4 | `src/plugins/index.ts` | `generateTitle` returns `"Payload Website Template"` in SEO titles | Replace with KR1688 site name |
| 5 | `src/app/(frontend)/layout.tsx` | `twitter:creator` = `@payloadcms` | Replace with KR1688 twitter handle or remove |
| 6 | `public/favicon.ico` / `public/favicon.svg` | Payload branding favicons | Replace with KR1688 favicon |

### Rewrite Workload Estimate

- **Posts→Stories rename**: 22 files across `collections/Posts`, `app/(frontend)/posts/`, `blocks/RelatedPosts`, `heros/PostHero`, `hooks`, `tests/helpers`
- **Seed data replacement**: 13 files (all seed/*.ts + seed images)
- **Branding/Payload text**: 7 files (README, layout, plugins, BeforeDashboard, Logo, home seed content)
- **Form builder removal**: 17 files (entire `blocks/Form/` subtree)
- **Estimated effort**: ~4-6 hours for a developer familiar with the codebase

---

## Full Classification by Directory

### Root Config (`/app/`)

| Path | Category | Notes |
|---|---|---|
| `.editorconfig` | reusable | Standard editor config |
| `.env.example` | retain | Add KR1688-specific env vars; current vars are correct |
| `.gitignore` | reusable | Standard Next.js + Payload gitignore |
| `.npmrc` | reusable | pnpm config |
| `.prettierignore` | reusable | Standard ignore patterns |
| `.prettierrc.json` | reusable | Standard prettier config |
| `Dockerfile` | retain | Node 22.17.0 vs engine >=24.15.0 mismatch; review needed |
| `README.md` | rewrite | Full Payload Website Template text; replace with KR1688 project README |
| `components.json` | reusable | shadcn/ui config |
| `docker-compose.yml` | out-of-scope | Node 18, yarn — outdated; Phase 2B uses local MongoDB |
| `eslint.config.mjs` | reusable | Standard ESLint config |
| `next-sitemap.config.cjs` | risk | `https://example.com` fallback; robotsTxt excludes `/posts/*` |
| `next.config.ts` | retain | Vercel env refs; remove or keep for deployment flexibility |
| `package.json` | retain | `name: "website"` → `kr1688`; `description` → KR1688; verify dependency versions |
| `playwright.config.ts` | reusable | Standard Playwright config |
| `postcss.config.js` | reusable | Standard PostCSS config |
| `tailwind.config.mjs` | reusable | Tailwind v4 config |
| `test.env` | retain | Test environment vars |
| `tsconfig.json` | reusable | Standard TypeScript config |
| `vitest.config.mts` | reusable | Standard Vitest config |
| `vitest.setup.ts` | reusable | Standard Vitest setup |

### `.vscode/`

| Path | Category | Notes |
|---|---|---|
| `.vscode/extensions.json` | reusable | Recommended VS Code extensions |
| `.vscode/launch.json` | reusable | Debug launch config |
| `.vscode/settings.json` | reusable | VS Code workspace settings |

### `public/`

| Path | Category | Notes |
|---|---|---|
| `public/favicon.ico` | risk | Payload branding favicon; replace |
| `public/favicon.svg` | risk | Payload branding SVG favicon; replace |
| `public/website-template-OG.webp` | rewrite | Starter OG image; replace with KR1688 OG image |

### `src/access/`

| Path | Category | Notes |
|---|---|---|
| `src/access/anyone.ts` | reusable | Public access — useful for published stories |
| `src/access/authenticated.ts` | reusable | Auth check — needed for reader accounts |
| `src/access/authenticatedOrPublished.ts` | reusable | Published-or-authenticated — core pattern for stories |

### `src/app/(frontend)/`

| Path | Category | Notes |
|---|---|---|
| `(sitemaps)/pages-sitemap.xml/route.ts` | retain | Pages→Landing pages; keep pattern |
| `(sitemaps)/posts-sitemap.xml/route.ts` | rewrite | Posts→Stories; entire route needs rename |
| `[slug]/page.client.tsx` | reusable | Page client component |
| `[slug]/page.tsx` | retain | Page rendering; good pattern, keep for landing pages |
| `globals.css` | retain | Tailwind imports + custom CSS; add RTL support |
| `layout.tsx` | retain | `lang="en"`→`"ar"`; `@payloadcms` twitter→remove; Geist font for Arabic? |
| `next/exit-preview/route.ts` | reusable | Draft preview exit |
| `next/preview/route.ts` | reusable | Draft preview entry |
| `next/seed/route.ts` | rewrite | Triggers starter seed; replace with KR1688 seed |
| `not-found.tsx` | reusable | 404 page |
| `page.tsx` | reusable | Re-exports `[slug]/page` |
| `posts/[slug]/page.client.tsx` | rewrite | Posts→Stories |
| `posts/[slug]/page.tsx` | rewrite | Posts→Stories; slug-based story page |
| `posts/page.client.tsx` | rewrite | Posts→Stories archive client |
| `posts/page.tsx` | rewrite | Posts→Stories archive server |
| `posts/page/[pageNumber]/page.client.tsx` | rewrite | Posts→Stories pagination client |
| `posts/page/[pageNumber]/page.tsx` | rewrite | Posts→Stories pagination server |
| `search/page.client.tsx` | reusable | Search client component |
| `search/page.tsx` | reusable | Search page |

### `src/app/(payload)/`

| Path | Category | Notes |
|---|---|---|
| `admin/[[...segments]]/not-found.tsx` | reusable | Payload admin 404 |
| `admin/[[...segments]]/page.tsx` | reusable | Payload admin root |
| `admin/importMap.js` | reusable | Auto-generated by Payload |
| `api/[...slug]/route.ts` | reusable | Payload API route handler |
| `api/graphql-playground/route.ts` | reusable | GraphQL playground |
| `api/graphql/route.ts` | reusable | GraphQL endpoint |
| `custom.css` | retain | Admin panel custom CSS; add RTL admin styling |
| `layout.tsx` | reusable | Payload admin layout |

### `src/blocks/`

| Path | Category | Notes |
|---|---|---|
| `ArchiveBlock/Component.tsx` | retain | References `Post` type; rename to Story |
| `ArchiveBlock/config.ts` | retain | Archive block config; good pattern |
| `Banner/Component.tsx` | reusable | Banner display component |
| `Banner/config.ts` | reusable | Banner block config |
| `CallToAction/Component.tsx` | reusable | CTA display component |
| `CallToAction/config.ts` | reusable | CTA block config |
| `Code/Component.client.tsx` | reusable | Code block client |
| `Code/Component.tsx` | reusable | Code block server |
| `Code/CopyButton.tsx` | reusable | Copy button for code blocks |
| `Code/config.ts` | reusable | Code block config |
| `Content/Component.tsx` | reusable | Rich text content block |
| `Content/config.ts` | reusable | Content block config |
| `Form/Checkbox/index.tsx` | out-of-scope | Contact form — not needed for story site |
| `Form/Component.tsx` | out-of-scope | Form builder block |
| `Form/Country/index.tsx` | out-of-scope | Country field |
| `Form/Country/options.ts` | out-of-scope | Country options data |
| `Form/Email/index.tsx` | out-of-scope | Email field |
| `Form/Error/index.tsx` | out-of-scope | Form error component |
| `Form/Message/index.tsx` | out-of-scope | Form message component |
| `Form/Number/index.tsx` | out-of-scope | Number field |
| `Form/Select/index.tsx` | out-of-scope | Select field |
| `Form/State/index.tsx` | out-of-scope | State field |
| `Form/State/options.ts` | out-of-scope | State options data |
| `Form/Text/index.tsx` | out-of-scope | Text field |
| `Form/Textarea/index.tsx` | out-of-scope | Textarea field |
| `Form/Width/index.tsx` | out-of-scope | Width selector |
| `Form/config.ts` | out-of-scope | Form block Payload config |
| `Form/fields.tsx` | out-of-scope | Form field definitions |
| `MediaBlock/Component.tsx` | reusable | Media display block |
| `MediaBlock/config.ts` | reusable | Media block config |
| `RelatedPosts/Component.tsx` | rewrite | RelatedPosts→RelatedStories; `Post` type refs |
| `RenderBlocks.tsx` | reusable | Block renderer dispatcher |

### `src/collections/`

| Path | Category | Notes |
|---|---|---|
| `Categories.ts` | retain | Rename to Tags (genre tags for stories); keep nested docs |
| `Media.ts` | reusable | Good foundation; upload config, image sizes, folders — all needed |
| `Pages/hooks/revalidatePage.ts` | reusable | On-demand revalidation pattern |
| `Pages/index.ts` | retain | Pages→Landing pages; hero+layout builder pattern is good |
| `Posts/hooks/populateAuthors.ts` | rewrite | Posts→Stories |
| `Posts/hooks/revalidatePost.ts` | rewrite | Posts→Stories; revalidation hooks |
| `Posts/index.ts` | rewrite | Posts→Stories; core collection to reshape around Story model |
| `Users/index.ts` | retain | Add reader role; base auth is solid |

### `src/components/`

| Path | Category | Notes |
|---|---|---|
| `AdminBar/index.css` | reusable | Admin bar styling |
| `AdminBar/index.tsx` | reusable | Payload admin bar component |
| `BeforeDashboard/SeedButton/index.css` | rewrite | Seed button styling — replace seed system |
| `BeforeDashboard/SeedButton/index.tsx` | rewrite | Seed button — triggers starter seed |
| `BeforeDashboard/index.css` | retain | Dashboard welcome styling |
| `BeforeDashboard/index.tsx` | retain | Welcome message; update KR1688 context, links |
| `BeforeLogin/index.tsx` | retain | Login screen message; update KR1688 context |
| `Card/index.tsx` | retain | Post card; rename Post refs to Story |
| `CollectionArchive/index.tsx` | retain | Generic collection archive; good pattern |
| `Link/index.tsx` | reusable | Custom link component |
| `LivePreviewListener/index.tsx` | reusable | Live preview listener |
| `Logo/Logo.tsx` | risk | Hardcoded Payload logo URL; replace with KR1688 logo |
| `Media/ImageMedia/index.tsx` | reusable | Image display component |
| `Media/VideoMedia/index.tsx` | reusable | Video display component |
| `Media/index.tsx` | reusable | Media type dispatcher |
| `Media/types.ts` | reusable | Media type definitions |
| `PageRange/index.tsx` | reusable | Pagination range display |
| `Pagination/index.tsx` | reusable | Pagination component |
| `PayloadRedirects/index.tsx` | reusable | Redirect handler |
| `RichText/index.tsx` | reusable | Lexical rich text renderer |
| `ui/button.tsx` | reusable | shadcn/ui button |
| `ui/card.tsx` | reusable | shadcn/ui card |
| `ui/checkbox.tsx` | reusable | shadcn/ui checkbox |
| `ui/input.tsx` | reusable | shadcn/ui input |
| `ui/label.tsx` | reusable | shadcn/ui label |
| `ui/pagination.tsx` | reusable | shadcn/ui pagination |
| `ui/select.tsx` | reusable | shadcn/ui select |
| `ui/textarea.tsx` | reusable | shadcn/ui textarea |

### `src/cssVariables.js`

| Path | Category | Notes |
|---|---|---|
| `src/cssVariables.js` | retain | Payload CSS variable mappings; add RTL-aware variables |

### `src/endpoints/seed/`

| Path | Category | Notes |
|---|---|---|
| `contact-form.ts` | out-of-scope | Contact form seed — not needed for story site |
| `contact-page.ts` | out-of-scope | Contact page seed — not needed |
| `home-static.ts` | rewrite | "Payload Website Template" branding; replace with KR1688 |
| `home.ts` | rewrite | "Payload Website Template" text, GitHub links, English demo content |
| `image-1.ts` | rewrite | Payload starter image metadata |
| `image-2.ts` | rewrite | Payload starter image metadata |
| `image-hero-1.ts` | rewrite | Payload starter hero image metadata |
| `image-hero1.webp` | rewrite | Payload starter hero image (binary) |
| `image-post1.webp` | rewrite | Payload starter post image (binary) |
| `image-post2.webp` | rewrite | Payload starter post image (binary) |
| `image-post3.webp` | rewrite | Payload starter post image (binary) |
| `index.ts` | rewrite | Seed orchestrator; demo-author@example.com, fetches GitHub images |
| `post-1.ts` | rewrite | "Digital Horizons" — Payload demo blog post |
| `post-2.ts` | rewrite | "Global Gaze" — Payload demo blog post (ecommerce refs) |
| `post-3.ts` | rewrite | "Dollar and Sense" — Payload demo blog post (finance theme) |

### `src/environment.d.ts`

| Path | Category | Notes |
|---|---|---|
| `src/environment.d.ts` | reusable | TypeScript env type declarations |

### `src/fields/`

| Path | Category | Notes |
|---|---|---|
| `src/fields/defaultLexical.ts` | reusable | Lexical editor defaults |
| `src/fields/link.ts` | reusable | Link field definition |
| `src/fields/linkGroup.ts` | reusable | Link group field definition |

### `src/heros/`

| Path | Category | Notes |
|---|---|---|
| `HighImpact/index.tsx` | reusable | High impact hero component |
| `LowImpact/index.tsx` | reusable | Low impact hero component |
| `MediumImpact/index.tsx` | reusable | Medium impact hero component |
| `PostHero/index.tsx` | rewrite | PostHero→StoryHero; references Post type |
| `RenderHero.tsx` | reusable | Hero type dispatcher |
| `config.ts` | reusable | Hero field config |

### `src/hooks/`

| Path | Category | Notes |
|---|---|---|
| `src/hooks/populatePublishedAt.ts` | reusable | Auto-populate publishedAt |
| `src/hooks/revalidateRedirects.ts` | reusable | Redirect revalidation |

### `src/payload-types.ts`

| Path | Category | Notes |
|---|---|---|
| `src/payload-types.ts` | reusable | Auto-generated types; regenerate after collection changes |

### `src/payload.config.ts`

| Path | Category | Notes |
|---|---|---|
| `src/payload.config.ts` | retain | Posts→Stories; BeforeDashboard/BeforeLogin components need context updates; `folders` collection is good |

### `src/plugins/index.ts`

| Path | Category | Notes |
|---|---|---|
| `src/plugins/index.ts` | retain | `generateTitle` returns "Payload Website Template"; search on `posts`→`stories`; form builder plugin might be removable |

### `src/providers/`

| Path | Category | Notes |
|---|---|---|
| `src/providers/HeaderTheme/index.tsx` | reusable | Header theme context |
| `src/providers/Theme/InitTheme/index.tsx` | reusable | Theme initialization |
| `src/providers/Theme/ThemeSelector/index.tsx` | reusable | Theme selector (dark/light) |
| `src/providers/Theme/ThemeSelector/types.ts` | reusable | Theme selector types |
| `src/providers/Theme/index.tsx` | reusable | Theme provider |
| `src/providers/Theme/shared.ts` | reusable | Theme shared utilities |
| `src/providers/Theme/types.ts` | reusable | Theme type definitions |
| `src/providers/index.tsx` | reusable | Provider composition |

### `src/search/`

| Path | Category | Notes |
|---|---|---|
| `src/search/Component.tsx` | reusable | Search input with debounce |
| `src/search/beforeSync.ts` | retain | Syncs `posts` to search index; update to `stories` |
| `src/search/fieldOverrides.ts` | retain | Search field overrides |

### `src/utilities/`

| Path | Category | Notes |
|---|---|---|
| `src/utilities/canUseDOM.ts` | reusable | Browser detection |
| `src/utilities/deepMerge.ts` | reusable | Object deep merge |
| `src/utilities/formatAuthors.ts` | reusable | Author list formatting |
| `src/utilities/formatDateTime.ts` | reusable | Date formatting |
| `src/utilities/generateMeta.ts` | reusable | SEO meta generation |
| `src/utilities/generatePreviewPath.ts` | reusable | Preview path generation |
| `src/utilities/getDocument.ts` | reusable | Document fetcher |
| `src/utilities/getGlobals.ts` | reusable | Globals fetcher |
| `src/utilities/getMeUser.ts` | reusable | Current user fetcher |
| `src/utilities/getMediaUrl.ts` | reusable | Media URL helper |
| `src/utilities/getRedirects.ts` | reusable | Redirects fetcher |
| `src/utilities/getURL.ts` | reusable | Server/client URL helpers |
| `src/utilities/mergeOpenGraph.ts` | reusable | OpenGraph merge |
| `src/utilities/toKebabCase.ts` | reusable | String kebab-case conversion |
| `src/utilities/ui.ts` | reusable | Tailwind `cn()` utility |
| `src/utilities/useClickableCard.ts` | reusable | Clickable card hook |
| `src/utilities/useDebounce.ts` | reusable | Debounce hook |

### `src/Footer/`

| Path | Category | Notes |
|---|---|---|
| `src/Footer/Component.tsx` | retain | Footer component; remove Payload/GitHub links |
| `src/Footer/RowLabel.tsx` | reusable | Footer row label |
| `src/Footer/config.ts` | reusable | Footer global config |
| `src/Footer/hooks/revalidateFooter.ts` | reusable | Footer revalidation |

### `src/Header/`

| Path | Category | Notes |
|---|---|---|
| `src/Header/Component.client.tsx` | reusable | Header client component |
| `src/Header/Component.tsx` | retain | Header component; good foundation |
| `src/Header/Nav/index.tsx` | reusable | Navigation component |
| `src/Header/RowLabel.tsx` | reusable | Header row label |
| `src/Header/config.ts` | reusable | Header global config |
| `src/Header/hooks/revalidateHeader.ts` | reusable | Header revalidation |

### `tests/`

| Path | Category | Notes |
|---|---|---|
| `tests/e2e/admin.e2e.spec.ts` | retain | Admin E2E; update for new collections |
| `tests/e2e/frontend.e2e.spec.ts` | retain | Frontend E2E; update for Stories |
| `tests/helpers/login.ts` | reusable | Test login helper |
| `tests/helpers/seedRelatedPosts.ts` | rewrite | seedRelatedPosts→seedRelatedStories |
| `tests/helpers/seedUser.ts` | reusable | Test user seeder |
| `tests/int/api.int.spec.ts` | retain | API integration test; update for new collections |

### `redirects.ts` (root)

| Path | Category | Notes |
|---|---|---|
| `redirects.ts` | reusable | IE redirect; general redirect pattern is good |

---

## Critical Risks — Detailed Breakdown

### R1: `next-sitemap.config.cjs`
- **Issue**: Fallback URL `https://example.com`; robotsTxt disallows `/admin/*` which is fine, but sitemap exclusions reference `/posts/*` and `/posts-sitemap.xml`
- **Impact**: Broken sitemaps for search engines when deployed; wrong domain in sitemap URLs
- **Fix**: Replace fallback with KR1688 domain; update post→story sitemap paths

### R2: `src/components/Logo/Logo.tsx`
- **Issue**: Fetches logo from `https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-logo-light.svg`
- **Impact**: External dependency on GitHub raw content; shows Payload branding
- **Fix**: Replace with local KR1688 logo asset

### R3: `src/endpoints/seed/index.ts`
- **Issue**: Fetches seed images from `raw.githubusercontent.com/payloadcms/...`; creates `demo-author@example.com` / `password`; seeds Payload-branded content; footer links to Payload GitHub and payloadcms.com
- **Impact**: External network dependency at seed time; Payload branding in demo data; security (hardcoded demo credentials)
- **Fix**: Replace entire seed system with KR1688 demo data (one demo-only story in Arabic)

### R4: `src/plugins/index.ts` — SEO Plugin
- **Issue**: `generateTitle` returns `"... | Payload Website Template"`
- **Impact**: All pages have "Payload Website Template" in `<title>` tag
- **Fix**: Replace with KR1688 site name

### R5: `src/app/(frontend)/layout.tsx`
- **Issue**: `twitter: { creator: '@payloadcms' }`
- **Impact**: Twitter card metadata shows Payload handle
- **Fix**: Remove or replace with KR1688 handle

### R6: `public/favicon.ico` + `public/favicon.svg`
- **Issue**: Payload branding
- **Fix**: Replace with KR1688 favicon

---

## Rewrite Priority Map

### High Priority (T03-T04 dependencies)

| Files | Reason |
|---|---|
| `src/collections/Posts/**` (3 files) | Core collection to reshape into Stories (T04) |
| `src/plugins/index.ts` | SEO title branding blocks T03 identity work |
| `src/components/Logo/Logo.tsx` | Branding risk blocks T03 RTL global base |
| `src/app/(frontend)/layout.tsx` | lang/twitter blocks T03 RTL shell |
| `public/favicon.*` (2 files) | Branding risk blocks T03 |

### Medium Priority (T04-T06 dependencies)

| Files | Reason |
|---|---|
| `src/app/(frontend)/posts/**` (6 files) | Story routes needed for T04+T09 |
| `src/heros/PostHero/**` | Hero for story detail pages (T09) |
| `src/blocks/RelatedPosts/**` | Related stories block (T09) |
| `src/app/(frontend)/(sitemaps)/posts-sitemap.xml/**` | Sitemap for stories |
| `src/collections/Pages/**` | Landing pages (T09) |

### Low Priority (T09-T11)

| Files | Reason |
|---|---|
| `src/endpoints/seed/**` (13 files) | Replace with KR1688 demo seed (T04-T05) |
| `src/components/Card/**` | Update Post→Story type refs |
| `src/components/CollectionArchive/**` | Archive for stories |
| `README.md` | Documentation update (T11) |

---

## Out-of-Scope Items — Removal Candidates

| # | Path | Reason |
|---|---|---|
| 1-17 | `src/blocks/Form/**` (17 files) | Contact form builder; no forms needed in Phase 2B story site |
| 18 | `docker-compose.yml` | Outdated (Node 18, yarn); Phase 2B uses local MongoDB |
| 19 | `src/endpoints/seed/contact-form.ts` | Contact form seed data |
| 20 | `src/endpoints/seed/contact-page.ts` | Contact page seed data |

> **Note on form builder**: The `@payloadcms/plugin-form-builder` dependency should also be removed from `package.json` and `src/plugins/index.ts` if forms are out-of-scope. Consider keeping the plugin infrastructure but removing the block UI components if forms may be needed later for reader feedback.

---

## T03-T12 Priority Recommendations

| Task | Recommendation |
|---|---|
| **T03** (Identity+RTL) | Start immediately. Fix risk items R4-R6, set `lang="ar"`, replace logo/favicon, update SEO plugin title. Depends on no other task. |
| **T04** (Story model) | Start after T03 begins. Rewrite Posts→Stories collection. Keep access control and Lexical editor patterns. Add Arabic/Chinese title fields, `demoOnly` flag. |
| **T05** (Chapter model) | Can start in parallel with T04 after Posts→Stories rename settles. New collection, minimal dependencies. |
| **T06** (Media/R2) | Can start in parallel with T04-T05. Media collection is already well-structured; extend with Arabic alt, demo marker. |
| **T07** (Reader data) | Depends on T04 Story model. Needs `Stories` collection for Favorite/ReadingProgress relations. |
| **T08** (Comments) | Depends on T04+T05. Comments relate to stories and chapters. |
| **T09** (RTL loop) | Depends on T03-T08. Integration task pulling all models together. |
| **T10** (AI Tasks) | Depends on T04. AI tasks relate to stories. Can be done in parallel with T05-T08. |
| **T11** (Docs) | Can run in parallel with T09-T10. No code dependency. |
| **T12** (QA) | Final gate; depends on all T01-T11. |

### Suggested Execution Order

```
T03 ──┬── T04 ──┬── T07 ──┬── T09
      │         │         │
      ├── T05 ──┤         │
      │         │         │
      └── T06 ──┴── T08 ──┤
                           │
T10 ───────────────────────┤
                           │
T11 ───────────────────────┴── T12
```

---

## Files Requiring No Changes (reusable — 89 files)

<details>
<summary>Click to expand full list</summary>

- `.editorconfig`
- `.gitignore`
- `.npmrc`
- `.prettierignore`
- `.prettierrc.json`
- `.vscode/extensions.json`
- `.vscode/launch.json`
- `.vscode/settings.json`
- `components.json`
- `eslint.config.mjs`
- `playwright.config.ts`
- `postcss.config.js`
- `redirects.ts`
- `tailwind.config.mjs`
- `tsconfig.json`
- `vitest.config.mts`
- `vitest.setup.ts`
- `src/access/anyone.ts`
- `src/access/authenticated.ts`
- `src/access/authenticatedOrPublished.ts`
- `src/app/(frontend)/[slug]/page.client.tsx`
- `src/app/(frontend)/next/exit-preview/route.ts`
- `src/app/(frontend)/next/preview/route.ts`
- `src/app/(frontend)/not-found.tsx`
- `src/app/(frontend)/page.tsx`
- `src/app/(frontend)/search/page.client.tsx`
- `src/app/(frontend)/search/page.tsx`
- `src/app/(payload)/admin/[[...segments]]/not-found.tsx`
- `src/app/(payload)/admin/[[...segments]]/page.tsx`
- `src/app/(payload)/admin/importMap.js`
- `src/app/(payload)/api/[...slug]/route.ts`
- `src/app/(payload)/api/graphql-playground/route.ts`
- `src/app/(payload)/api/graphql/route.ts`
- `src/app/(payload)/layout.tsx`
- `src/blocks/Banner/Component.tsx`
- `src/blocks/Banner/config.ts`
- `src/blocks/CallToAction/Component.tsx`
- `src/blocks/CallToAction/config.ts`
- `src/blocks/Code/Component.client.tsx`
- `src/blocks/Code/Component.tsx`
- `src/blocks/Code/CopyButton.tsx`
- `src/blocks/Code/config.ts`
- `src/blocks/Content/Component.tsx`
- `src/blocks/Content/config.ts`
- `src/blocks/MediaBlock/Component.tsx`
- `src/blocks/MediaBlock/config.ts`
- `src/blocks/RenderBlocks.tsx`
- `src/collections/Media.ts`
- `src/collections/Pages/hooks/revalidatePage.ts`
- `src/components/AdminBar/index.css`
- `src/components/AdminBar/index.tsx`
- `src/components/Link/index.tsx`
- `src/components/LivePreviewListener/index.tsx`
- `src/components/Media/ImageMedia/index.tsx`
- `src/components/Media/VideoMedia/index.tsx`
- `src/components/Media/index.tsx`
- `src/components/Media/types.ts`
- `src/components/PageRange/index.tsx`
- `src/components/Pagination/index.tsx`
- `src/components/PayloadRedirects/index.tsx`
- `src/components/RichText/index.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/pagination.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/textarea.tsx`
- `src/environment.d.ts`
- `src/fields/defaultLexical.ts`
- `src/fields/link.ts`
- `src/fields/linkGroup.ts`
- `src/heros/HighImpact/index.tsx`
- `src/heros/LowImpact/index.tsx`
- `src/heros/MediumImpact/index.tsx`
- `src/heros/RenderHero.tsx`
- `src/heros/config.ts`
- `src/hooks/populatePublishedAt.ts`
- `src/hooks/revalidateRedirects.ts`
- `src/payload-types.ts`
- `src/providers/HeaderTheme/index.tsx`
- `src/providers/Theme/InitTheme/index.tsx`
- `src/providers/Theme/ThemeSelector/index.tsx`
- `src/providers/Theme/ThemeSelector/types.ts`
- `src/providers/Theme/index.tsx`
- `src/providers/Theme/shared.ts`
- `src/providers/Theme/types.ts`
- `src/providers/index.tsx`
- `src/search/Component.tsx`
- `src/utilities/*` (all 17 files)
- `src/Footer/RowLabel.tsx`
- `src/Footer/config.ts`
- `src/Footer/hooks/revalidateFooter.ts`
- `src/Header/Component.client.tsx`
- `src/Header/Nav/index.tsx`
- `src/Header/RowLabel.tsx`
- `src/Header/config.ts`
- `src/Header/hooks/revalidateHeader.ts`
- `tests/helpers/login.ts`
- `tests/helpers/seedUser.ts`

</details>

---

*End of audit. Next task: T03 — KR1688 identity and RTL global base.*
