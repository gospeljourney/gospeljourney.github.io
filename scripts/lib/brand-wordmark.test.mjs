import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  TAGLINE_TEXT,
  TAGLINE_TRACKING,
  WORDMARK_TEXT,
  loadFont,
  outlineText,
  wordmarkFullSvg,
  wordmarkSvg,
} from './brand-wordmark.mjs'

test('문구: 헌법 태그라인과 타이틀 케이스 워드마크를 쓴다', () => {
  assert.equal(WORDMARK_TEXT, 'Gospel Journey')
  assert.equal(TAGLINE_TEXT, 'An Open Journey Through the Gospel')
})

test('loadFont: EB Garamond latin 500 의 메트릭', () => {
  const font = loadFont()
  assert.equal(font.unitsPerEm, 1000)
  assert.equal(font.capHeight, 650)
})

test('outlineText: 커닝이 반영된 폭을 낸다', () => {
  const { width } = outlineText(WORDMARK_TEXT)
  // 커닝 무시(글리프 advanceWidth 단순 합)는 6098, 커닝 적용은 6094
  assert.equal(Math.round(width), 6094)
})

test('outlineText: 자간을 주면 폭이 늘어난다', () => {
  const plain = outlineText(TAGLINE_TEXT)
  const tracked = outlineText(TAGLINE_TEXT, { tracking: 100 })
  const glyphCount = 34
  assert.equal(Math.round(tracked.width - plain.width), 100 * (glyphCount - 1))
})

test('outlineText: path 데이터를 만든다', () => {
  const { d } = outlineText(WORDMARK_TEXT)
  assert.ok(d.startsWith('M'))
  assert.ok(d.length > 1000)
})

test('outlineText: 같은 입력에 같은 출력 (결정성)', () => {
  assert.equal(outlineText(WORDMARK_TEXT).d, outlineText(WORDMARK_TEXT).d)
})

for (const [name, build] of [['wordmarkSvg', wordmarkSvg], ['wordmarkFullSvg', wordmarkFullSvg]]) {
  test(`${name}: text 요소를 만들지 않는다`, () => {
    assert.ok(!build().includes('<text'))
  })

  test(`${name}: 폰트 이름을 참조하지 않는다`, () => {
    assert.ok(!/font-family/i.test(build()))
  })

  test(`${name}: 브랜드 딥그린으로 칠한다`, () => {
    assert.match(build(), /fill="#2f5d50"/)
  })

  test(`${name}: 유효한 viewBox 를 갖는다`, () => {
    assert.match(build(), /viewBox="[-\d. ]+"/)
  })

  test(`${name}: 결정적이다`, () => {
    assert.equal(build(), build())
  })
}

test('wordmarkFullSvg: 워드마크·구분선·태그라인 세 덩어리를 담는다', () => {
  const svg = wordmarkFullSvg()
  assert.equal((svg.match(/<path /g) ?? []).length, 3)
  assert.ok(svg.includes('<circle'))
})

test('outlineText: bbox 가 자간을 반영한다', () => {
  // fontkit 의 run.bbox 는 여기서 수동으로 더하는 tracking 을 모른다.
  // 그 값을 그대로 쓰면 캔버스가 좁게 잡혀 태그라인 오른쪽이 잘린다.
  const plain = outlineText(TAGLINE_TEXT, { uppercase: true })
  const tracked = outlineText(TAGLINE_TEXT, { tracking: TAGLINE_TRACKING, uppercase: true })
  const plainInk = plain.bbox.maxX - plain.bbox.minX
  const trackedInk = tracked.bbox.maxX - tracked.bbox.minX

  assert.ok(
    trackedInk > plainInk + TAGLINE_TRACKING * 30,
    `자간을 준 잉크 폭 ${trackedInk} 가 자간 없는 ${plainInk} 대비 충분히 넓지 않다`
  )
})

test('wordmarkFullSvg: 모든 요소가 viewBox 안에 들어간다', () => {
  const svg = wordmarkFullSvg()
  const [, , canvasWidth] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number)

  const wordmark = outlineText(WORDMARK_TEXT)
  const tagline = outlineText(TAGLINE_TEXT, { tracking: TAGLINE_TRACKING, uppercase: true })
  const taglineWidth =
    ((tagline.bbox.maxX - tagline.bbox.minX) * (100 * (26 / 96))) / tagline.capHeight
  const wordmarkWidth = ((wordmark.bbox.maxX - wordmark.bbox.minX) * 100) / wordmark.capHeight

  assert.ok(
    canvasWidth >= Math.max(taglineWidth, wordmarkWidth) - 0.01,
    `캔버스 폭 ${canvasWidth} 가 태그라인 ${taglineWidth} / 워드마크 ${wordmarkWidth} 보다 좁다`
  )
})
