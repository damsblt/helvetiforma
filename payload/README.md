# Helvetiforma CMS (Payload)

Self-hosted Payload CMS for managing Helvetiforma content.

## Setup

### Environment Variables

Required in Vercel (Production):

```bash
DATABASE_URI=postgresql://postgres:password@db.qdylfeltqwvfhrnxjrek.supabase.co:5432/postgres
PAYLOAD_SECRET=07aAOKbnl82PFmhaXqY40QOGSpnQ2fKyhIRsvEHQ3Q4=
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
NEXT_PUBLIC_SERVER_URL=https://helvetiforma-cms.vercel.app
```

### Vercel Project Settings

**Important:** In Vercel dashboard for `helvetiforma-cms`:

1. **Git Settings** (Settings → Git):
   - Repository: `damsblt/helvetiforma`
   - Production Branch: `main`

2. **Build Settings** (Settings → General):
   - Root Directory: `payload`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

3. **Redeploy** after confirming these settings.

### Access

Once deployed, access the admin panel at:
```
https://helvetiforma-cms.vercel.app/admin
```

Create your first admin user on first visit.

## Local Development

```bash
cd payload
npm install
npm run dev
```

CMS will be available at `http://localhost:3001/admin`

## Collections

- **Pages**: Hero sections and flexible content sections
- **Media**: File uploads (stored in Vercel Blob)

## API

REST API available at:
```
https://helvetiforma-cms.vercel.app/api/pages
https://helvetiforma-cms.vercel.app/api/media
```

GraphQL playground:
```
https://helvetiforma-cms.vercel.app/api/graphql-playground
```
