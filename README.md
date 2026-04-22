# AzerothAuctions — Teaser Site

Single-page teaser served while the main project is under construction.
Static: vanilla HTML / CSS / JS, no build step.

## Deploy

Hosted on GitHub Pages directly from `main` / root.

- `.nojekyll` — disables Jekyll processing.
- `CNAME` — custom-domain pointer (replace the placeholder line with your
  actual domain before pushing, then add the matching DNS record at your
  registrar: `CNAME <your-user>.github.io` for a subdomain, or A/AAAA to
  GitHub Pages' apex IPs for an apex domain).

## Local preview

```
python -m http.server 8000
```

Then open <http://localhost:8000>.
