# AI Portfolio for GitHub Pages

This folder is a static GitHub Pages version of the portfolio. It does not include the Express server, OAuth, MySQL, admin editor, uploads, or tRPC API.

## Local Development

```bash
corepack enable
corepack pnpm install
corepack pnpm run dev
```

## Build

```bash
corepack pnpm run build
```

## GitHub Pages

Push this folder as a standalone repository, then enable **Settings > Pages > Build and deployment > GitHub Actions**.

The workflow in `.github/workflows/deploy.yml` builds and publishes `dist`. For a normal project page, the asset base path is inferred from the repository name. If you need a custom base path, set `VITE_BASE_PATH`, for example:

```bash
VITE_BASE_PATH=/my-repo/ corepack pnpm run build
```
