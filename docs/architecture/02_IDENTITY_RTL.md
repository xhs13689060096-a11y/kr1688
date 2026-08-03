# KR1688 Phase 2B T03 — Identity & RTL Global Base

**Date**: 2026-08-03
**Executor**: File Agent (Marvis)
**Task**: KR1688 identity and RTL global base
**Repository**: `https://github.com/xhs13689060096-a11y/kr1688`, branch `main`

---

## Overview

Replaced all Payload starter branding with KR1688 identity, established RTL (right-to-left) as the default document direction with `lang="ar"`, created a centralized `SiteSettings` global configuration, and updated the sitemap config.

## Changes Summary

### 1. Brand Identity Replacement

| Risk Item (T02) | File | Change |
|---|---|---|
| R2 | `src/components/Logo/Logo.tsx` | Replaced `<img>` loading Payload SVG from GitHub with pure text `<span>KR1688</span>`. No external dependency. |
| R4 | `src/plugins/index.ts` | `generateTitle` now returns `"KR1688 \| منصة القصص العربية"` as default; doc-specific titles use `"${doc.title} \| KR1688"` |
| R5 | `src/app/(frontend)/layout.tsx` | `twitter:creator` changed from `@payloadcms` to `@kr1688`; metadata `description` set to Arabic site description |
| R6 | `public/favicon.ico` | **Deleted** (Payload ICO) |
| R6 | `public/favicon.svg` | **Replaced** with custom KR1688 gradient SVG favicon |

### 2. RTL Global Base

| File | Change |
|---|---|
| `src/app/(frontend)/layout.tsx` | `<html lang="ar" dir="rtl">` — Arabic language + RTL direction; favicon link simplified to SVG only |
| `src/app/(frontend)/globals.css` | Added `--font-arabic` CSS variable with Arabic font stack (`Noto Naskh Arabic`, `Scheherazade New`, `Traditional Arabic`, `Arial`); `[dir='rtl']` selector sets `direction: rtl`, `text-align: right`, and Arabic body font |

### 3. Centralized SiteSettings Global

| File | Change |
|---|---|
| `src/globals/SiteSettings.ts` | **New file.** Payload Global with `siteName` (default `"KR1688"`), `siteDescription` (Arabic), `defaultLocale` (`"ar"`), `defaultDirection` (`"rtl"`). Public read access, admin-editable. |
| `src/payload.config.ts` | Imported `SiteSettings`; added to `globals: [Header, Footer, SiteSettings]` |

### 4. Sitemap Config

| Risk Item (T02) | File | Change |
|---|---|---|
| R1 | `next-sitemap.config.cjs` | Fallback URL changed from `https://example.com` to `https://kr1688.example.com` |

---

## Files Modified (9)

| # | Path | Operation |
|---|---|---|
| 1 | `src/components/Logo/Logo.tsx` | Rewritten |
| 2 | `src/app/(frontend)/layout.tsx` | Edited |
| 3 | `src/plugins/index.ts` | Edited |
| 4 | `public/favicon.svg` | Replaced |
| 5 | `public/favicon.ico` | Deleted |
| 6 | `src/globals/SiteSettings.ts` | Created |
| 7 | `src/payload.config.ts` | Edited |
| 8 | `src/app/(frontend)/globals.css` | Edited |
| 9 | `next-sitemap.config.cjs` | Edited |

---

## T02 Risk Items Resolved

All 6 risk items from T02 audit are now resolved:

- [x] R1: `next-sitemap.config.cjs` — `example.com` replaced
- [x] R2: `Logo.tsx` — GitHub Payload logo replaced with text
- [x] R3: `seed/index.ts` — deferred to T04 (requires Story model)
- [x] R4: `plugins/index.ts` — SEO title replaced
- [x] R5: `layout.tsx` — twitter:creator replaced
- [x] R6: `favicon.*` — replaced with KR1688 SVG

> **Note**: R3 (seed system) is intentionally deferred to T04/T05 where demo seed data will be created alongside the Story and Chapter models.

---

## RTL Font Note

The Arabic font stack uses system fonts that ship with macOS and Windows by default. For production, consider bundling a web font (e.g., Google Fonts `Noto Naskh Arabic`) via `next/font` in the layout for consistent rendering across platforms.

---

*Next task: T04 — Story Object model.*
