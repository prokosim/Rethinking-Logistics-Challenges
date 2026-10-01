# Rethinking Logistics Challenges

**Evidence-based design in logistics architecture.** A knowledge base that links design **challenges** to the **metrics** that inform decisions, the **tools** that calculate them, and **case studies** — student projects from the *Rethinking.Logistics* studio at ARCHIP Prague (2026).

```
Case study ──uses──▶ Tool ──calculates──▶ Metric ──informs decisions on──▶ Challenge
```

- **Authoring:** Obsidian — open the `content/` folder as a vault.
- **Website:** Quartz static site on GitHub Pages, rebuilt on every push.
- **Contributions:** GitHub issue forms → review → automatic pull request.

## Simple by design

- **No IDs.** A note's file name is its title; its folder is its type (`Challenges/`, `Metrics/`, `Tools/`, `Case studies/`).
- **No allowed-value lists.** Any value you type is accepted; new categories simply become new groups.
- **Nothing blocks the build.** The check only warns. Links to notes that don't exist yet get a placeholder page.
- **Links are entered once.** `npm run sync` (and GitHub, on every push) writes the reverse links into the other notes as `auto_…` properties — never edit those by hand.

| Entered in… | Property | Written automatically into… |
| --- | --- | --- |
| Case study | `challenges`, `metrics`, `tools` | `auto_case_studies` on challenges, metrics, tools |
| Tool | `metrics` | `auto_tools` on metrics |
| Metric | `challenges` | `auto_metrics` (and `auto_tools`) on challenges |

The structure is described in `schema/schema.yml`.

## Repository layout

```
content/            Obsidian vault = website content (About, Challenges, Metrics, Tools, Case studies, Overviews, Templates, Attachments)
schema/schema.yml   note types, their properties and relations
scripts/            sync.mjs · validate.mjs · generate-overviews.mjs · build-site.mjs · issue-to-note.mjs
site/               Quartz configuration, layout and styles
_github/ or .github issue forms and workflows (rename _github → .github before the first push)
portfolios/         student PDFs — kept locally, NOT published (in .gitignore)
```

## Working locally

Node.js 22+ and Git.

```bash
npm install
npm run sync       # write reverse links (auto_ properties)
npm run validate   # friendly check, warnings only
npm run preview    # build and serve at http://localhost:8080
```

## Search

The website search is patched at build time to be fuzzy: it ignores accents, matches parts of words and tolerates small typos (FlexSearch `LatinExtra` encoder, full tokenisation of titles, partial-match suggestions).

## Publishing on GitHub (one time)

0. Rename `_github` to `.github`.
1. Create the repository and push. Edit `repoUrl` and `baseUrl` in `site.config.json`.
2. **Settings → Pages → Source: GitHub Actions.**
3. **Settings → Actions → General → Workflow permissions:** *Read and write* + *Allow GitHub Actions to create and approve pull requests*.
4. **Actions → Set up labels → Run workflow** (creates the labels the forms use).

## Licence

To be decided — see `LICENSE.md`. Portfolios remain the work of their authors and are linked, not copied.
