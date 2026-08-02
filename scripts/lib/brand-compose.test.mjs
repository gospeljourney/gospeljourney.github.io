import { test } from 'node:test'
import assert from 'node:assert/strict'

import { PALETTE } from './brand-symbol.mjs'
import { pngSize, renderPng } from './brand-raster.mjs'
import { APPLE_TOUCH_SIZE, OG_SAFE_MARGIN, OG_SIZE, appleTouchSvg, ogSvg } from './brand-compose.mjs'

test('OG_SIZE: 1200x630', () => {
  assert.deepEqual(OG_SIZE, { width: 1200, height: 630 })
})

test('ogSvg: 캔버스 치수가 viewBox 에 반영된다', () => {
  assert.match(ogSvg(), /viewBox="0 0 1200 630"/)
})

test('ogSvg: 크림 배경을 전면에 깐다', () => {
  assert.match(ogSvg(), new RegExp(`<rect[^>]*width="1200"[^>]*height="630"[^>]*fill="${PALETTE.cream}"`))
})

test('ogSvg: text 요소를 만들지 않는다', () => {
  assert.ok(!ogSvg().includes('<text'))
})

test('ogSvg: 안전 여백 안에서 렌더된다', () => {
  const png = renderPng(ogSvg(), OG_SIZE.width, OG_SIZE.height)
  assert.deepEqual(pngSize(png), { width: 1200, height: 630 })
})

test('ogSvg: 결정적이다', () => {
  assert.equal(ogSvg(), ogSvg())
})

test('appleTouchSvg: 180 정사각이고 불투명 크림 배경', () => {
  assert.equal(APPLE_TOUCH_SIZE, 180)
  const svg = appleTouchSvg()
  assert.match(svg, /viewBox="0 0 180 180"/)
  assert.match(svg, new RegExp(`<rect[^>]*fill="${PALETTE.cream}"`))
})

test('appleTouchSvg: 심볼을 좌우 10% 여백으로 배치한다', () => {
  // 180 의 10% = 18, 심볼은 144 정사각
  assert.match(appleTouchSvg(), /translate\(18 18\)/)
})

test('appleTouchSvg: 180px 로 렌더된다', () => {
  assert.deepEqual(pngSize(renderPng(appleTouchSvg(), 180)), { width: 180, height: 180 })
})
