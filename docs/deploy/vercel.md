# Deploying FeedLog to Vercel

Vercel gives FeedLog a zero-config managed Node.js deployment with
automatic HTTPS, previews per branch, and generous free-tier bandwidth.
Bring your own Postgres. Vercel Blob is optional for file uploads.

## What you need

- A **Vercel account**
- A **Postgres 17+** with the `vector` extension, reachable over the public
  internet. Vercel partners with [Neon](https://vercel.com/marketplace/neon)
  and [Supabase](https://vercel.com/marketplace/supabase) for one-click
  Postgres — either works well. Self-hosted Postgres also fine.
- A **Vercel Blob store** if you want file uploads on feedback posts.

## One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flinkcraftstudio%2Ffeedlog&project-name=feedlog&repository-name=feedlog&env=DATABASE_URL,BETTER_AUTH_SECRET,SYSTEM_ADMIN_EMAILS&envDescription=DATABASE_URL%3A%20Postgres%20connection%20string%20with%20pgvector%20enabled%20(Neon%20or%20Supabase%20from%20the%20Vercel%20Marketplace%20works%20out%20of%20the%20box).%20BETTER_AUTH_SECRET%3A%2032%2B%20char%20random%20string%20(run%20%60openssl%20rand%20-hex%2032%60).%20SYSTEM_ADMIN_EMAILS%3A%20your%20email%2C%20granted%20admin%20role%20on%20first%20sign-up.&envLink=https%3A%2F%2Fgithub.com%2Flinkcraftstudio%2Ffeedlog%2Fblob%2Fmain%2Fdocs%2Fdeploy%2Fvercel.md)

Have your Postgres `DATABASE_URL` ready before you click the button. The
button forks the repo, prompts for the three minimum env vars
(`DATABASE_URL`, `BETTER_AUTH_SECRET`, `SYSTEM_ADMIN_EMAILS`), and starts
the first build.
Neon / Supabase from the Vercel Marketplace is fastest; see manual setup
below for the full flow.

## Manual setup

### 1. Provision Postgres

Use Neon or Supabase from the Vercel Marketplace, or any managed provider.

**Enable pgvector**: most Postgres hosts require you to run this once:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Neon and Supabase both enable it via their UI.

Save the `DATABASE_URL` — Vercel will inject it as an env var.

### 2. Import the repo into Vercel

- Vercel dashboard → Add New → Project → Import your fork of
  `linkcraftstudio/feedlog` (or the upstream repo if you haven't forked).
- Framework preset: **Nuxt** (auto-detected).
- Build command: keep the repository default from `vercel.json`
  (`pnpm build:vercel`, which runs `pnpm migrate` then a Vercel-preset Nuxt
  build).
- Output directory: `.output` (default).

### 3. Set environment variables

Vercel dashboard → your project → Settings → Environment Variables.

**Required — 3 variables:**

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Postgres connection string (with `?sslmode=require` for managed providers) |
| `BETTER_AUTH_SECRET` | 32+ char random string (`openssl rand -hex 32`) |
| `SYSTEM_ADMIN_EMAILS` | Your email (comma-separated if multiple). First user who signs up with one of these gets admin role. **Must be set before the first sign-up — otherwise the install has no admin.** |

With these three, the app boots, auto-enables email + password login (since
no OAuth is configured), and seeds default boards plus a welcome post on
first startup. The first user who signs up with a whitelisted email becomes
admin.

To enable OAuth sign-in (nicer UX than email + password), also set one of:

| Option | Variables |
|--------|-----------|
| GitHub OAuth (recommended — 5 min setup) | `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` |
| Google OAuth | `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` |

OAuth apps need their callback URL set to
`https://<your-url>/api/auth/callback/<github\|google>` before sign-in will
complete.

**Optional — everything else:**

| Variable | Purpose |
|----------|---------|
| `BETTER_AUTH_URL` | Only set if you host behind a Host-rewriting proxy. Normally inferred from the request. |
| `RESEND_API_KEY` | Enables transactional email. When set, email verification auto-activates. |
| `OPENAI_API_KEY` / `OPENAI_BASE_URL` | AI features (similar-idea merge, AI changelog drafts). |
| `AUTH_EMAIL_ENABLED` / `AUTH_EMAIL_VERIFY` | Force-toggle email login or verification if the auto rules don't fit. |

See the **[configuration reference](../configuration.md)** for the
complete list of environment variables grouped by purpose, or
[`.env.example`](../../.env.example) for the annotated source.

### 4. Enable Vercel Blob storage (optional)

File uploads on feedback posts need a blob store. Vercel has a native
Blob product that wires up in two clicks:

- Vercel dashboard → your project → **Storage** → **Connect Store** →
  **Blob** → create a new store (or select an existing one).
- Vercel auto-connects the store to your project and injects the
  `BLOB_READ_WRITE_TOKEN` env var. No manual config needed on your end.

Redeploy once (push any commit, or dashboard → Deployments → Redeploy)
so the new env var reaches the running functions. Uploads work after
that.

If you skip this step, the app still runs, but the `POST /api/upload`
endpoint returns 500 with `BLOB_READ_WRITE_TOKEN is missing`. Only users
who try to attach images will notice.

### 5. Deploy

Push to `main` (or whichever branch you configured) and Vercel will build
and deploy automatically.

Migrations run at build time on Vercel — `vercel.json` in the repo sets
`buildCommand: "pnpm build:vercel"`, which runs `drizzle-kit migrate`
against `DATABASE_URL` and then a Vercel-preset Nuxt build. A migration
failure aborts the deploy and leaves the previous version serving
traffic, so a bad schema change never reaches production.

Requirements for this to work:
- `DATABASE_URL` must have **Preview** and **Production** checked in the
  Vercel env settings — build containers read env vars from those scopes.
- Your Postgres must be reachable from Vercel's build IPs (Neon / Supabase
  on public internet work out of the box; self-hosted DBs behind a VPN
  will not).

First build takes ~2 minutes. Subsequent builds that include no new
migrations re-run `drizzle-kit migrate` as a near-instant no-op.

> FeedLog runs migrations at _build_ time on Vercel (the build container
> has the `DATABASE_URL`), and at _runtime_ via a `/setup` page on
> Cloudflare Workers (Workers have no startup phase to run migrations
> in). Both end states are identical — only _when_ migrations run differs.

### 6. Set up a custom domain (optional)

Vercel dashboard → your project → Settings → Domains. Point your DNS at
Vercel's targets. If you added the optional `BETTER_AUTH_URL` env var,
update it to the new domain and redeploy — otherwise auth URLs are
inferred from the request host and no change is needed.

## Updating

```bash
git pull    # pull latest feedlog main
git push    # triggers Vercel auto-deploy; migrations run in the build step
```

## Common issues

### Build fails with "Cannot find module 'nitropack'" or similar

Vercel may have cached an incompatible `node_modules`. Force a clean build
by changing `pnpm install` to `pnpm install --force` in the project
settings, redeploy once, then revert.

### Deployment succeeds but `/api/boards` returns 500

Open Vercel's Runtime Logs for the project. Most common causes:
- `DATABASE_URL` missing `?sslmode=require` (required by Neon / Supabase)
- `pgvector` extension not enabled in the database
- Build completed before `DATABASE_URL` was set — redeploy after adding the
  env var so `vercel.json`'s `pnpm build:vercel` can see it

### OAuth "redirect_uri_mismatch"

Your OAuth app's callback URL must match
`https://<your-deployment-url>/api/auth/callback/<provider>` exactly.
Remember to add both the `*.vercel.app` URL and any custom domain.

### Cold-start latency on the free tier

Vercel's free tier cold-starts Serverless Functions on first request after
idle. FeedLog's first load is ~500ms–1s cold. If that bothers users,
upgrade to Vercel's Pro plan which keeps functions warm, or switch to the
[Docker deploy](./docker.md) on a long-running VPS.

### Hobby plan: deployment blocked because commit author isn't a team member

On the Hobby plan Vercel refuses to deploy commits whose Git author isn't
a member of your Vercel team — the deployment shows up as **Blocked** with
no build logs. This bites when you push commits authored by an upstream
maintainer (e.g. cloning + pushing without re-authoring).

Re-author the offending commits to your own identity and force-push:

```bash
# Replace <base> with the last good SHA before the blocked commits.
git rebase <base> --exec \
  'git commit --amend --no-edit --author="Your Name <you@example.com>"'
git push --force-with-lease
```

Or upgrade to Pro, which doesn't enforce this restriction.

## Next steps

- **[Docker deploy](./docker.md)** — full self-hosting
- **[Cloudflare Workers deploy](./cloudflare-workers.md)** — edge serverless
