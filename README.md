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
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd thinkup-gateway

# Install dependencies
npm install

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

You'll also need a Supabase project configured, with the corresponding environment variables (e.g. `VITE_SUPABASE_URL`) available to the app.

## Deployment

The production site is deployed at [think-up.academy](https://think-up.academy).
