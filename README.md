# Sihwan Kim

Public portfolio: **https://sihxan.github.io/**

A static Korean/English portfolio with three featured projects, a five-project index, eight individual project pages, and a continuous contour background with rolling animation. It runs directly in the browser; no installation or build step is needed. Project pages preserve the selected language through links and a shareable `?lang=en` URL.

## Update and deploy

Edit `index.html`, project pages in `projects/<project>/index.html`, and relevant files in `assets/`, then commit and push to `main`. GitHub Pages publishes the repository root automatically. The repository's Pages settings use **Deploy from a branch → main → / (root)**, with HTTPS enabled.

Change the `?v=` asset version in `index.html`, all project pages, and the font URLs in `assets/portfolio.css` when updating assets to refresh browser caches. Keep font preloads and CSS URLs consistent.

## Local preview

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/.

## Projects

Each homepage project title and **Read project** link opens a dedicated page with background, contribution and results. Research pages also state validation limits and next questions. The pages include section navigation, a return link and previous/next project links.

- [CLIP small-object discrimination](https://sihxan.github.io/projects/clip-context/)
- [Small objects in VideoLLMs](https://sihxan.github.io/projects/spot-videollm/)
- [Video KV-cache compression](https://sihxan.github.io/projects/kv-cache/)
- [Model-cut and virtual try-on](https://sihxan.github.io/projects/sunicon-vton/)
- [Dataset distillation and selection bias](https://sihxan.github.io/projects/samba/)
- [Allmize](https://sihxan.github.io/projects/allmize/)
- [Generative models](https://sihxan.github.io/projects/generative-models/)
- [KHUDA projects](https://sihxan.github.io/projects/khuda/)

## Fonts

Instrument Sans and SUIT are locally hosted, renamed subsets licensed under SIL OFL 1.1. Source information and both licenses are included in `assets/`.

The contour landscape and typographic project illustrations are decorative and do not represent experimental data. The rolling bead follows the same continuous terrain at a constant speed; scrolling moves the camera independently. Motion can be paused, and reduced-motion preferences are respected.
