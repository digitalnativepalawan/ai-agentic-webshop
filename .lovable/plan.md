
## Goal

Bring the entire `merqato-webstore` upload into this project as a functional TanStack Start app: all 7 pages, all site components, theme toggle, static JSON catalogs, and the Merqato design tokens (gold/crimson on dark, warm limestone light).

## Route mapping (`src/pages/*` → `src/routes/*`)

```text
src/pages/Home.tsx            → src/routes/index.tsx           /
src/pages/Operators.tsx       → src/routes/agents.tsx          /agents
src/pages/Stays.tsx           → src/routes/stays.tsx           /stays
src/pages/Ecosystem.tsx       → src/routes/ecosystem.tsx       /ecosystem
src/pages/Checkout.tsx        → src/routes/checkout.tsx        /checkout
src/pages/MissionControl.tsx  → src/routes/mission-control.tsx /mission-control
src/pages/Contact.tsx         → src/routes/contact.tsx         /contact
```

- Each route file wraps the ported page component with `createFileRoute("/…")` and its own `head()` (unique title, description, og:title, og:description). No `og:image` on root.
- Replace the upstream `<Route path="*" element={<Home />} />` catch-all with the existing root `notFoundComponent` (proper 404) instead of silently rendering home.

## Root layout (`src/routes/__root.tsx`)

- Set real Merqato metadata (title "Merqato — Agentic Commerce for Hospitality", matching description, og/twitter tags). Remove the "Lovable App" placeholder.
- In `<body>`, add `className="dark"` so the dark palette is the default (matches upstream `getInitialTheme`).
- Inside `RootComponent`, wrap `<Outlet />` with the ported `ThemeProvider`, then render `<Header />`, `<main className="flex-1">{outlet}</main>`, `<Footer />` inside a flex column shell. Add a small `ScrollToTop` that listens to `useRouterState({ select: s => s.location.pathname })`.
- Preserve `<HeadContent />` / `<Scripts />` and the existing error boundary.

## Components & lib (copy verbatim, adjust imports)

Copy under `src/`:

- `src/components/site/*` — Header, Footer, OfferCard, StayCard, OperatorCard, PartnershipCard, CheckoutSteps, TrustBlock, MissionControlPreview, Section, CTAButton, StatusChip, ThemeToggle, Icon.
- `src/lib/site-data.ts`, `src/lib/checkout-rules.ts`, `src/lib/agent-commerce.ts`, `src/lib/types.ts`.
- `src/context/ThemeContext.tsx`.
- Public JSON: `public/ai-manifest.json`, `public/merqato-catalog.json`, `public/agent-commerce.json`.

Import rewrites during copy:

- `react-router-dom` → `@tanstack/react-router`.
- `<Link to="/x">` stays; `useLocation` → `useRouterState({ select: s => s.location })`; `useNavigate()` returns a function-compatible shape but its signature differs — call sites use `navigate("/checkout")`, rewrite to `navigate({ to: "/checkout" })`.
- Any `<a href="/foo">` used for internal nav → `<Link to="/foo">`.

## Design tokens (Tailwind v4 in `src/styles.css`)

Merqato uses Tailwind v3 `tailwind.config.js` with custom colors and `darkMode: "class"`. This project is Tailwind v4 (CSS-first). Port by:

1. Replacing the current `:root` / `.dark` oklch blocks with Merqato's `--bg / --surface / --surface-2 / --line / --line-strong / --ink / --muted / --faint / --gold / --gold-soft / --crimson / --cream` variables (dark values in `:root, .dark`; light values in `.light`). Keep shadcn tokens (`--background`, `--foreground`, …) mapped to the Merqato equivalents (`--background: rgb(var(--bg))`, etc.) so existing shadcn components keep working.
2. In the `@theme inline` block, register the Merqato palette (`--color-bg`, `--color-surface`, `--color-gold`, …), the `Cormorant Garamond` / `Jost` / `JetBrains Mono` font families (`--font-display`, `--font-sans`, `--font-mono`), the `--tracking-label: 0.22em`, `--container-shell: 1200px`, the `fade-up` / `shimmer` keyframes + `--animate-fade-up`, and the `card` / `glow` box-shadows.
3. Port the `@layer components` primitives (`.shell`, `.eyebrow`, `.card`, `.card-hover`, `.divider`, `.link-underline`, `.input`, `.focus-ring`) and the `.aurora` / `.hero-sweep` utilities into `src/styles.css` unchanged.
4. Toggle dark/light via Merqato's `.light` / `.dark` classes on `<html>` (already how `ThemeContext` works). Keep `@custom-variant dark (&:is(.dark *));` so shadcn `dark:` utilities still resolve.

## Fonts

Install via `bun add @fontsource/cormorant-garamond @fontsource/jost @fontsource/jetbrains-mono` and import the needed weights in `src/start.ts` (client entry). No CDN `<link>` tags, no CSS `@import` of remote URLs.

## Package additions

- `lucide-react` (used by site components).
- Font packages above.
- No `react-router-dom` — replaced by `@tanstack/react-router`.

## Cleanup

- Delete the blank-page placeholder in `src/routes/index.tsx`.
- Do not create `src/pages/` in this project; upstream pages become route files.
- Do not copy upstream `main.tsx`, `App.tsx`, `index.html`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `tsconfig*.json`, `.eslintrc.cjs`, or `package-lock.json` — this project's TanStack Start bootstrap already covers all of those.

## Verification

- Typecheck + build must pass.
- Visit `/`, `/agents`, `/stays`, `/ecosystem`, `/checkout`, `/mission-control`, `/contact` via Playwright, screenshot each, and confirm the dark Merqato palette + Header/Footer render and the theme toggle flips to `.light`.
