import fs from "node:fs"

const files = [
  "/app/node_modules/@elizaos/core/dist/node/index.node.js",
  "/app/node_modules/@elizaos/core/dist/browser/index.browser.js",
]

const replacements = [
  {
    from: "const value = secrets?.[key] || settings?.[key] || nestedSecrets?.[key] || this.settings[key];",
    to: "const value = secrets?.[key] || settings?.[key] || nestedSecrets?.[key] || (typeof process !== \"undefined\" ? process.env?.[key] : undefined) || this.settings[key];",
  },
]

let patched = 0

for (const file of files) {
  if (!fs.existsSync(file)) continue
  let source = fs.readFileSync(file, "utf8")
  let changed = false
  for (const { from, to } of replacements) {
    if (!source.includes(from)) continue
    source = source.replace(from, to)
    changed = true
  }
  if (changed) {
    fs.writeFileSync(file, source)
    patched += 1
  }
}

if (patched === 0) {
  throw new Error("Eliza runtime settings patch target not found")
}
