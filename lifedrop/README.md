# LifeDrop – Blood Donation Network

A full-stack web app that connects people who need blood with registered donors.

**Stack:** React 18 + Vite + TypeScript + Tailwind · Node/Express REST API · Supabase (PostgreSQL, Auth, Storage, Row Level Security) · React Hook Form + Zod · Sonner · Recharts · Lucide.

> LifeDrop is a donor *connection* platform. It is not a blood bank or medical service and never decides donor eligibility.

## Features
- Public: home (live stats from DB), donor search (blood group / state / city / area / PIN / availability, pagination), donor profile, public request list + detail, About, How It Works, Contact (saved to DB), Privacy, Terms.
- Auth: register (donor or basic account), login, logout, forgot/reset password, protected routes, roles **user / donor / admin**.
- Dashboard: overview, profile view/edit (avatar upload, privacy toggles, become-a-donor), availability, blood requests (create, edit, cancel, mark fulfilled, view donor responses), notifications (view, express interest, decline).
- Notifications: new request → available donors with the **same blood group** (same city, else same PIN, else same state) get an in-app notification; donor responses notify the requester.
- Admin (`/admin`): overview + charts, users (search, suspend), donors (verify, set status, remove), verification queue, requests (filter, change status, remove fraud), contact messages, reports.

## Security model
- **RLS on every table** (see `supabase/migrations/001_lifedrop_schema.sql`). Donors' private data lives in `donors`/`profiles`; the public only reads the `public_donors` and `public_blood_requests` views, which whitelist columns (no email, DOB, gender, patient name or contact number). Phone is exposed only if the donor opted in.
- Triggers stop non-admins from changing `is_verified`, `status`, `is_suspended`, or removing requests.
- Admin routes: JWT verified by Express, then `admin_roles` is checked in the database on **every** request. Admin rows can only be created via SQL.
- Service-role key is used only in `server/`; the browser only has the anon key.
- Zod validation on both client and server, Helmet, CORS allow-list, body-size limit, rate limits (global, contact form, request creation, admin).
- No SMS/WhatsApp/e-mail is sent. The hook for adding a provider is `server/services/notifications.ts`.

## Setup
1. `npm install`
2. Create a Supabase project. In **SQL Editor**, run `supabase/migrations/001_lifedrop_schema.sql`.
3. `cp .env.example .env` and fill in: project URL, **anon** key (frontend), **service-role** key (backend only).
4. (Optional, for quick testing) Supabase → Authentication → Providers → Email → turn off "Confirm email". Otherwise users must click the e-mail link before logging in. Add `http://localhost:5173/**` under Authentication → URL Configuration → Redirect URLs (needed for password reset).
5. `npm run dev` → web on http://localhost:5173, API on http://localhost:4000.
6. Register an account, then make it admin by editing and running `supabase/seed_admin.sql`.

If the Supabase variables are missing, the app shows a setup screen instead of fake data.

## Scripts
| Command | What it does |
|---|---|
| `npm run dev` | Vite + API with reload |
| `npm run typecheck` | TypeScript check for client and server |
| `npm run build` | Type-check and build the frontend into `dist/` |
| `npm start` | Run the API (`tsx server/index.ts`) |

## Production notes
Host `dist/` on any static host, run the API on a Node host, set `VITE_API_URL` to the API URL and `CLIENT_ORIGIN` to the site URL. Replace the placeholder contact details (`Footer.tsx`, `Contact.tsx`) and have the Privacy/Terms text reviewed.

## Assumptions you may change
- Indian mobile numbers (`^[6-9]\d{9}$`) and 6-digit PIN codes; donors aged 18–65. Edit `src/lib/schemas.ts`, `server/config/constants.ts` and the SQL checks.
- Matching uses the exact blood group (no compatibility chart) by design, so no one is told they can donate to a group they can't.

## Manual test checklist
Register donor → search for them while logged out → post a request for their group in the same state → check their Notifications → Express interest → requester sees the response under My Blood Requests → admin logs in, verifies donor, changes request status, resolves a contact message → confirm a non-admin visiting `/admin` is redirected and `GET /api/admin/stats` returns 403.
