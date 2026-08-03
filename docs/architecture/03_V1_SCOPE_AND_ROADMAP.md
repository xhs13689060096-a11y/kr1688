# KR1688 V1 Scope, Data Model & Future Roadmap

> **Phase 2B T11 — Documentation and future gates**
> Repository: `https://github.com/xhs13689060096-a11y/kr1688` | Branch: `main`

---

## 1. V1 Scope (Phase 2B)

Phase 2B delivers the **Saudi-first, Arabic-native product base** — a minimal, working foundation built on Payload CMS + Next.js App Router. It is not a complete platform.

### 1.1 Collections Implemented

| # | Collection | Slug | Purpose |
|---|---|---|---|
| 1 | **Stories** | `stories` | Core content: story metadata, bilingual titles/synopses, tags, genre, editorial/rights/risk status, cover image, demo flag |
| 2 | **Chapters** | `chapters` | Ordered chapters linked to a story, Arabic + Chinese body, draft/published/archived lifecycle, word count, demo flag |
| 3 | **Comments** | `comments` | Reader comments on stories or chapters, one-level reply (parent), moderation states (pending/approved/rejected/hidden), AI recommendation placeholder |
| 4 | **Favorites** | `favorites` | User-story bookmark; enforced uniqueness (one record per user per story) |
| 5 | **ReadingProgress** | `reading-progress` | Per-user per-story reading state: current chapter, progress percentage (0–100), last read timestamp, completed flag |
| 6 | **AITasks** | `ai-tasks` | Internal-only AI task queue: translation assist, metadata generation, comment moderation, SEO copy draft, performance insight. Output is **draft only** — cannot auto-publish. |
| 7 | **Media** (extended) | `media` | Upload collection extended with: media type (cover/audio/video/epub/image), Arabic alt text, rights status, source attribution, storage provider, demo flag |
| 8 | **SiteSettings** | `site-settings` | Global singleton: site name, description, default locale (`ar`), default text direction (`rtl`) |

> **Note**: The starter template collections `Categories`, `Pages`, `Posts`, `Users` and inline `folders` remain registered but are not Phase 2B deliverables. Only the above 8 represent Phase 2B work.

### 1.2 Public Page Routes

| Route | Component | Description |
|---|---|---|
| `/` | `(frontend)/page.tsx` | Arabic RTL home page; lists published stories with tags, cover, synopsis |
| `/stories/[slug]` | `stories/[slug]/page.tsx` | Story detail page: title, cover, synopsis, chapter list, tags |
| `/stories/[slug]/chapters/[chapterNumber]` | `stories/[slug]/chapters/[chapterNumber]/page.tsx` | Chapter reader: Arabic body via RichText, prev/next navigation, night mode, font size controls, approved comments section |

### 1.3 RTL / Arabic Support

- **HTML layer**: `layout.tsx` sets `<html lang="ar" dir="rtl">` globally for all public pages.
- **Default configuration**: SiteSettings global stores `defaultLocale: 'ar'` and `defaultDirection: 'rtl'`.
- **Content model**: Stories and Chapters carry Arabic-primary fields (`titleAr`, `synopsisAr`, `bodyAr`) with Chinese as secondary (`titleZh`, `synopsisZh`, `bodyZh`), organized in Payload tabs.
- **Metadata**: Page-level metadata description is Arabic (`منصة القصص العربية`).
- **Typography**: Geist Sans + Geist Mono fonts; CSS custom properties (`--font-sans`, `--font-mono`) for consistent rendering.

### 1.4 Access Control Model

Three access control primitives in `app/src/access/`:

| Primitive | Logic | Used By |
|---|---|---|
| `anyone` | Always returns `true` | Media read, SiteSettings read |
| `authenticated` | `Boolean(user)` — any logged-in auth-collection user | Comments CRUD, AITasks CRUD, Media create/update/delete, Favorites/ReadingProgress create |
| `ownerOrAdmin` | Returns `{ user: { equals: user.id } }` — only the document owner | Favorites read/update/delete, ReadingProgress read/update/delete |

Collection-level access patterns:

- **Stories**: Public read, authenticated-only write — inline `({ req: { user } }) => Boolean(user)`.
- **Chapters**: Public read hides `status: 'draft'`; authenticated users see all.
- **Comments**: Public read only sees `status: 'approved'`; authenticated users see all. Create/update/delete = authenticated.
- **Favorites / ReadingProgress**: All ops restricted to `ownerOrAdmin` (user sees only their own records); create = `authenticated`.
- **AITasks**: Entirely internal — all four CRUD ops = `authenticated`; no public read.
- **Media**: Read = `anyone`; write = `authenticated`.

> In V1, all authenticated auth-collection users are effectively admin-level. Role-based differentiation is reserved for a future release.

---

## 2. Data Model Overview

### 2.1 Stories (`stories`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `titleAr` | text | Yes | Use-as-title; Arabic primary |
| `synopsisAr` | richText | No | Arabic synopsis |
| `titleZh` | text | No | Chinese title |
| `synopsisZh` | richText | No | Chinese synopsis |
| `slug` | text (unique) | Auto | Generated from `titleAr` via beforeValidate hook |
| `tags` | array of `{ tag: text }` | No | Free-form tags |
| `authorName` | text | No | Author attribution |
| `genre` | text | No | e.g., فانتازيا, رعب, خيال علمي |
| `coverImage` | upload → media | No | Relationship |
| `totalChapters` | number | No | Admin-managed |
| `contentStatus` | select | No | draft / review / approved / published / retired |
| `editorialStatus` | select | No | candidate → briefed → drafting → qa → human-review → approved → released → retired |
| `rightsStatus` | select | No | unknown / reviewing / cleared / restricted / expired / rejected |
| `riskLevel` | select | No | none / low / medium / high |
| `riskNotes` | textarea | No | Risk annotation |
| `demoOnly` | checkbox | No | Default false |
| `publishedAt` | date | No | |

### 2.2 Chapters (`chapters`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `titleAr` | text | Yes | Use-as-title |
| `bodyAr` | richText | No | Arabic chapter body |
| `titleZh` | text | No | |
| `bodyZh` | richText | No | |
| `slug` | text (unique) | Auto | |
| `chapterNumber` | number | Yes | min 1 |
| `story` | relationship → stories | Yes | hasMany: false |
| `wordCount` | number | No | |
| `status` | select | No | draft / published / archived |
| `publishedAt` | date | No | |
| `demoOnly` | checkbox | No | |

### 2.3 Comments (`comments`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `body` | richText | Yes | |
| `author` | relationship → users | Yes | Auto-populated via beforeChange hook |
| `story` | relationship → stories | No | At least one of story/chapter required |
| `chapter` | relationship → chapters | No | |
| `parent` | relationship → comments | No | One-level reply |
| `status` | select | No | pending / approved / rejected / hidden |
| `moderationReason` | textarea | No | |
| `likeCount` | number | No | Admin read-only |
| `aiRecommendation` | select | No | Admin read-only; none / approve / reject / flag_review |

### 2.4 Favorites (`favorites`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `user` | relationship → users | Yes | |
| `story` | relationship → stories | Yes | |
| *Unique constraint* | user + story | — | Enforced in beforeValidate hook |

### 2.5 ReadingProgress (`reading-progress`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `user` | relationship → users | Yes | |
| `story` | relationship → stories | Yes | |
| `chapter` | relationship → chapters | No | Current chapter |
| `progressPercentage` | number | No | 0–100, default 0 |
| `lastReadAt` | date | No | |
| `completed` | checkbox | No | |
| *Unique constraint* | user + story | — | |

### 2.6 AITasks (`ai-tasks`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `taskType` | select | Yes | 5 types (see below) |
| `status` | select | No | queued / processing / draft_complete / approved / rejected / failed |
| `target` | relationship → [stories, chapters] | No | Polymorphic |
| `input` | json | No | |
| `output` | json | No | Draft only |
| `model` | text | No | |
| `promptVersion` | text | No | |
| `cost` | number | No | Virtual |
| `approvedBy` | relationship → users | No | |
| `error` | textarea | No | |
| `isDraftOutput` | checkbox | No | Default true |

### 2.7 Media (`media`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `alt` | text | No | Standard alt text |
| `altAr` | text | No | Arabic alt text |
| `mediaType` | select | No | cover / audio / video / epub / image |
| `rightsStatus` | select | No | unknown / reviewing / cleared / restricted / expired / rejected |
| `sourceUrl` | text | No | |
| `sourceLabel` | text | No | e.g., Unsplash, Pexels, Custom |
| `demoOnly` | checkbox | No | |
| `provider` | select | No | local / r2 |
| *Upload config* | staticDir → `public/media` | — | 7 image sizes + thumbnail + focal point |

### 2.8 SiteSettings (`site-settings`) — Global

| Field | Type | Required | Default |
|---|---|---|---|
| `siteName` | text | Yes | `KR1688` |
| `siteDescription` | textarea | Yes | Arabic description |
| `defaultLocale` | text | Yes | `ar` |
| `defaultDirection` | select | Yes | `rtl` |

### 2.9 Entity Relationship Summary

```
Users ──┬── Favorites ──── Stories ──┬── Chapters
        │                            │
        ├── ReadingProgress ─────────┤
        │                            │
        ├── Comments ──── Stories ───┘
        │         └────── Chapters
        │              └── Comments (parent)
        │
        └── AITasks ──── Stories
                  └────── Chapters

Media ←── Stories (coverImage)
Users ←── AITasks (approvedBy)
```

---

## 3. Reserved Capabilities

The following capabilities are **explicitly excluded from Phase 2B** and **reserved for future phases**. None of these have been implemented; all will be unlocked in subsequent releases.

| # | Capability | Target Phase | Notes |
|---|---|---|---|
| 1 | **Audio playback** | Phase 3+ | Media model supports `mediaType: 'audio'`; no player or streaming built |
| 2 | **EPUB reader** | Phase 3+ | Media model supports `mediaType: 'epub'`; no reader built |
| 3 | **Video** | Future (separate approval) | Media model supports `mediaType: 'video'`; requires separate infrastructure |
| 4 | **Subscription** | Phase 5 | Requires payment integration |
| 5 | **Donation (打赏)** | Phase 5 | Requires payment integration |
| 6 | **Single purchase** | Phase 5 | Per-story purchase flow |
| 7 | **Multi-language UI** | Phase 4+ | Currently Arabic-only; SiteSettings has locale field as placeholder |
| 8 | **Author role / dashboard** | Phase 3 | No author upload, dashboard, or revenue sharing |
| 9 | **External AI calls** | Phase 6 | AITasks collection is internal-only with virtual cost; no real API integration |
| 10 | **Payment** | Future (separate approval) | All monetization blocked |
| 11 | **R2 real connection** | Future (separate approval) | `.env.example` only; local storage works |
| 12 | **Real content** | Future (separate approval) | Only `demoOnly: true` seed data exists; 90 stories / 45 audio files not imported |
| 13 | **Search (Meilisearch)** | Future (separate approval) | Not installed or configured |
| 14 | **SEO (sitemap/RSS/JSON-LD)** | Future (separate approval) | No sitemap, RSS, JSON-LD, or IndexNow requests |
| 15 | **Recommendation engine** | Future | Not built |
| 16 | **Native App** | Future | Not built |

---

## 4. Phase 3–6 Roadmap Outline

### Phase 3: Content Production Pipeline

Build the author-facing toolchain: author role with dedicated dashboard, story/chapter upload and draft management, editorial workflow automation, bulk import tooling for the 90-story catalog, and basic translation assist integration. Enable the content supply chain from creation to publication-ready.

### Phase 4: User Growth & Community

Introduce reader accounts with profiles, multi-language UI (Chinese interface layer), social features (comment threading, likes, user reputation), reading lists, notifications, and basic analytics. Focus on retention loops and community-driven engagement around stories.

### Phase 5: Commercialization

Implement the monetization stack: subscription tiers, single-chapter / single-story purchases, donation (打赏) flow, payment gateway integration, reader wallet, and revenue attribution. Add author revenue sharing dashboard. All payment flows gated behind real authentication.

### Phase 6: AI Deep Integration

Connect AITasks to real AI models: live translation assist, automated metadata generation, AI-powered comment moderation, SEO copy generation, performance insight reports, and personalized story recommendations. Output remains draft-only with human approval gates.

---

## 5. Separately Approved Future Work

The following items require **independent approval** outside the Phase 2B–6 roadmap. They are not part of any Phase until explicitly greenlit:

| Item | Rationale |
|---|---|
| **Payment** | Requires PSP integration, compliance review, Saudi market payment rails |
| **R2 real connection** | Requires Cloudflare R2 account, production bucket, access keys |
| **Real content** | Requires rights clearance for all 90 stories and 45 audio files |
| **Video platform** | Requires CDN, encoding pipeline, separate infrastructure |
| **Search (Meilisearch)** | Requires deployment, index configuration, cost approval |
| **SEO** | Requires sitemap, RSS, JSON-LD, IndexNow, robots.txt — gated until content is real and site is production-ready |

---

## 6. Phase 2B Deployment Status

> **Phase 2B does not deploy. Does not connect production services.**

- All work runs locally against `mongodb://127.0.0.1/kr1688`.
- `.env.example` is the only committed environment file; no real secrets, keys, or tokens exist.
- All content is marked `demoOnly: true`.
- No external API calls, no production build, no CDN, no DNS.

---

*Document generated by T11 — 2026-08-03. Part of KR1688 Phase 2B acceptance gate.*
