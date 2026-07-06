# Sea of Stars

A free portfolio/CV site template. Scroll-driven, motion-first, no framework.

**[live preview →](https://jzmn-crft.github.io/sea-of-stars-template/)**

## What you get

- Single-page portfolio with scroll-driven storytelling: hero, work,
  experience timeline, skills, education, testimonials, links, contact —
  choreographed with GSAP + ScrollTrigger and Lenis smooth scroll, plus a
  Three.js starfield hero.
- Vanilla JS — no build step, no dependencies to babysit. Open
  `index.html` and it runs.
- Deploys anywhere static: GitHub Pages, Vercel, Netlify, Cloudflare
  Pages. (`_headers` and `_redirects` are Cloudflare Pages–specific —
  see [Deploying elsewhere](#deploying-elsewhere), which is what applies
  if you're using GitHub Pages.)
- Structured for swap-and-ship: content lives in clearly marked,
  lorem-ipsum-filled sections of `index.html`; motion logic in `main.js`
  stays untouched.

## Why free

I build portfolio templates as a side practice — this one's the
giveaway. The design decisions are documented below so you can learn
from it, not just use it. Others in the set are headed to template
marketplaces.

## Design decisions

**No framework.** A portfolio doesn't need React. Fewer dependencies
means faster loads and nothing to maintain in two years when you dust
it off for your next job hunt.

**Motion does narrative work.** The scroll choreography isn't
decoration — it controls pacing, the order information lands, and
where attention rests. Timing values live inline next to each
`ScrollTrigger`/`gsap.to` call in `main.js` if you want to retune them.

**Boring where it should be.** Semantic HTML, real accessibility
basics, readable CSS. The flashy parts sit on a foundation that doesn't
fight you.

## Quick start

1. Clone this repo (or click **Use this template** on GitHub).
2. Replace the content in the marked sections of `index.html` — see
   [Before you publish](#before-you-publish) below for the full list.
3. Swap colors and type: CSS custom properties live in the `:root`
   block at the top of `index.html`'s `<style>` (`--bg`, `--teal`,
   `--serif`, `--sans`, etc.) — there's no separate stylesheet.
4. Deploy the folder to any static host.

## Project structure

```
index.html   — all markup + CSS (inline <style>, custom properties in :root)
main.js      — all page JS (loader, nav, scroll animations, starfield,
               film grain, testimonials pin, accordion, work case-study
               overlays, cookie consent + GA4)
images/      — placeholder project covers + testimonial avatars, replace
               with your own (self-hosted so the CSP in _headers still works)
_headers     — Cloudflare Pages security headers (CSP, HSTS, etc.)
_redirects   — Cloudflare Pages redirects + shortlinks
robots.txt, sitemap.xml, site.webmanifest
favicon.svg, favicon.png, apple-touch-icon.png, og-image.png — placeholders
resume.pdf   — placeholder, replace with your actual résumé
```

## Before you publish

Search `index.html` for these and swap in your own content:

- **Identity**: `<title>`, meta description/og tags, the JSON-LD block,
  nav logo, loader name, hero headline/eyebrow/stats, footer copyright.
- **Links**: every `https://linkedin.com/in/yourprofile`,
  `hello@example.com`, `https://x.com/yourhandle`,
  `https://medium.com/@yourhandle`, `https://example.com/mentoring` —
  also mirrored in `_redirects` (the `/linkedin`, `/mentor`, `/medium`,
  `/twitter`, `/x` shortlinks).
- **Content sections**: Work (4 project cards that open case-study
  overlays — replace the cover images in `images/`, the card copy, and
  the matching `<template id="wm-1">`–`<template id="wm-4">` blocks with
  your own project write-ups), Experience (timeline entries), Skills
  (proficiency bars — names and percentages are both illustrative),
  Education (degrees/certs), Testimonials (all three quotes are lorem
  ipsum with fictional attributions — swap `images/avatar-*.jpg` for
  real photos or initials of your own).
- **Assets**: `favicon.svg`/`favicon.png`/`apple-touch-icon.png` currently
  render a generic "Y" mark in the site's teal-on-black style —
  regenerate them with your own initial/logo (e.g. via
  [realfavicongenerator.net](https://realfavicongenerator.net)).
  `og-image.png` is a plain placeholder card — replace with a real
  1200×630 social preview. `resume.pdf` is a one-line stub PDF — replace
  with your actual résumé (it's linked from the nav, hero, and the
  Elsewhere section).
- **Domain**: `canonical`, `og:url`, JSON-LD `url`, `robots.txt`
  sitemap line, `sitemap.xml`, and the `_redirects` apex/www rule all use
  `example.com` — swap for your real domain everywhere.

## Analytics (optional)

Cookie consent + GA4 loading lives at the bottom of `main.js`. `GA` is
already set to the placeholder `G-XXXXXXXXXX` — replace it with your real
Measurement ID, or delete the whole IIFE plus the `#cbar`/`#pmodal`
markup in `index.html` if you don't want analytics at all. Consent is
required before the GA script loads; declining never fires a network
request.

## Security headers (`_headers`)

The CSP is intentionally strict (`default-src 'none'`, no
`unsafe-inline` for scripts). This only works because:

1. All page JS lives in the same-origin `/main.js` — don't move it back
   inline without also updating `script-src`.
2. The CDN `<script>` tags (Three.js, GSAP, ScrollTrigger, Lenis) carry
   `integrity=` (SRI) hashes pinned to their exact versions on
   `cdn.jsdelivr.net`, which is explicitly allow-listed in `script-src`.

**If you add or upgrade a CDN script**: fetch the file, compute its
`sha384` hash, and add both the new `integrity` attribute in
`index.html` and, if it's a new host, that host in `_headers`'
`script-src`. Example:

```bash
curl -sL <script-url> | openssl dgst -sha384 -binary | openssl base64 -A
```

Any new external host you add (fonts, images, APIs) needs a matching
entry in the relevant CSP directive (`script-src`, `style-src`,
`connect-src`, etc.) or the browser will silently block it — check
the browser console after deploying.

After deploying, verify with:
- https://securityheaders.com
- https://observatory.mozilla.org

### Deploying elsewhere

`_headers` and `_redirects` are Cloudflare Pages conventions — they're
inert on GitHub Pages (and Vercel/Netlify) and safe to leave in the repo
or delete. You just lose the CSP/HSTS hardening and the shortlink
redirects those two files provide. If you want equivalent security
headers on GitHub Pages, you'd need to front it with a CDN (e.g.
Cloudflare in front of your `github.io` domain) since GitHub Pages
itself doesn't support custom response headers.

All internal asset paths (`main.js`, `favicon.svg`, `resume.pdf`, etc.)
are relative, not root-absolute (`main.js`, not `/main.js`) — this is
required for GitHub Pages project sites, which serve from
`https://username.github.io/repo-name/` rather than domain root. If you
fork this and reintroduce a leading `/` on any asset path, it'll 404 on
GitHub Pages (root-absolute paths only work when the site is served
from an actual domain root, e.g. a custom domain or Cloudflare Pages).

## Performance notes

- The Three.js starfield and animated film-grain canvas both pause their
  render loop when the tab is backgrounded (`document.hidden`) to avoid
  draining battery — keep that check if you extend either loop.
- No raster images are used in the design itself (pure CSS/canvas/SVG),
  so there's nothing to lazy-load beyond the placeholder OG image and
  favicons you'll swap in.

## Accessibility

Reduced-motion users get the starfield/grain/hero-bloom disabled and
clip-text reveals skipped (see the `prefers-reduced-motion` block in
`index.html`). The privacy modal and cookie bar both trap focus and
close on <kbd>Escape</kbd>. If you add new interactive widgets, keep
keyboard operability (Tab/Enter/Space) in mind — the accordion and
timeline were built and tested with mouse + scroll; do a manual keyboard
pass before shipping if you extend them.

## License

MIT — free for personal and commercial use provided the copyright and permission notice shall be included in all copies or substantial portions of the Software. See [LICENSE](LICENSE).

---

by [jzmn-crft](https://github.com/jzmn-crft)
