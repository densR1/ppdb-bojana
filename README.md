# PPDB Bojana Tirta — Parent App

Admission app for **parents**, deployed on its own subdomain, separate from
e-raport.

Backend lives in `bojana-api-master` under `/api/v1/ppdb`. Full reference:
`bojana-api-master/docs/ppdb/04-api-ortu.md`.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

## Configuration

The API address comes from `VITE_API_ENDPOINT` at build time.

| File | Used for |
| --- | --- |
| `.env` | your machine, gitignored — copy from `.env.example` |
| `.env.production` | picked up by `npm run build`, points at the live API |

## Deploy

Production: **https://admission.bojanaislamicprimary.sch.id**

```bash
./deploy.sh
```

That builds, refuses to continue if the production API URL did not make it
into the bundle, uploads `dist/` to the server, and then checks that the live
site is actually serving the bundle it just built.

Serve `dist/` as a static site. It is a single-page app, so every unknown path
must fall back to `index.html` — otherwise reloading `/check-status` returns 404.

Two things on the API side must match, or the app fails in ways that are not
obvious from the browser:

- `PPDB_CORS_ORIGINS` in the Laravel `.env` has to include this subdomain,
  otherwise every request is blocked by the browser before it is even sent.
- `php artisan migrate` has to have run, and `storage/app/ppdb` must be
  writable — that is where transfer receipts land.

## Design

The design system is lifted from the **Landing Page** repo so this app looks
like part of the school site:

| | |
|---|---|
| Font | Poppins (copied into `public/font/`) |
| Primary | `#FFA901` — call-to-action buttons |
| Secondary | `#0082D6` — hero, accents, links |
| Navy | `#154E73` — headings and footer |

Fully responsive: single column on phones, multi-column from tablet up.
Buttons go full width on phones and shrink on wide screens.

**Deliberately not a copy of e-raport.** Parents open this on a phone, once
in their life — so there are no dense tables, buttons are large, and every
status page states the single next step in plain language.

## Pages

| Route | Content |
|---|---|
| `/` | Landing: hero, admission process, documents, fees |
| `/register` · `/login` | Parent account |
| `/registrations/:id` | Status, next step, history |
| `/registrations/:id/invoice` | Amount, bank details, upload receipt |
| `/check-status` | Look up by child's NIK/NISN + date of birth, no login |

## Known gap

Status labels (`Menunggu Pembayaran Biaya Daftar`, `Lolos`) and API error
messages still come back in Indonesian — they are produced by the backend,
which also feeds the psychotest result emails. Translating them means either
switching the backend to English or maintaining a second label map here.

## Not built yet

- **Child details form** — waiting on the field list from the school
- **Document upload form** — waiting on the list of required documents
- Forgot password, email verification

Under consideration: **dropping login entirely**, replaced by a random-token
link sent by email/WhatsApp after the form is submitted.
