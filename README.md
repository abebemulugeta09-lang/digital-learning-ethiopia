# Digital Learning Ethiopia — Starter

A responsive React + Vite starter for the proposed multilingual learning and certification platform.

## Included
- Amharic, Afaan Oromoo and English interface language selector.
- Responsive home page and course category cards.
- Initial Supabase client setup and SQL schema.
- Planned data model for profiles/roles, courses, lessons, enrollments, exams, attempts and certificates.
- Mobile-friendly layout suitable for later PWA/Android packaging.

## Run locally
1. Install Node.js 20 or newer on a computer.
2. Extract this ZIP.
3. Open a terminal in this folder and run `npm install`.
4. Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key (optional for the current demo screen).
5. Run `npm run dev` and open the local address shown in the terminal.

## Deploy on GitHub Pages
This starter uses Vite. For a project repository named `digital-learning-ethiopia`, set `base: '/digital-learning-ethiopia/'` in `vite.config.js` before building for GitHub Pages, then deploy the `dist` folder using an appropriate Pages workflow. GitHub Pages cannot host the Supabase database.

## Supabase setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Add the project URL and anon key to `.env`.
4. Review and complete role-based Row Level Security policies before using real student data.

## Important status
This is a starter interface and database foundation, not a finished production system. Registration, admin course management, exam grading, certificate issuing and public QR verification still require secure backend functions and testing. Do not enter real personal data until those features and access policies are completed.

The project is a proposal/starter and does not imply official endorsement or adoption by any organization.
