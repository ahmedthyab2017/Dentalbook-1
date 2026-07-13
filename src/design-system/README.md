# Dantal Design System

Enterprise design system for the Dantal dental clinic platform (2026).

## Stack

- **Tailwind CSS v4** — utilities + `@theme` tokens in `src/design-system/tokens.css`
- **Framer Motion** — 150–250ms animations (`src/lib/motion.ts`)
- **class-variance-authority** — component variants
- **Lucide React** — icons in new UI

## Tokens

| Token | Value |
|-------|-------|
| Primary | `#2563EB` |
| Secondary | `#06B6D4` |
| Background | `#F8FAFC` |
| Dark BG | `#0F172A` |
| Card radius | `18px` |
| Button radius | `14px` |

## Usage

```tsx
import { Button, Card, CardBody, KpiCard } from "@/components/ds";
```

## Layout

- `DantalShell` — app chrome (sidebar + main)
- `DantalTopbar` — search, theme, notifications, profile
- `DantalSidebar` — collapsible navigation

## Migration

Legacy styles remain in `legacy-app.css` for QuickFlow and unmigrated pages.
New pages MUST use `@/components/ds` only — no legacy `.btn`, `.card` classes.

## Dark mode

Toggle via Topbar → sets `dark` class on `<html>` through `AppProviders`.
