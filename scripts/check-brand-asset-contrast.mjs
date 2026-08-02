import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { contrastRatio } from './lib/color.mjs'

const DIST_ASSETS = resolve('docs/.vitepress/dist/assets')
const CONFIG_FILE = 'docs/.vitepress/config.mts'
const DOCS_DIR = resolve('docs')
const ASSET_FILES = [
  ...readdirSync(resolve('docs/public/brand'))
    .filter((file) => file.endsWith('.svg'))
    .sort()
    .map((file) => `docs/public/brand/${file}`),
  'docs/public/favicon.svg',
]
const THRESHOLD = 3

function cssFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return cssFiles(path)
    return entry.name.endsWith('.css') ? [path] : []
  })
}

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return entry.name.endsWith('.md') ? [path] : []
  })
}

function referenceSources(file) {
  const publicPath = `/${file.replace('docs/public/', '')}`
  return [CONFIG_FILE, ...markdownFiles(DOCS_DIR)]
    .filter((source) => readFileSync(source, 'utf8').includes(publicPath))
}

function pageBackgrounds() {
  const sources = cssFiles(DIST_ASSETS).map((path) => ({ path, css: readFileSync(path, 'utf8') }))
  const definitions = {
    light: /:root\s*\{[^}]*?--vp-c-bg\s*:\s*(#[0-9a-fA-F]{3,8})/,
    dark: /\.dark\s*\{[^}]*?--vp-c-bg\s*:\s*(#[0-9a-fA-F]{3,8})/,
  }

  return Object.fromEntries(Object.entries(definitions).map(([theme, pattern]) => {
    const source = sources.find(({ css }) => pattern.test(css))
    if (!source) throw new Error(`BLOCKED: built CSS has no ${theme} --vp-c-bg definition`)
    const match = source.css.match(pattern)
    return [theme, { color: normalizeHex(match[1]), source: source.path }]
  }))
}

function normalizeHex(hex) {
  const value = hex.toLowerCase()
  if (value.length === 4) return `#${[...value.slice(1)].map((part) => part + part).join('')}`
  if (value.length === 7) return value
  throw new Error(`Unsupported CSS color for contrast measurement: ${hex}`)
}

function colors(svg) {
  return [...svg.matchAll(/\b(?:fill|stroke)\s*=\s*["'](#[0-9a-fA-F]{6})["']/g)]
    .map((match) => match[1].toLowerCase())
    .filter((color, index, values) => values.indexOf(color) === index)
}

function viewBox(svg) {
  const match = svg.match(/\bviewBox\s*=\s*["']([^"']+)["']/)
  if (!match) return null
  const values = match[1].trim().split(/\s+/).map(Number)
  return values.length === 4 && values.every(Number.isFinite) ? values : null
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'i'))?.[1]
}

function selfBackground(svg) {
  const box = viewBox(svg)
  if (!box) return null
  const [minX, minY, width, height] = box
  const requiredRadius = Math.min(width, height) * 0.45

  for (const match of svg.matchAll(/<circle\b[^>]*>/gi)) {
    const tag = match[0]
    const fill = attribute(tag, 'fill')?.toLowerCase()
    const cx = Number(attribute(tag, 'cx'))
    const cy = Number(attribute(tag, 'cy'))
    const radius = Number(attribute(tag, 'r'))
    if (!fill || fill === 'none' || !/^#[0-9a-f]{6}$/.test(fill)) continue
    if (cx === minX + width / 2 && cy === minY + height / 2 && radius >= requiredRadius) {
      return { color: fill, evidence: `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}"/>` }
    }
  }

  return null
}

function result(ratio) {
  return `${ratio.toFixed(2)}:1 ${ratio >= THRESHOLD ? 'PASS' : 'FAIL'}`
}

function main() {
  const backgrounds = pageBackgrounds()
  const failures = []
  console.log(`WCAG 2.1 SC 1.4.11 threshold: ${THRESHOLD}:1 (non-text contrast)`)
  console.log(`Light --vp-c-bg: ${backgrounds.light.color} (${backgrounds.light.source})`)
  console.log(`Dark  --vp-c-bg: ${backgrounds.dark.color} (${backgrounds.dark.source})`)

  for (const file of ASSET_FILES) {
    const svg = readFileSync(resolve(file), 'utf8')
    const assetColors = colors(svg)
    const background = selfBackground(svg)
    const references = referenceSources(file)
    const pageChecks = Object.fromEntries(Object.entries(backgrounds).map(([theme, { color }]) => [
      theme,
      assetColors.some((assetColor) => contrastRatio(assetColor, color) >= THRESHOLD),
    ]))
    const failedThemes = Object.entries(pageChecks)
      .filter(([, passes]) => !passes)
      .map(([theme]) => theme)

    console.log(`\n${file}`)
    console.log(references.length > 0
      ? `Referenced: YES (${references.join(', ')})`
      : 'Referenced: NO')
    console.log(background
      ? `Self background: YES ${background.color}; evidence: ${background.evidence}`
      : 'Self background: NO; no filled circle centered on the viewBox with radius at least 45% of its smaller dimension.')
    console.log('Color     | light page         | dark page          | internal')
    console.log('----------|--------------------|--------------------|--------------------')
    for (const color of assetColors) {
      const internal = !background ? 'n/a' : color === background.color ? 'self' : result(contrastRatio(color, background.color))
      console.log(`${color.padEnd(9)} | ${result(contrastRatio(color, backgrounds.light.color)).padEnd(18)} | ${result(contrastRatio(color, backgrounds.dark.color)).padEnd(18)} | ${internal}`)
    }
    console.log(`Asset recognition | light: ${pageChecks.light ? 'PASS' : 'FAIL'} | dark: ${pageChecks.dark ? 'PASS' : 'FAIL'}`)

    if (failedThemes.length > 0) {
      const message = `${file}: ${failedThemes.join(' and ')} page has no asset color at ${THRESHOLD}:1 or higher`
      if (references.length > 0) failures.push(message)
      else console.warn(`WARN: unreferenced ${message}`)
    }
  }

  if (failures.length > 0) {
    console.error(`\nBrand asset contrast check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
    process.exitCode = 1
  } else {
    console.log('\nBrand asset contrast check passed for all referenced assets.')
  }
}

try {
  main()
} catch (error) {
  console.error(`Brand asset contrast check blocked: ${error.message}`)
  process.exitCode = 1
}
