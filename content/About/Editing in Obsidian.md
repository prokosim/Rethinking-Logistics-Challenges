---
title: Editing in Obsidian
---

Open the `content` folder as an Obsidian vault. Each folder is one type of note: **Challenges**, **Metrics**, **Tools**, **Case studies**. The folder decides the type — there are no IDs.

## Creating a note

1. Right-click the folder → **New note**. The file name is the title.
2. Insert the matching template (*Templates: Insert template*).
3. Fill in the properties. Any value is accepted — a new category or platform simply becomes a new group on the website.

## Links between notes — enter each link once

| In a… | you fill in… | and the other note gets automatically… |
| --- | --- | --- |
| Case study | `challenges`, `metrics`, `tools` | `auto_case_studies` on the challenge, metric and tool |
| Tool | `metrics` (what it can calculate) | `auto_tools` on the metric |
| Metric | `challenges` (which decisions it informs) | `auto_metrics` on the challenge |
| — | — | `auto_tools` on the challenge (tools via its metrics) |

In a list property, type `[[` and pick the note.

> [!warning] Don't edit `auto_` properties
> They are rewritten from the other side every time the sync runs. To change them, change the link in the note where it is entered (see the table).

The sync runs automatically on GitHub after every push; you get the updated notes with your next pull. To run it yourself: `npm run sync`.

## Links to notes that don't exist yet

Allowed. Obsidian shows them as unresolved links; the website shows a "not documented yet" placeholder page until someone writes the note.

## Metrics: always say how it is calculated

Fill in `calculation` with a one-line formula or method (e.g. *Vegetated area ÷ site area × 100*), and explain more in the *Calculation* section. List the students' own names for the metric under `aliases` — search will find them.

## Images

Set **Settings → Files and links → Default location for new attachments** to the folder `Attachments`.
