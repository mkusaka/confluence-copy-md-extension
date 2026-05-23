---
name: release-confluence-copy-md-extension
description: Release workflow for the mkusaka/confluence-copy-md-extension Chrome extension. Use when Codex is asked to prepare, cut, verify, troubleshoot, or document a new version release for this repository, including package.json version bumps, v* tag pushes, GitHub Release assets, release workflow checks, and Chrome Web Store handoff.
---

# Release Confluence Copy MD Extension

## Overview

Use this skill to release `mkusaka/confluence-copy-md-extension` end to end. The repository release automation currently creates a GitHub Release with `chrome-extension.zip`; Chrome Web Store publication is a separate manual handoff unless repository automation is added later.

## Ground Rules

- Use `gh` for all GitHub operations.
- Confirm live repository state before deciding the version or tag. Do not rely on a stale local checkout.
- Before committing, inspect recent commit history and match the repository's commit-message style.
- Keep the release change scoped. Do not include unrelated dependency, workflow, dist, or generated zip changes unless the user explicitly asked for them.
- If GitHub Actions, GitHub Release, or Chrome Web Store behavior matters to the answer, verify current official documentation or live state before giving review guidance.
- Do not submit to the Chrome Web Store unless the user explicitly asks and the item/account details are known.

## Repository Facts

- The extension version comes from `package.json`.
- `src/manifest.config.ts` imports `package.json` and sets `manifest.version` from `packageJson.version`.
- `public/manifest.json` is not the authoritative release manifest for the Vite/CRXJS build.
- `pnpm package` runs `pnpm build`, zips the `dist/` contents, and writes `chrome-extension.zip`.
- `.github/workflows/release.yml` runs only on pushed tags matching `v*`.
- The release workflow installs dependencies, runs `pnpm package`, and creates or updates a GitHub Release asset named `chrome-extension.zip`.
- `dist/` is ignored. `chrome-extension.zip` is tracked historically, but the workflow rebuilds it from the tag; avoid staging a regenerated zip for a normal version-only release unless there is a deliberate reason.
- As of 2026-05-24, `v0.4.1` existed as a tag but its release workflow had failed and no GitHub Release existed for it; the latest successful GitHub Release was `v0.4.0`. Treat this as stale context and re-check live state before acting.

## Release Workflow

1. Refresh and inspect live state:

   ```bash
   git status --short --branch
   git fetch origin --tags
   gh release list --repo mkusaka/confluence-copy-md-extension --limit 10
   gh run list --repo mkusaka/confluence-copy-md-extension --workflow release.yml --limit 10
   gh run list --repo mkusaka/confluence-copy-md-extension --branch main --limit 10
   ```

2. Choose the next version:

   - Prefer the next patch version from the highest released/tagged version unless the user requests minor or major.
   - If a tag exists but its GitHub Release failed, do not overwrite or move the tag by default. Prefer a new patch version unless the user explicitly wants to repair the existing tag.
   - Keep `package.json` version and tag aligned, e.g. `0.4.2` and `v0.4.2`.

3. Update `package.json` only for a normal release bump:

   ```bash
   pnpm version 0.4.2 --no-git-tag-version
   ```

   If `pnpm version` changes formatting or unrelated files, use a minimal edit instead.

4. Run local verification:

   ```bash
   pnpm install --frozen-lockfile
   pnpm format:check
   pnpm lint
   pnpm test
   pnpm package
   unzip -p chrome-extension.zip manifest.json
   ```

   Confirm the zipped `manifest.json` version matches `package.json`. After packaging, inspect `git status`; do not automatically stage `chrome-extension.zip`.

5. Commit and push:

   ```bash
   git log --oneline --max-count=10
   git status --short
   git add package.json
   git diff --cached --check
   git commit -m "Chore: Bump version to 0.4.2"
   git push origin main
   ```

6. Confirm `main` CI is green:

   ```bash
   gh run list --repo mkusaka/confluence-copy-md-extension --branch main --limit 5
   gh run watch <run-id> --repo mkusaka/confluence-copy-md-extension --exit-status
   ```

7. Create and push the release tag:

   ```bash
   git tag v0.4.2
   git push origin v0.4.2
   ```

8. Watch the release workflow and verify the GitHub Release:

   ```bash
   gh run list --repo mkusaka/confluence-copy-md-extension --workflow release.yml --limit 3
   gh run watch <run-id> --repo mkusaka/confluence-copy-md-extension --exit-status
   gh release view v0.4.2 --repo mkusaka/confluence-copy-md-extension --json url,assets,publishedAt,tagName
   ```

9. If the Chrome Web Store needs to be updated, hand off the GitHub Release asset:

   - Download or use the `chrome-extension.zip` attached to the GitHub Release.
   - Upload it to the existing Chrome Web Store item in the Developer Dashboard.
   - Submit for review.
   - Record that Web Store publication is manual unless the repository gains Web Store Publish API automation.

## Troubleshooting

- If the release workflow fails in setup-node or pnpm cache, inspect whether the tag uses an old workflow snapshot. Tag-triggered workflows run from the tagged commit, not necessarily current `main`.
- If a tag was pushed before the workflow fix, prefer cutting a new patch version rather than force-moving the tag.
- If `gh release view <tag>` is missing but the tag exists, inspect the failed workflow with:

  ```bash
  gh run view <run-id> --repo mkusaka/confluence-copy-md-extension --log-failed
  ```

- If `pnpm package` changes `chrome-extension.zip`, treat that as a verification artifact first. Stage it only if the user wants the checked-in zip refreshed.
- If Chrome rejects the package, verify the built `manifest.json` version and Chrome extension version syntax against current Chrome documentation.

## Final Report

Report:

- The version and tag released.
- The GitHub Release URL and whether `chrome-extension.zip` is attached.
- The release workflow run result.
- Whether Chrome Web Store publication was performed, handed off, or intentionally not touched.
- Any files intentionally left unstaged, especially `chrome-extension.zip` or `dist/`.
