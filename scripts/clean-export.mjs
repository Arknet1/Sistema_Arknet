import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../out')

function isNextMetadataOnly(entries) {
  return entries.every(
    (name) => name.endsWith('.txt') || name.startsWith('__next')
  )
}

function shouldRemoveDir(dirPath) {
  const entries = fs.readdirSync(dirPath)
  if (entries.includes('index.html')) return false

  const parent = path.dirname(dirPath)
  const name = path.basename(dirPath)
  const htmlSibling = path.join(parent, `${name}.html`)

  if (!fs.existsSync(htmlSibling)) return false
  return isNextMetadataOnly(entries)
}

function replaceWithIndexHtml(dirPath) {
  const parent = path.dirname(dirPath)
  const name = path.basename(dirPath)
  const htmlSibling = path.join(parent, `${name}.html`)

  fs.rmSync(dirPath, { recursive: true })
  fs.mkdirSync(dirPath)
  fs.copyFileSync(htmlSibling, path.join(dirPath, 'index.html'))
  console.log(`Replaced ${path.relative(outDir, dirPath)}/ → index.html only`)
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === '_next') continue

    const full = path.join(dir, entry.name)
    walk(full)

    if (shouldRemoveDir(full)) {
      replaceWithIndexHtml(full)
    }
  }
}

/** ex: loja.html + loja/ → loja/index.html (evita 403 em /loja/) */
function addIndexHtmlForRouteDirs() {
  for (const name of fs.readdirSync(outDir)) {
    if (name.startsWith('_') || name.startsWith('.')) continue

    const dirPath = path.join(outDir, name)
    const htmlPath = path.join(outDir, `${name}.html`)

    if (
      fs.existsSync(dirPath) &&
      fs.statSync(dirPath).isDirectory() &&
      fs.existsSync(htmlPath)
    ) {
      const indexPath = path.join(dirPath, 'index.html')
      fs.copyFileSync(htmlPath, indexPath)
      console.log(`Added ${name}/index.html`)
    }
  }
}

if (!fs.existsSync(outDir)) {
  console.error('out/ not found — run next build first')
  process.exit(1)
}

walk(outDir)
addIndexHtmlForRouteDirs()
