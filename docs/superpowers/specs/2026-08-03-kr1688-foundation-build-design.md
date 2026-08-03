# KR1688 Foundation Build Design

## Goal

Start KR1688 as a Saudi-first, Arabic-native story product inside `/kr1688`, using an official Payload website-style foundation that can later grow into the broader AI publishing platform.

## Scope of this build slice

This slice is only the foundation build. It covers:

- project workspace structure inside `/kr1688`
- official starter selection
- runtime and package manager baseline
- first app bootstrap boundary
- initial product and data direction docs inside the workspace

This slice does not cover:

- production deployment
- payment
- search engine indexing
- author ecosystem
- recommendation system
- Meilisearch
- real AI generation pipelines

## Chosen approach

Use the official Payload website-style starter as the base direction for KR1688, because it gives us the fastest path to a content-first site with CMS ownership, while keeping the project ready for structured story objects, Arabic RTL rendering, comments, and future audio/video expansion.

Inside the repository, KR1688 remains fully isolated under `/kr1688`. PV stays under `/pv` and must not be touched by KR1688 build steps.

## Architecture for this slice

- Workspace root: `/kr1688`
- App direction: Payload website foundation
- Product direction: Saudi-first, Arabic-native reading/community site
- Future content model direction: Story, Chapter, Media, Comment, Favorite, ReadingProgress, AI_Task

## Starter decision

Recommended path:

1. bootstrap KR1688 from the official Payload website-style starter
2. keep the starter as a temporary foundation, not as product truth
3. immediately reshape naming, docs, and content schema around KR1688 requirements

Fallback path if network/bootstrap is blocked:

1. create a local no-dependency skeleton under `/kr1688`
2. write package and directory contracts
3. defer external starter import to the next step

## Boundaries

- All KR1688 build assets stay under `/kr1688`
- No PV deploy scripts, docs, or app files may be modified by KR1688 bootstrap
- No root compatibility links are needed for KR1688 at this stage
- No deployment credentials, Vercel linking, or database secrets are configured in this slice

## Verification

Foundation build is considered successful when:

- `/kr1688` contains a real project skeleton instead of only a placeholder README
- starter choice and workspace rules are documented inside `/kr1688`
- the project can be inspected by AI and future executor agents without ambiguity
- the repository split between `/pv` and `/kr1688` remains intact
