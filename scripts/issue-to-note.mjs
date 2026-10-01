#!/usr/bin/env node
// Turns an accepted GitHub issue (from one of the forms) into a note.
// Used by .github/workflows/issue-to-pr.yml. Prints the created file path.
//
//   ISSUE_BODY=… ISSUE_LABELS='["contribution","type:metric"]' ISSUE_NUMBER=3 ISSUE_AUTHOR=octocat node scripts/issue-to-note.mjs
//
// Form field ids = property names. Fields whose id starts with "s_" become body
// sections headed by the form label. List fields ("one per line") become lists;
// relation fields become [[links]] (links to notes that don't exist yet are fine).

import fs from "node:fs"
import path from "node:path"
import yaml from "js-yaml"
import { ROOT, CONTENT, loadKB } from "./lib/kb.mjs"

const fail = (m) => { console.error(`issue-to-note: ${m}`); process.exit(1) }
const body = process.env.ISSUE_BODY ?? ""
const labels = JSON.parse(process.env.ISSUE_LABELS ?? "[]")
const typeLabel = labels.find((l) => l.startsWith("type:")) ?? fail('no "type:…" label')
const type = typeLabel.slice(5)
const kb = loadKB()
const def = kb.schema.types[type] ?? fail(`unknown type ${type}`)
const relFields = new Set(kb.schema.relations.filter((r) => r.from === type).map((r) => r.field))
const LIST_FIELDS = new Set(["aliases", "challenges", "metrics", "tools"])

const formDir = path.join(ROOT, ".github", "ISSUE_TEMPLATE")
const form = fs.readdirSync(formDir).filter((f) => f.endsWith(".yml") && f !== "config.yml")
  .map((f) => yaml.load(fs.readFileSync(path.join(formDir, f), "utf8")))
  .find((f) => (f.labels ?? []).includes(typeLabel)) ?? fail(`no form with label ${typeLabel}`)
const byLabel = new Map(form.body.filter((b) => b.id && b.attributes?.label).map((b) => [b.attributes.label.trim(), b]))

const values = {}
for (const block of body.split(/^### /m).slice(1)) {
  const nl = block.indexOf("\n")
  const field = byLabel.get(block.slice(0, nl).trim())
  let v = block.slice(nl + 1).trim()
  if (v === "_No response_") v = ""
  if (field && v) values[field.id] = { v, label: field.attributes.label }
}
const name = (values.name?.v ?? "").replace(/[\\/:*?"<>|#^[\]]/g, "-").trim() || fail("no name")
if (kb.find(name)) fail(`"${name}" already exists`)

const fm = {}
const sections = []
for (const [id, { v, label }] of Object.entries(values)) {
  if (id === "name") continue
  if (id.startsWith("s_")) { sections.push(`## ${label}\n\n${v}`); continue }
  if (LIST_FIELDS.has(id) || relFields.has(id)) {
    const items = v.split(/\r?\n|,/).map((s) => s.replace(/^[-*]\s*/, "").replace(/^\[\[|\]\]$/g, "").trim()).filter(Boolean)
    fm[id] = relFields.has(id) ? items.map((i) => `[[${kb.find(i)?.name ?? i}]]`) : items
  } else fm[id] = v
}
fm.status = "proposed"
const text = `---\n${yaml.dump(fm, { lineWidth: -1, quotingType: '"' })}---\n\n> [!info] Community contribution\n> Proposed by @${process.env.ISSUE_AUTHOR ?? "?"} in issue #${process.env.ISSUE_NUMBER ?? "?"}.\n\n${sections.join("\n\n")}\n`
const rel = path.join("content", def.folder, `${name}.md`)
fs.mkdirSync(path.join(CONTENT, def.folder), { recursive: true })
fs.writeFileSync(path.join(ROOT, rel), text)
console.log(rel)
