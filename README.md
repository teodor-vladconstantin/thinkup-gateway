# ThinkUp Gateway

Application and recruitment portal for **ThinkUp Academy**. It serves the public-facing marketing site (departments, blog, partners, contact) and a role-based admin dashboard for reviewing applications and managing site content.

## Features

**Public site**
- **Application form** (`/join-us`) — prospective members submit name, email, date of birth, phone, school, reason for joining, and how they heard about ThinkUp. Submissions are stored in the `applications` table.
- **Recruitment open/close logic** — the application form checks a `site_settings` record; when recruitment is closed it shows a configurable "closed" notice instead of the form (and fails closed if the setting can't be read).
- **Departments page** (`/departments`) — lists departments with their visible team members, grouped by department.
- **Blog** (`/blog`, `/blog/:slug`) — public listing and detail pages for published posts.
- **Partners** (`/partners`) — displays visible partner logos with links to their websites.
- **Contact form** (`/contact`) — visitor messages are stored in the `messages` table.
- **Contribute, Terms, Privacy** — supporting static/informational pages.

**Admin dashboard** (`/admin`, protected by Supabase auth + role checks)
- **Dashboard** — overview of admin users grouped by role (Super Admin, Director, CEO, Vice President, Blog Editor, Mentor).
- **Applications** — review and delete submitted membership applications.
- **Members** — create, edit, delete team members, assign department/role, toggle public visibility, and upload profile photos to Supabase Storage.
- **Departments** — create, edit, and delete departments (name, slug, description, display order).
- **Blog** — create/edit posts, toggle published/draft status, delete posts.
- **Partners** — manage partner entries (name, logo upload or URL, website, visibility, order).
- **Messages** — inbox for contact form submissions, with view/delete actions.
- **Settings** (Super Admin only) — toggle recruitment open/closed and edit the closed-state message, manage admin users and their roles, and create new admin accounts (via a Supabase Edge Function that auto-confirms the account).
- **Role-based access control** — routes and navigation items are gated by role (`super_admin`, `ceo`, `vicepresident`, `director`, `blog_editor`, `mentor`), with each role redirected to the section it's permitted to use.

## Tech Stack

- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [shadcn-ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (database, auth, storage, edge functions)

## Local Development

**Prerequisites**
- [Node.js](https://nodejs.org/) (with npm)

**Setup**

```sh
# Clone the repository
git clone https://github.com/<owner>/thinkup-gateway.git

# Navigate to the project directory
cd thinkup-gateway

# Install dependencies
npm install

# Configure environment (see below)
cp .env.example .env

# Start the development server
npm run dev
```

Other available scripts:

```sh
npm run build       # Production build
npm run build:dev    # Development-mode build
npm run lint         # Run ESLint
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
npm run preview       # Preview the production build locally
```

## Environment variables

Copy `.env.example` to `.env` and fill in your own values (`.env` is git-ignored):

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon (public) key |
| `VITE_SENTRY_DSN` | Sentry DSN (optional) |
| `VITE_PUBLIC_POSTHOG_KEY` / `VITE_PUBLIC_POSTHOG_HOST` | PostHog analytics (optional) |

The `supabase/create_admin.sql` and `supabase/create_blog_editor.sql` scripts contain placeholder emails and passwords; replace them before running.

## Deployment

The production site is deployed at [think-up.academy](https://think-up.academy).

## License

Released under the MIT License (see `LICENSE`), copyright (c) 2026 Teodor-Vlad Constantin. Developed for ThinkUp Academy and published with its permission and with the consent of the contributors. The ThinkUp name and logo remain the property of ThinkUp Academy and are not covered by the license.
