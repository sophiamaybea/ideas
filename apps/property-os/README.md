# ATLAS — Property OS

A coherent, responsive **property operations web application prototype** with portfolio management, sales and lettings opportunities, leases, maintenance tickets, construction projects, document registers, financial scenarios, reporting, and a property research library.

## Running locally

Requires Node.js 20+ for the optional build, but no external JavaScript packages.

```bash
cd apps/property-os
npm run check
npm run build
```

Open `index.html` in a browser to use the demo, or serve `dist/` with any static server. Vercel uses `npm run build` and publishes `dist/`.

## What works now

- Responsive application shell and navigation.
- Property creation, editing and deletion, filtering and global search.
- Sales and lettings pipeline with editable opportunities and status changes.
- Tenancy records and contract dates.
- Maintenance creation, editing and completion.
- Renovation/project budgets, progress and costs.
- Document **metadata** register (no real file uploads or document processing).
- Expense ledger, financial metrics, investment scenario calculator.
- Portfolio insights, JSON export, resettable example data.
- Source-link research library and locally editable research notes.

This is a functional **client-side demo**, not a production multi-tenant property platform. Data is in `localStorage`, scoped to one browser. There is no authentication, remote database, cloud storage, payment processing, background task processing, audit log, AI reasoning, BIM manipulation, live geospatial analysis, market data or external repository integrations.

**Do not input real confidential tenant, legal, financial or property records.** Illustrated names, prices and statuses are fictional demo data. Finance metrics are illustrative, not professional advice.

## Future production architecture

1. Move records to PostgreSQL with a versioned schema (`organizations`, `memberships`, `properties`, `units`, `leases`, `contacts`, `work_orders`, `projects`, `budgets`, `documents`, `events`, `expenses`, `research_claims`).
2. Add server-side tenancy isolation, role-based permission checks, sign-in, audit logging, rate limiting and encrypted document object storage.
3. Build backend integration adapters: OpenTakeoff for floor-plan measurements; IfcOpenShell for BIM; OpenDroneMap for licensed site imagery; OpenContracts and Docling for document processing; MapLibre for maps; Chatwoot for communication workflows; optional invoicing and accounting.
4. Add asynchronous job queues for computationally intensive PDF, BIM and image-processing tasks. Deploy the app frontend to Vercel, and compute workers on appropriate long-running infrastructure.
5. Add data provenance (citations, extraction confidence, source hashes), human review controls and retention policies.
6. Set up automated tests (authorization boundaries, input validation, finance formulas, workflows, import/export), security review, backups and monitoring.
7. Review each upstream repository's exact licence and hosted-service conditions before incorporating code. Links to projects do **not** constitute integrations.

## Repository structure

- `index.html` — application shell and navigation
- `styles.css` — design system and responsive layouts
- `app.js` — browser-side application and demo state
- `RESEARCH_SOURCES.md` — source repositories and integration status
- `build.mjs` — zero-dependency static build for Vercel
- `vercel.json` — Vercel build settings

## Source location

This application is kept in the `apps/property-os/` directory of the user's existing `ideas` GitHub repository; it is not a separate stand-alone GitHub repository.

## Design notes

Visual property illustrations are locally generated CSS drawings rather than real property photographs. This avoids implying that fictional demo properties are actual listings.
