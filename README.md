# Wensenlijstje.nl

A Dutch wish-list app. Someone makes a list for a birthday, Sinterklaas, Christmas, a baby shower or a birth, shares one link, and friends mark what they will buy. The list owner does not see those reservations.

## Stack

- **Next.js (App Router) + TypeScript.** Server components render the owner page and the shared page separately, so reservation data is never sent to the owner.
- **Prisma + Postgres.** The same database works locally (Docker) and on Vercel (Neon).
- **Email and password.** Passwords are bcrypt hashes. Session tokens are random, stored only as an HMAC with `AUTH_SECRET`, and sent in an httpOnly cookie.
- **Tailwind CSS.** Mobile-first layout, with a warm paper look and a colour for each occasion.

## Run locally

Node.js 20 or newer, and Docker.

```bash
docker compose up -d
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account, make a list, add a gift, and open the share link in a private window.

`npm install` generates the Prisma client. `npm run dev` applies migrations and starts Next.js. The local database user, password and database name are all `wensenlijstje`, on port 5432.

If you already have a Neon database, skip Docker and put that branch’s pooled URL in `DATABASE_URL` and its direct URL in `DIRECT_URL`.

### Useful commands

```bash
npm test        # unit tests (parser, prices, claim privacy, gift filters)
npm run lint
npm run typecheck
npm run db:up   # start local Postgres
npm run e2e     # browser flow; needs Postgres running
```

## What the app does

- Sign up and sign in with email and password.
- Create lists with a name, an occasion (Verjaardag, Sinterklaas, Kerst, Babyshower, Geboorte, or Anders with your own text) and an optional date.
- Add gifts with a name and optional description, shop link, price, image URL and priority. Edit or delete them later.
- Paste a shop link and choose **Gegevens ophalen**. The server reads Open Graph and JSON-LD product data and prefills the form. You can still edit every field. If the shop does not respond, or the page has no product data, the link can be saved on its own.
- Each list has an unguessable share link. Visitors do not need an account.
- A visitor reserves a gift with **Ik koop dit** and their name. Other visitors see that reservation. The owner does not: the owner’s pages never query reservations, and opening the share link while logged in hides them too.
- The same browser can undo its own reservation. The owner should stay logged in; a logged-out visit to the share link shows the page the way guests see it.

Shop pages are fetched only for a signed-in owner, with a size limit, a timeout, and a block on local and private addresses. A normal product page that publishes Open Graph or JSON-LD (for example a Coolblue product) prefills the name, description, price and image. Some shops, including bol.com, refuse the request; the link stays in the form and the rest can be typed by hand.

## Cadeauzoeker

`/cadeauzoeker` is a separate inspiration page. Filter example gifts by recipient (man, vrouw, kind, baby, tiener), occasion, budget and interests, then add one to a list you already have.

The ideas live in [`src/data/gift-ideas.json`](src/data/gift-ideas.json). They are placeholder suggestions: indicative prices and shop **search** links, not a live catalogue. Edit that file to change them. Adding an idea copies its name, description, price and link onto a normal list item.

### Affiliate links later

Stored links stay clean. When a link is shown, `src/lib/affiliate.ts` can add a partner code:

| Environment variable | Effect |
| --- | --- |
| `AMAZON_NL_ASSOCIATE_TAG` | Adds `tag` on `amazon.nl` links |
| `BOL_SITE_ID` | Wraps `bol.com` links in a `partner.bol.com` click URL |

Leave both empty in development. Other shops are unchanged. Set the variables in the Vercel project when you have partner ids; existing list items pick them up without a rewrite.

## Deploying on Vercel

The build script already runs `prisma generate`, `prisma migrate deploy` and `next build`. Leave Vercel’s build command as the default (`npm run build`). Environment variables must be available at build time, not marked runtime-only, because migrations run during the build.

1. In Vercel, choose **Add New → Project** and import the GitHub repository. Accept the Next.js preset.
2. Open the project’s **Storage** or **Marketplace** tab and add **Neon Postgres**. Create a database and connect it to this project. Neon adds `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct).
3. In **Settings → Environment Variables**, set these for Production (and Preview, if preview deployments should work):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | The pooled Neon URL. If `pgbouncer=true` is missing, append `&pgbouncer=true`. |
   | `DIRECT_URL` | The same value as `DATABASE_URL_UNPOOLED` (no `-pooler` host). Migrations use this. |
   | `AUTH_SECRET` | Output of `openssl rand -base64 32`. At least 32 characters. |
   | `APP_URL` | Public origin, no trailing slash. Start with `https://<project>.vercel.app`, then switch to `https://wensenlijstje.nl` after the domain is connected. |

4. Deploy. `prisma migrate deploy` creates the tables on Neon.

### Custom domain

1. In the Vercel project, open **Settings → Domains** and add `wensenlijstje.nl` and `www.wensenlijstje.nl`.
2. At the registrar, add the DNS records Vercel shows. They are usually an **A** record for the apex (`76.76.21.21`) and a **CNAME** for `www` (`cname.vercel-dns.com`). Use the values on the Domains screen if they differ.
3. Wait until Vercel marks the domain valid, set `APP_URL` to `https://wensenlijstje.nl`, and redeploy so share links use that host.

Sessions live in Postgres, so more than one serverless instance can share them. Cookies are marked `Secure` in production. Share links always use `APP_URL` in production, not the incoming host header.

## Suggested next steps

- Password reset by email.
- A way to revoke a share link.
- Uploaded photos instead of image URLs only.
- A richer product catalogue, or a real affiliate feed, in place of the placeholder JSON.
- Shops that block datacenter IPs will keep failing the prefill; the manual form is the fallback, and a shop API would be more reliable than scraping.
- An explicit “show reservations” action for the owner, behind a warning, for when a gift has to be released.
