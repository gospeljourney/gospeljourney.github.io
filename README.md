# Gospel Journey

[Gospel Journey](https://gospeljourney.github.io/) is an open learning journey for people who want to learn, understand, and live the Gospel. The public site is built with VitePress and published as a static GitHub Pages site.

## Current language scope

Korean is the source of truth. When translations differ in meaning, the Korean text is the one to trust.

| Path | What visitors see |
| --- | --- |
| `/ko/` | Korean, the original text |
| `/en/` | English translation of the course |
| `/ja/` | Japanese home page. Course pages show the Korean text with a note in Japanese, because the Japanese translation is not ready |

Chinese is not part of the current scope. That is a decision about where to start, not a decision to leave it out for good.

## Requirements

- Node.js 22 (the same version used by the deployment workflow)
- npm (included with Node.js)

## Local development

Install the locked dependencies, then start the VitePress development server:

```bash
npm ci
npm run docs:dev
```

Build the production site and preview that build locally:

```bash
npm run docs:build
npm run docs:preview
```

The commands above correspond directly to the repository scripts:

| Command | Purpose |
| --- | --- |
| `npm run docs:dev` | Start the VitePress development server for `docs/`. |
| `npm run docs:build` | Build the production site from `docs/`. |
| `npm run docs:preview` | Serve the previously built production site for local inspection. |

Run `npm run docs:build` before sharing or deploying documentation changes. Run it again before `npm run docs:preview` whenever the source changes.

## GitHub Pages deployment

The [deployment workflow](.github/workflows/deploy.yml) runs when a change is pushed to `main`, or when it is started manually with `workflow_dispatch` in GitHub Actions. It performs the following flow:

1. Checks out the repository and sets up Node.js 22 with the npm cache.
2. Configures GitHub Pages, installs the locked dependencies with `npm ci`, and runs `npm run docs:build`.
3. Uploads `docs/.vitepress/dist` as the GitHub Pages artifact.
4. Deploys that artifact after the build job succeeds.

The workflow itself is the deployment mechanism; no separate local publish command is required.

## Public verification

After a successful deployment, verify the site in a browser:

1. Open [https://gospeljourney.github.io/](https://gospeljourney.github.io/). The entry page should take visitors to the Korean site.
2. Open [https://gospeljourney.github.io/ko/](https://gospeljourney.github.io/ko/) directly. It should show the Korean home page.
3. Open [https://gospeljourney.github.io/en/](https://gospeljourney.github.io/en/). It should show the English home page, and the course pages under it should be in English.
4. Open [https://gospeljourney.github.io/ja/](https://gospeljourney.github.io/ja/). It should show the Japanese home page. Open a course page under it: the lesson text stays Korean and carries a note in Japanese. That is the expected behaviour, not a failure.

These checks cover the public entry path and each of the three language paths, including the case where a page is served in Korean because its translation is not ready.
