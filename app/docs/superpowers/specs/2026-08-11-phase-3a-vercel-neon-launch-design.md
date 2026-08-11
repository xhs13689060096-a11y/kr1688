# Phase 3A Vercel, Neon, and Cloudflare Launch Design

## Purpose

Replace the retired Korea-trade site at `kr1688.com` with the accepted KR1688
story platform. The public canonical address is `https://kr1688.com`; requests
to `https://www.kr1688.com` permanently redirect to it.

## Confirmed resources

- DNS authority: Cloudflare for `kr1688.com`.
- Application host: Vercel account `jt6kbggd86-3765`.
- Production database: Neon project `kr1688-production`, AWS `eu-central-1`.
- Database authentication: Neon Auth is not enabled; KR1688 continues to use
  its existing Payload reader account model.
- Retired production target: Vercel project `kr1688-site`, currently holding
  both `kr1688.com` and `www.kr1688.com` aliases.

## Deployment design

Create a distinct Vercel project for the accepted repository branch
`marvis/ops-01-automated-acceptance`. Its first deployment is a Vercel preview
and must pass the existing quality gate plus browser smoke checks before either
production alias moves. The project uses the repository `app/` directory as its
root and Node.js 24, matching the existing Vercel account project runtime.

The initial production deployment is promoted only after the deployment has
valid production environment variables and the database schema initializes
against the Neon connection. No connection string is committed, printed, or
sent through chat.

## Secret and environment design

Production-only Vercel environment variables are:

| Variable | Source | Handling |
| --- | --- | --- |
| `DATABASE_URL` | Neon production connection string | The owner pastes it directly into Vercel; agents never receive the value. |
| `PAYLOAD_SECRET` | Generated locally at configuration time | Added directly to Vercel without logging its value. |
| `CRON_SECRET` | Generated locally at configuration time | Added directly to Vercel without logging its value. |
| `PREVIEW_SECRET` | Generated locally at configuration time | Added directly to Vercel without logging its value. |
| `NEXT_PUBLIC_SERVER_URL` | `https://kr1688.com` | Non-secret production setting. |

Preview deployments receive separate non-production secret values and a preview
URL. They do not use the production Neon database unless the owner explicitly
creates and assigns a separate Neon branch/connection later.

## Domain cutover and retirement

1. Add both domains to the new Vercel project and obtain Vercel's exact DNS
   requirements without changing DNS yet.
2. Validate the preview deployment: anonymous public reading, reader login,
   favorite/progress/comment flows, and Payload admin login.
3. Change the Cloudflare DNS records to the exact Vercel values for the new
   project. Configure Vercel so `kr1688.com` is canonical and `www.kr1688.com`
   redirects permanently to it.
4. Verify the live apex and `www` redirect with HTTPS, then retain a short
   recorded rollback window.
5. Delete Vercel project `kr1688-site` only after the new canonical site is
   healthy and the aliases are no longer attached to it. Do not delete the Git
   repository, `main`, or repository history.

## Explicit exclusions

- No Neon CLI initializer, Neon Auth, database password disclosure, or real
  credential in Git, terminal output, status files, or chat.
- No Cloudflare R2, payment, author submissions, recommendations, search/SEO
  expansion, native app, or Phase 3B work.
- No deletion of the old Vercel project before a healthy replacement owns both
  domain aliases.

## Acceptance evidence

The final Phase 3A record must name the Vercel deployment URL, exact Git SHA,
Cloudflare DNS state, browser smoke results, database migration/schema result,
and a rollback decision. GitHub Actions success remains necessary but is not
alone sufficient for production acceptance.
