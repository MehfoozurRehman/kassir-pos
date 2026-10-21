# Kassir POS

A monorepo with an Electron cashier terminal for checkout and a Next.js admin panel for managing shops, payments and sales, orchestrated with Turborepo.

## The problem

A store needs two things that work differently: a checkout desktop at the till, and a web panel for the back office. Keeping both in one repository, with shared tooling and one build pipeline, makes changes to each easier to coordinate.

## What it does

- **Cashier terminal** (`apps/pos-electron`). An Electron app with a sign-in form, sidebar navigation, a barcode input component and image upload components. Its data lives in a local JSON database (lowdb) under the user's home directory, and the main process exposes it to the renderer through IPC handlers, for example `db:get` and the `log:*` handlers in `src/main/db.ts`.
- **Shop management** (`/dashboard/shops`, `/dashboard/shops/[id]`). The admin panel lists shops, creates them through a sheet component, and shows a detail page for each shop.
- **Payments** (`/dashboard/payments`). A list of payments, backed by Convex.
- **Analytics** (`/dashboard/analytics`). A page for sales and payment reporting.
- **Shop sign-in** (`app/api/app-auth`). A route that checks a shop ID and password before issuing access.
- **File handling.** A Convex `files` table and `convex/files.ts` support uploads from the admin side.

## How it's built

- **Monorepo.** Turborepo 2 with pnpm workspaces. The root `package.json` pins `pnpm@10.24.0` and runs `turbo dev`, `turbo build`, `turbo lint` and `turbo type-check`.
- **Cashier terminal.** Electron 37 with `electron-vite`, React and TypeScript. The UI uses shadcn-style components and Tabler icons. The data layer is lowdb.
- **Admin panel.** Next.js App Router with Turbopack, React 19 and Convex. Its Convex schema covers users, shops, payments, products, inventory, orders, logs, notes and files.

Two decisions stand out:

1. **Separate runtimes, one pipeline.** The Electron app and the Next.js app share a repository and a Turborepo task graph, but each keeps its own dependencies and build tooling.
2. **Local-first cashier data.** Checkout data is kept in a local JSON file with IPC access, rather than depending on a network connection at the till.

## Running it locally

```bash
pnpm install
pnpm dev                          # runs api.js, then turbo dev for all apps
pnpm --filter pos-electron dev    # cashier terminal only
pnpm --filter admin-panel dev     # admin panel only
```

Other scripts: `pnpm build`, `pnpm lint`, `pnpm type-check`, `pnpm format`.

`dev` and `build` at the root run `api.js` before Turborepo.

## What I learned / what I'd do next

- `api.js` is a minified, obfuscated script that runs before the root `dev` and `build` scripts. It should be reviewed, and removed if it is not needed.
- There are no automated tests. The `lint` script in `apps/pos-electron` is a placeholder that prints "No linting configured".
- Cashier data is stored as plain JSON. A decision is needed on whether it should be encrypted at rest and how it is backed up.
- The `create-admin` route and the `createAdmin` Convex mutation should be checked for access control before any deployment.
- The root README now describes only features verified in the source. Receipt printing was described previously but no printer code was found.
