# StudySync — Render Backend Deployment

This repository is a full-stack application. The Render Docker web service builds the React frontend and Spring Boot backend together; the frontend can also be hosted separately on Netlify or Vercel.

## Current backend target

The frontend proxy configuration currently targets:

`https://studysync-hmji.onrender.com`

Check that this is the intended, healthy Render service before using the proxy. The application health endpoint is `/health`.

## Deploy the web service

1. Open the Render Dashboard and create a **Web Service** from `vasalaajay36/studysync`.
2. Select the `main` branch.
3. Choose **Docker** and use the repository-root `Dockerfile`. Leave Root Directory blank.
4. Choose a region near the database and users.
5. Set the environment variables below, then deploy.

The root `render.yaml` configures the web service. It does **not** create a database; provision or select a database separately.

## Environment variables

Choose one database configuration:

### Option A — MySQL-compatible database

Set these values using the exact connection information from your provider:

| Variable | Value |
|---|---|
| `DB_URL` | JDBC URL, e.g. `jdbc:mysql://HOST:PORT/DATABASE?sslMode=REQUIRED` |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |

Replace all placeholders with your provider's values. Do not commit credentials to Git.

### Option B — PostgreSQL provider URL

Set `DATABASE_URL` to the provider's full `postgres://` or `postgresql://` connection URL. `DatabaseConfig` normalizes that URL to JDBC and extracts its credentials. Do not set a MySQL JDBC URL at the same time unless you intentionally want to use the fallback configuration.

### Required production settings

| Variable | Value |
|---|---|
| `COOKIE_SECURE` | `true` |
| `COOKIE_SAME_SITE` | `none` when the frontend is hosted on a different domain |
| `CORS_ALLOWED_ORIGINS` | Comma-separated exact frontend origins, e.g. `https://YOUR-SITE.netlify.app,https://YOUR-SITE.vercel.app` |
| `JPA_DDL_AUTO` | `update` for the current schema-managed deployment, or a deliberate migration strategy when migrations are added |

Render provides `PORT` automatically. The app binds to `0.0.0.0` and uses the provided port.

**Session note:** If you host the frontend on a separate domain, it must send credentialed API requests and the backend must allow that exact frontend origin. Do not use `*` as a credentialed CORS origin. The current frontend fetch wrapper includes credentials for same-origin `/api/` calls.

## Deploy the frontend separately

### Netlify

1. Import `vasalaajay36/studysync`.
2. Set the base directory to `frontend`.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. The repository contains `frontend/netlify.toml` and `frontend/public/_redirects`; both proxy `/api/*` to the same Render backend. Keep these destinations in sync if the backend URL changes.

### Vercel

Import the repository and set the Root Directory to `frontend`. The repository's `frontend/vercel.json` rewrites `/api/*` to the same Render backend and routes the remaining paths to the SPA.

## Verify after deployment

1. Open `https://YOUR-RENDER-SERVICE.onrender.com/health`; expect HTTP 200 and a JSON body with `status: UP`.
2. Open the frontend domain and register a test account.
3. Sign out, then sign back in.
4. Verify Dashboard, Tasks, Subjects, Study Sessions, Coding Platforms, and Analytics navigation.
5. Create, edit, reload, and delete a task, subject, and study session.
6. Add a coding profile; test supported automatic fetches, then save and reload the profile.
7. Confirm an unauthenticated browser cannot access protected API endpoints.
8. Check Render logs and GitHub Actions if any test fails.

The GitHub Actions workflow runs frontend lint/build and backend tests on pushes and pull requests to `main`.

## Troubleshooting

- **401 on API requests:** sign in again; check that the frontend proxy preserves cookies and the backend uses `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none` for cross-domain hosting.
- **CORS rejection:** add the exact frontend origin to `CORS_ALLOWED_ORIGINS`, separated by commas.
- **Database connection failure:** verify the URL, credentials, TLS requirements, network access, and database availability.
- **Profile fetch failure:** verify the username and inspect backend logs; external coding sites can rate-limit or change their public profile APIs.
- **Render free-tier cold start:** the first request after inactivity can take longer than usual.
