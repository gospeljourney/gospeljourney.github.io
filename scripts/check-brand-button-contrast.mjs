import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { contrastRatio } from './lib/color.mjs'

const css = readFileSync(resolve('docs/.vitepress/theme/custom.css'), 'utf8')
const buttonTokens = [
  '--vp-button-brand-bg',
  '--vp-button-brand-hover-bg',
  '--vp-button-brand-active-bg'
]

function getBlock(selector) {
  const selectorPattern = selector === '.dark' ? '\\.dark' : ':root'
  const match = css.match(new RegExp(`${selectorPattern}\\s*\\{([\\s\\S]*?)\\n\\}`))
  if (!match) throw new Error(`Missing ${selector} token block`)
  return match[1]
}

for (const selector of [':root', '.dark']) {
  const block = getBlock(selector)

  for (const token of buttonTokens) {
    const match = block.match(new RegExp(`${token}:\\s*(#[0-9a-fA-F]{6})`))
    if (!match) throw new Error(`Missing ${selector} ${token} hex color token`)

    const ratio = contrastRatio(match[1], '#ffffff')
    if (ratio < 4.5) throw new Error(`${selector} ${token} has ${ratio.toFixed(2)}:1 contrast with white`)
  }
}

console.log('All VitePress brand-button states meet 4.5:1 contrast with white in light and dark themes.')
