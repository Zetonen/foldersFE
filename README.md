# Data Room — Frontend

**English** · [Українська](README.uk.md)

A virtual data room: PDFs in nested folders, uploaded with per-file progress,
shared read-only by link or with named people.

This repository holds the **frontend only**. The API lives in a separate
repository and is deployed independently.

|                     |                                                      |
| ------------------- | ---------------------------------------------------- |
| **Frontend (live)** | _TODO: paste the deployed URL_                       |
| **Backend (live)**  | https://foldersbe-production.up.railway.app          |
| **API docs**        | https://foldersbe-production.up.railway.app/api/docs |

---

## Table of contents

- [Stack](#stack)
- [Setup](#setup)
- [Architecture](#architecture)
- [Design decisions](#design-decisions)
- [Edge cases](#edge-cases)
- [Where I used AI](#where-i-used-ai)

---

## Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · shadcn/Radix ·
Redux Toolkit with RTK Query · React Router 7 · React Hook Form with Zod ·
dnd-kit · react-pdf

## Setup

Requires **Node 20.19+ or 22.12+** (Vite 7).

```bash
npm ci
cp .env.example .env     # points at the deployed API by default
npm run dev              # http://localhost:3000
```

| Script                 |                                            |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | dev server on port 3000                    |
| `npm run build`        | typecheck (`tsc -b`) then production build |
| `npm run preview`      | serve the production build locally         |
| `npm run lint`         | ESLint                                     |
| `npm run format`       | Prettier, write                            |
| `npm run format:check` | Prettier, verify                           |

**Environment** — one variable, `VITE_API_BASE_URL`. It is read once at boot and
the app throws immediately if it is missing, rather than quietly issuing
requests to its own origin.

> The dev server occupies port 3000, so a backend running locally must use a
> different one.

---

## Architecture

Layers, from the outside in. **Imports only ever point downwards**, and that is
enforced by ESLint (`no-restricted-imports`) rather than by convention — see
[`eslint.config.js`](eslint.config.js).

```
pages/       route components and the router
widgets/     self-contained blocks of a screen (modals, header, sidebar)
features/    one user-facing capability (upload queue, share access, PDF viewer)
components/  layout/  page frames
             moduls/  app-level reusable pieces
             ui/      shadcn primitives
shared/      hooks, helpers, constants — no feature knowledge
api/         RTK Query endpoints, axios instance, response schemas
store/       slices and persistence
types/       DTO schemas and shared types
```

A `features/` module cannot import another feature, or a widget, or a page.
A `widget` cannot import a page or another widget. This is what keeps a screen
composable: every dependency is either downward or passed in as a prop.

Each module is a folder with `components/`, `hooks/`, `helpers/`, `constants/`
and a barrel `index.ts` — so a component file holds markup, and the logic it
needs sits next to it under a name that says what it does.

---

## Design decisions

### Server state lives in exactly one place

RTK Query owns everything that came from the API. Redux slices hold only what
the server does not know about: the auth session, view mode, sidebar state, the
upload queue, the current selection. **No slice mirrors server data**, so there
is no cache to invalidate twice and no chance of the two disagreeing.

### Every response is validated before it is cached

`axiosBaseQuery` takes an optional Zod schema and parses the payload before
handing it to the cache ([`src/api/baseQuery.ts`](src/api/baseQuery.ts)). A body
that does not match is reported as a server error instead of flowing into
components as a wrongly-typed object. The DTO schemas in `src/types/models/` are
the single source of truth for both the runtime check and the static type.

### The access token never touches disk

`FR-STATE-04`. The token lives in memory only and is explicitly blacklisted from
`redux-persist`; the refresh token is an httpOnly cookie the JS never sees. On
every fresh load the session is rebuilt by a single `/auth/refresh` call, and
the route guards hold a loader until it settles — otherwise reloading a deep
link would bounce the user to `/login` before the session had a chance to come
back.

A 401 on any request clears the session and redirects with the current path
saved in `?next=`. Login, register and refresh **opt out** of that global
handler: a 401 there means "wrong credentials", not "your session expired", and
redirecting to the login screen from the login screen would be nonsense.

### Uploads are a three-step transaction

1. **Reserve** — `POST /files/upload-url` returns a signed URL and a free name.
2. **Transfer** — the bytes go straight to blob storage, bypassing the API. This
   is the only request the user sees progress for, which is also why it cannot
   live in RTK Query.
3. **Confirm** — `POST /files/confirm` turns the stored object into a record.

The queue is driven by a single processor hook mounted in the app shell, so
transfers **survive navigation** between folders and screens. Files go up one at
a time: the panel shows a per-file bar, and serial transfers make that number
mean something.

`File` objects are not serialisable, so the store holds only their metadata and
the blobs are parked in a module-level registry under the same ids. The registry
is reconciled against the queue on every change — an upload that leaves the
queue drops its blob, while a _failed_ one keeps it so retry does not have to
ask the user to pick the file again.

Transport failures retry twice with a growing delay. A refusal — wrong type, too
large, not allowed — is final, because repeating it would produce the same
answer.

### Name conflicts are answered before a byte moves

The server does not refuse a taken name, it hands back a free one. So **a name
that came back changed is the authoritative sign of a collision** — and the only
check that sees the whole folder rather than the pages this client happens to
have loaded. Reserving creates nothing (no record, no object, just a signed
URL), so dropping it costs nothing, which is what makes it safe to ask the user
at that point.

"Replace" is then finished in the only order that cannot lose a file: the new
one is stored, _then_ the old one goes, _then_ the name changes hands.

### The client never decides what a user may do

The API ships the caller's role (`myRole`) alongside every folder, file and
listing. The client only reflects it. Actions the user lacks the right to are
**not rendered at all** rather than rendered disabled — a viewer should not be
shown a door they cannot open.

### Optimistic updates with real rollback

Rename, move and delete edit the cached listing in place so the change is
visible before the request resolves. Every cache helper is a no-op when the item
is not in the loaded pages, which makes the rollback safe to apply
unconditionally.

Moves come with an Undo toast, expressed as the same move with the two ends
swapped.

### Listing large folders

Keyset pagination (`nextCursor`) plus infinite scroll, and the table body is
virtualised with `@tanstack/react-virtual` — the DOM stays a constant size no
matter how many pages have been loaded. `null` and only `null` means the listing
is exhausted; a short page does not.

### Bundle

`manualChunks` splits vendors so a release does not invalidate everything at
once, and pdf.js — by far the largest dependency — is confined to a lazy chunk
that is not fetched until a file is opened. The PDF viewer renders a window of
pages around the current one and gives every other page a placeholder of its
real measured height, so the scrollbar stays honest while nothing is drawn.

---

## Edge cases

| Case                                          | Handling                                                                                                                    |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Upload with a name already in the folder      | Asked before transfer; Keep both / Replace / Skip, with "apply to all"                                                      |
| Two files with the same name in **one** batch | Collide with each other exactly as they would with existing files                                                           |
| Deleting a folder                             | Warns with the subtree counts of what will be destroyed                                                                     |
| Deleting a folder someone is viewing          | The viewer lands on a 404/Forbidden screen rather than an empty frame                                                       |
| Connection lost                               | Offline banner; the upload queue pauses and resumes on reconnect                                                            |
| Closing the tab mid-upload                    | `beforeunload` prompt while transfers are active                                                                            |
| Expired or revoked share link                 | Dedicated "link expired" screen                                                                                             |
| Rate limited (429)                            | One cooldown window blocks the actions that would only fail again; reads `Retry-After` and the backend's `Retry-After-auth` |
| A lazy chunk fails to load                    | Route error boundary offers a reload, not a retry of the same request                                                       |
| Cancelled requests                            | Stay silent — never surfaced as a toast                                                                                     |
| Long file names                               | Truncated in the row, full name in the title tooltip                                                                        |
| OAuth callback this tab never started         | `state` is checked against a value parked in `sessionStorage`                                                               |

---

## Where I used AI

I used AI (Claude) as a working tool throughout, in three areas:

**Code generation.** Components and hooks were largely AI-drafted from a spec I
wrote per module — the upload queue, the share access panel, the PDF viewer's
windowing, the drag-and-drop handlers. I reviewed and reworked the output rather
than taking it as-is; the interaction and error behaviour described above is the
result of several passes, not a first draft.

**UI and styling.** Tailwind class composition and the shadcn/Radix primitives in
`src/components/ui/` were generated and then adjusted — spacing, the colour
tokens in `src/styles/`, and the responsive behaviour of the sidebar and details
panel.

**Review and refactoring.** I ran AI review passes over the finished code to find
dead code and inconsistencies. That is where the last cleanup came from: removing
an abandoned `neverthrow` error-handling layer that only one function still used,
deleting unused hooks and starter-template leftovers, fixing a leak where blobs
of cancelled uploads stayed in memory for the lifetime of the tab, correcting the
dependency manifest (`pdfjs-dist` was imported but unlisted), and normalising
line endings and formatting.

**What I did not delegate.** The architecture is mine: the layering and the
import rules that enforce it, the decision to let RTK Query own all server state,
keeping the access token out of storage, the three-step upload and the ordering
that makes "Replace" safe, and reflecting server-issued roles instead of
computing permissions on the client. AI wrote a lot of the code; the shape of the
solution and the trade-offs above are my own, and I can defend each of them.
