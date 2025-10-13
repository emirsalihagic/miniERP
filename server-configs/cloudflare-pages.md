# Cloudflare Pages Configuration

## Functions/_redirects
Create a file named `_redirects` in your build output directory with the following content:

```
/*    /index.html   200
```

This tells Cloudflare Pages to serve `index.html` for all routes, allowing Angular's router to handle client-side routing.

## Alternative: Functions/_headers
Create a file named `_headers` in your build output directory for custom headers:

```
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

## Build Configuration
In your Cloudflare Pages dashboard:
1. Go to Settings > Builds & deployments
2. Set Build command: `npm run build`
3. Set Build output directory: `dist/mini-erp-ui`
4. Set Root directory: `apps/ui`

## Environment Variables
Add your environment variables in the Cloudflare Pages dashboard under Settings > Environment variables.
