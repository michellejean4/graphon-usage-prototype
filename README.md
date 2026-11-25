# Graphon usage and upgrade

A prototype of how Graphon could show plan limits, usage and upgrades inside the app, built as shadcn/ui components so the team can lift them straight into app.graphon.ai.

- **Prototype:** https://graphon-usage-prototype.vercel.app
- **shadcn registry:** https://graphon-usage-prototype.vercel.app/r/registry.json

## What's in it

- **Home** with a usage banner that changes as you get close to a limit
- **Settings > Usage**, a new screen with meters, a pace forecast, usage by API key and bucket, alerts, and how to check usage from the CLI and API
- **Settings > Billing**, redesigned with the current plan, plan cards, an Enterprise section and a full comparison
- **Upgrade dialog**, a one step upgrade that opens from every prompt, including Enterprise
- **Playground** showing a blocked query and a one click way to finish it
- **Outside the app**, the CLI, API and email messages a developer sees at the limit

The bar at the bottom of the prototype switches between three usage states (plenty left, getting close, out of queries), opens the outside the app view and toggles light and dark mode.

## Install in one line

The app already uses shadcn/ui, so the components install with the shadcn CLI. From the app's folder:

```bash
npx shadcn@latest add https://graphon-usage-prototype.vercel.app/r/graphon-theme.json https://graphon-usage-prototype.vercel.app/r/meter.json https://graphon-usage-prototype.vercel.app/r/button.json https://graphon-usage-prototype.vercel.app/r/badge.json https://graphon-usage-prototype.vercel.app/r/card.json https://graphon-usage-prototype.vercel.app/r/switch.json https://graphon-usage-prototype.vercel.app/r/dialog.json
```

That adds the theme (the upgrade colour, the usage chart colours and the dark mode values) and the components. `button.json` replaces the default shadcn button: it keeps every shadcn variant, adds an `upgrade` variant and uses GitHub's sizes (28 / 32 / 40px). Review the diff the CLI shows before accepting.

## For coding agents

If you're an agent building this into app.graphon.ai:

1. Run the install line above. Each item is listed in `registry.json` and depends on `graphon-theme`, so the theme always comes with it.
2. Use only the tokens in the theme table below. Blue (`upgrade`) is only for actions that upgrade a plan. Meters turn red only at 100%, and Members never does.
3. Treat the feature code as a reference. The pieces in `src/components/usage/` (usage banner, upgrade dialog, bar chart, CLI and API panel) and the pages in `src/pages/` are wired to the prototype's demo store (`src/store.tsx`) and demo data (`src/data/`). They show the intended layout, copy and states. Swap the store for the app's real plan and usage data when building them in.

## Theme tokens

Standard shadcn variables, plus:

| Token | Used for |
| --- | --- |
| `--upgrade`, `--upgrade-foreground`, `--upgrade-hover` | The upgrade call to action and the selected plan |
| `--upgrade-text` | Checkmarks and small accent text, contrast safe in both modes |
| `--chart-1` | Queries |
| `--chart-2` | Storage |
| `--chart-3` | Members |
| `--topbar` | The top bar |
| `--success`, `--warning` | Status colours |

Light mode is shadcn neutral, matching app.graphon.ai. Dark mode uses GitHub's dashboard blacks. Meters are solid in light mode and fade from a rich colour to a deep one in dark mode.

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui conventions (class-variance-authority, tailwind-merge, lucide-react).

## Run it

```bash
npm install
npm run dev              # the prototype, http://localhost:5173
npm run registry:build   # rebuild the shadcn registry into public/r
npm run build-all        # registry + app into dist/
```

## Where things live

| Path | What |
| --- | --- |
| `components.json` | shadcn config |
| `registry.json` | shadcn registry: what the install links above contain |
| `src/index.css` | Theme tokens for light and dark mode |
| `src/components/ui/` | shadcn components: button, badge, card, dialog, meter, switch |
| `src/components/usage/` | Usage and upgrade feature pieces (reference implementations) |
| `src/components/layout/` | App shell: sidebar, top bar and their menus, one file each |
| `src/pages/` | Home, Usage, Billing, Playground, Members and the outside the app view |
| `src/data/` | Plans and limits (from Graphon's current Billing page) and demo usage |

Usage numbers are demo data. Plan limits match Graphon's current Billing page.
