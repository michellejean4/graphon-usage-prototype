# Graphon usage and upgrade prototype

An interactive prototype showing how Graphon could surface plan limits, usage and upgrades inside the app.

## What's in it

- **Home** with a usage banner that changes as you get close to a limit
- **Settings > Usage**, a new screen with meters, a pace forecast, usage by API key and bucket, alerts, and how to check usage from the CLI and API
- **Settings > Billing**, redesigned with the current plan, plan cards, an Enterprise section and a full comparison
- **Upgrade dialog**, a one step upgrade that opens from every prompt
- **Playground** showing what happens when a query is blocked, and a one click way to finish it
- **Outside the app**, the CLI, API and email messages a developer sees at the limit

Use the bar at the bottom to switch between three usage states (plenty left, getting close, out of queries), open the outside the app view, and toggle light and dark mode.

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, and shadcn/ui style components (class-variance-authority, tailwind-merge, lucide-react).

## Run it

```bash
npm install
npm run dev              # the prototype, http://localhost:5173
npm run storybook        # the component library, http://localhost:6006
npm run build            # production build into dist/
```

## Where things live

| Path | What |
| --- | --- |
| `src/components/ui/` | Base components: button, badge, card, dialog, meter, switch |
| `src/components/` | Usage banner, upgrade dialog, bar chart, sidebar and header |
| `src/pages/` | Home, Usage, Billing, Playground, Members and the outside view |
| `src/data/` | Plans and limits, plus the demo usage numbers |
| `src/stories/` | Storybook stories |
| `src/index.css` | Colour tokens for light and dark mode |

The plan limits in `src/data/plans.ts` match Graphon's current Billing page. Usage numbers are demo data.
