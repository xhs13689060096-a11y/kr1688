# KR1688 — منصة القصص العربية

Saudi-first, Arabic-native story platform. Built with Payload CMS and Next.js.

This is the KR1688 application workspace — a content management and publishing platform for Arabic stories with RTL-first design, chapter-based reading, user favorites, and reading progress tracking.

## Tech Stack

- **CMS**: Payload CMS 4.x
- **Frontend**: Next.js 15 + Tailwind CSS
- **Runtime**: Node.js >=24.15
- **Database**: PostgreSQL
- **Testing**: Vitest (integration), Playwright (E2E)

## Quick Start

```bash
pnpm install
cp .env.example .env
# Edit .env with your PostgreSQL DATABASE_URL and PAYLOAD_SECRET
pnpm dev
```

## Project Structure

```
app/
├── src/
│   ├── access/         # Access control functions
│   ├── collections/    # Payload collections (Stories, Chapters, Users, Comments, etc.)
│   ├── components/     # React components
│   ├── app/            # Next.js app router pages
│   └── seed/           # Seed data for development
├── tests/
│   ├── int/            # Integration tests (Vitest)
│   └── e2e/            # End-to-end tests (Playwright)
└── vitest.config.mts   # Test configuration
```

## Collections

| Collection | Purpose |
|-----------|---------|
| Stories | Arabic stories with RTL metadata |
| Chapters | Story chapters with numbered sequencing |
| Users | Reader/admin accounts with role-based access |
| Comments | Story/chapter comments with moderation |
| Favorites | User story bookmarks |
| ReadingProgress | Per-user chapter reading tracking |
| Folders | Organizational folders |

## Permanent Guardrails

- No deployment/Vercel, cloud credentials/services
- No real content/assets
- No payment, author system, Meilisearch, recommendations
- No native app, sitemap, RSS, JSON-LD, IndexNow
- No SEO/search/reindex plugins
- No Phase 3A work

## License

Private — KR1688 Project
