# Sihwan Kim

Public portfolio: **https://sihxan.github.io/**

A static Korean/English portfolio with a continuous contour background and rolling animation. It runs directly in the browser; no installation or build step is needed.

## Update and deploy

Edit `index.html` and the relevant files in `assets/`, then commit and push to `main`. GitHub Pages publishes the repository root automatically. The repository's Pages settings use **Deploy from a branch → main → / (root)**, with HTTPS enabled.

Change the `?v=` asset version in `index.html` and the font URLs in `assets/portfolio.css` when updating assets to refresh browser caches. Keep font preloads and CSS URLs consistent.

## Local preview

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/.

## Fonts

Instrument Sans and SUIT are locally hosted, renamed subsets licensed under SIL OFL 1.1. Source information and both licenses are included in `assets/`.

The contour landscape is decorative and does not represent experimental data.
