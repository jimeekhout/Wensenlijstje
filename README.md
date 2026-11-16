# Wensenlijstje.nl

A Dutch wish-list app. Someone makes a list for a birthday, Sinterklaas, Christmas, a baby shower or a birth, shares one link, and friends mark what they will buy. The list owner does not see those reservations.

## Stack

- **Next.js (App Router) + TypeScript.** Server components render the owner page and the shared page separately, so reservation data is never sent to the owner.
- **Prisma + SQLite.** Local development needs no extra database. The schema is small and portable.
- **Email and password.** A bcrypt hash and an httpOnly session cookie. No external auth service is required to run it.
- **Tailwind CSS.** Mobile-first layout, with a warm paper look and a colour for each occasion.

SQLite is a file on disk. Vercel’s serverless filesystem does not keep that file, so production should use Postgres. See [Deploying on Vercel](#deploying-on-vercel).

## Run locally

Node.js 20 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account, make a list, add a gift, and open the share link in a private window.

`npm install` generates the Prisma client. `npm run dev` applies the SQLite migration and starts Next.js.

### Useful commands

```bash
npm test        # unit tests (parser, prices, claim privacy, gift filters)
npm run lint
npm run typecheck
npm run e2e     # browser flow; downloads Playwright’s Chromium on first run
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

1. Create a Postgres database (Neon, Supabase or Vercel Postgres) and copy its connection string.
2. In `prisma/schema.prisma`, change the datasource provider from `sqlite` to `postgresql`.
3. The committed migration is SQLite SQL. Create a fresh Postgres migration against that database:

   ```bash
   rm -rf prisma/migrations
   npx prisma migrate dev --name init
   ```

   Commit the new `prisma/migrations` folder.
4. In the Vercel project, set `DATABASE_URL` to the Postgres connection string. Optionally set `APP_URL` (for example `https://wensenlijstje.vercel.app`) and the affiliate variables above.
5. Use this build command:

   ```bash
   prisma generate && prisma migrate deploy && next build
   ```

Sessions live in the database, so more than one serverless instance can share them. Cookies are marked `Secure` in production.

## Suggested next steps

- Password reset by email.
- A way to revoke a share link.
- Uploaded photos instead of image URLs only.
- A richer product catalogue, or a real affiliate feed, in place of the placeholder JSON.
- Shops that block datacenter IPs will keep failing the prefill; the manual form is the fallback, and a shop API would be more reliable than scraping.
- An explicit “show reservations” action for the owner, behind a warning, for when a gift has to be released.
