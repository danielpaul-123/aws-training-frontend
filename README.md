# Frontend — React S3 Upload UI

React + Vite + Tailwind app. Lets users pick an image or PDF and upload it directly to S3 via a presigned URL from the backend.

## Stack

- React 18
- Vite
- Tailwind CSS v3

## Local Dev

```bash
npm install
cp .env.example .env   # set VITE_API_URL to EC2 address
npm run dev
```

## Environment Variable

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://1.2.3.4:8000` | EC2 backend URL |

## Build & Deploy to S3 + CloudFront

```bash
npm run build          # outputs to dist/
```

Upload `dist/` contents to your S3 frontend bucket (static website hosting enabled), then point a CloudFront distribution at that bucket.

## Upload Flow

```
1. User picks file (image or PDF)
2. POST /upload-url → backend returns { url, key }
3. PUT url with raw file bytes (Content-Type must match)
4. S3 returns 200/204 → success state shown
```

## UI States

| State | Description |
|-------|-------------|
| Idle | File picker + Upload button |
| Uploading | Spinner, button disabled |
| Success | Green card with filename and S3 key |
| Error | Red card with error message + retry link |
