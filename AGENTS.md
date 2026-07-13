<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Dantal Design System (2026)

All **new UI** must use the Dantal design system:

- Components: `@/components/ds` (Button, Card, Input, Modal, Table, KpiCard, …)
- Layout: `DantalShell`, `DantalPage`, `DantalTopbar`, `DantalSidebar`
- Tokens: `src/design-system/tokens.css` — Primary `#2563EB`, Inter font, 8px spacing
- Motion: `src/lib/motion.ts` — Framer Motion, 150–250ms
- Utilities: `cn()` from `@/lib/cn`, Tailwind v4

Do **not** use legacy `.btn`, `.card`, `.page` classes in new code. Legacy CSS remains for QuickFlow and pages not yet migrated.

See `src/design-system/README.md` for full reference.
