#!/usr/bin/env node
// Writes the reverse links ("auto_" properties) into the notes.
//
// Example: if the Case study "Sara Sulollari – Wind Rós" lists [[Ladybug]] under
// `tools`, the Tool note "Ladybug" gets the case study under `auto_case_studies`.
//
// Only auto_ properties are touched; everything else in the note stays exactly
// as you wrote it. Run it locally with `npm run sync` — GitHub also runs it on
// every push and commits the result.
//
// Usage: node scripts/sync.mjs [--check]   (--check: report only, exit 1 if out of date)

import fs from "node:fs"
import { loadKB, computeAuto } from "./lib/kb.mjs"

const check = process.argv.includes("--check")
const kb = loadKB()
const auto = computeAuto(kb)
let changed = []

const yamlList = (key, names) =>
  names.length ? `${key}:\n${names.map((n) => `  - "[[${n.replace(/"/g, '\\"')}]]"`).join("\n")}` : `${key}: []`

for (const n of kb.notes) {
  const fields = auto.get(n)
  if (!n.type || !fields || !Object.keys(fields).length) continue
  if (n.error) {
    console.log(`⚠️  ${n.rel}: properties could not be read (${n.error}) — skipped`)
    continue
  }
  const fm = n.fmText ?? ""
  // remove existing auto_ blocks (key line + indented list lines)
  const kept = []
  let skipping = false
  for (const line of fm.split(/\r?\n/)) {
    if (/^auto_[\w-]*\s*:/.test(line)) { skipping = true; continue }
    if (skipping && (/^\s+-/.test(line) || /^\s*$/.test(line))) continue
    skipping = false
    kept.push(line)
  }
  while (kept.length && kept[kept.length - 1].trim() === "") kept.pop()
  const blocks = Object.keys(fields).sort().map((k) => yamlList(k, fields[k]))
  const newFm = [...kept, ...blocks].join("\n")
  const newRaw = `---\n${newFm}\n---\n${n.fmText === null ? "\n" : ""}${n.body}`
  if (newRaw !== n.raw) {
    changed.push(n.rel)
    if (!check) fs.writeFileSync(n.file, newRaw)
  }
}

if (check) {
  if (changed.length) {
    console.log(`Reverse links out of date in ${changed.length} note(s). Run: npm run sync`)
    process.exit(1)
  }
  console.log("✅ Reverse links up to date")
} else {
  console.log(changed.length ? `Updated reverse links in ${changed.length} note(s)` : "Reverse links already up to date")
}
