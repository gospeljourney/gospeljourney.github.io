# VitePress Site Design

## Goal

Create a standalone, runnable VitePress documentation site in an isolated Git worktree.

## Scope

- Create branch `docs/vitepress` at `.worktrees/vitepress`.
- Use the official VitePress starter with npm.
- Keep the generated default documentation structure and scripts.
- Verify the production build succeeds.

## Out of scope

- Content customization, branding, or theme changes.
- Deployment configuration, including GitHub Pages.
- Additional plugins or integrations.

## Architecture

The project will use the standard VitePress layout: Markdown documents under `docs/` and site configuration under `docs/.vitepress/`. `package.json` will provide the development and production build commands; the generated static output remains untracked as a build artifact.

## Validation

Run the generated production build command. Success means VitePress can resolve the configuration and render the starter documentation into its output directory without errors.
