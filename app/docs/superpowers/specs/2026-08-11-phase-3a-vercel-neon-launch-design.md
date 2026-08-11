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
`marvis/ops-01-automated-acceptance`. Its first deployment is a production
candidate on the project's generated Vercel hostname, not on either KR1688
domain. It uses the approved production Neon database for a tightly scoped
smoke check and must pass the existing quality gate plus browser smoke checks
before either production alias moves. The project is deployed from the
repository `app/` directory and uses Node.js 24, matching the existing Vercel
account project runtime.

The initial production deployment is promoted only after the deployment has
valid production environment variables and an explicit Payload migration has
initialized the Neon schema. Production must not rely on Drizzle development
push mode. The Vercel build runs pending migrations before the Next.js build;
if either step fails, Vercel rejects the candidate and the public aliases remain
on the retired project. No connection string is committed, printed, or sent
through chat.

## Secret and environment design

Production-only Vercel environment variables are:

| Variable | Source | Handling |
| --- | --- | --- |
| `DATABASE_URL` | Neon production connection string | The owner pastes it directly into Vercel; agents never receive the value. |
| `PAYLOAD_SECRET` | Generated locally at configuration time | Added directly to Vercel without logging its value. |
| `CRON_SECRET` | Generated locally at configuration time | Added directly to Vercel without logging its value. |
| `PREVIEW_SECRET` | Generated locally at configuration time | Added directly to Vercel without logging its value. |
| `NEXT_PUBLIC_SERVER_URL` | `https://kr1688.com` | Non-secret production setting. |

No preview database is available in the current Neon project. The isolated
Vercel-hostname candidate therefore uses the Production environment and Neon
connection only after all five required variables are present. Its smoke check
creates only the normal minimal reader/story/chapter/comment test data and is
performed before either public KR1688 domain is moved.

## Production schema design

- Commit an initial Payload PostgreSQL migration generated from the accepted
  configuration without connecting to or changing the production database.
- Add a dedicated `vercel-build` command that runs `payload migrate` before the
  normal production build.
- Exercise the same migration on GitHub Actions' disposable PostgreSQL service
  before accepting the deployment commit.
- Never use `migrate:fresh`, `migrate:reset`, or development push mode against
  Neon production. A failed migration blocks deployment and domain cutover.

## Domain cutover and retirement

1. Validate the isolated Vercel-hostname candidate: anonymous public reading, reader login,
   favorite/progress/comment flows, and Payload admin login.
2. Reassign both Vercel aliases in a single recorded cutover after the candidate
   passes. This is the actual routing switch; if the post-cutover checks fail,
   reassign both aliases immediately back to `kr1688-site`.
3. Change Cloudflare only if Vercel reports that the existing records do not
   satisfy the new project, then configure `www.kr1688.com` to redirect
   permanently to `kr1688.com`.
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
