import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { appleTouchSvg, APPLE_TOUCH_SIZE, ogSvg, OG_SIZE } from './lib/brand-compose.mjs'
import { encodeIco, ICO_SIZES, renderPng } from './lib/brand-raster.mjs'
import { symbolSvg } from './lib/brand-symbol.mjs'
import { wordmarkFullSvg, wordmarkSvg } from './lib/brand-wordmark.mjs'

const PUBLIC_DIR = resolve('docs/public')

/** 디렉터리를 만들고 파일을 쓴 뒤 경로를 보고한다. */
function write(relativePath, contents) {
  const target = resolve(PUBLIC_DIR, relativePath)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, contents)
  console.log(`  ${relativePath}  ${contents.length.toLocaleString()} bytes`)
}

console.log('brand assets ->', PUBLIC_DIR)

const compact = symbolSvg('compact')

write('brand/symbol.svg', symbolSvg('full'))
write('brand/symbol-compact.svg', compact)
write('brand/wordmark.svg', wordmarkSvg())
write('brand/wordmark-full.svg', wordmarkFullSvg())

// favicon.svg 는 compact 기하 그대로다. 다크 변형이 없으므로 미디어 쿼리를 넣지 않는다.
write('favicon.svg', compact)
write('favicon.ico', encodeIco(ICO_SIZES.map((size) => ({ size, png: renderPng(compact, size) }))))
write('apple-touch-icon.png', renderPng(appleTouchSvg(), APPLE_TOUCH_SIZE))
write('og-image.png', renderPng(ogSvg(), OG_SIZE.width, OG_SIZE.height))

console.log('done')
