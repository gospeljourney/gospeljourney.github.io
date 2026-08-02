import { createRequire } from 'node:module'

import * as fontkit from 'fontkit'

import { PALETTE } from './brand-symbol.mjs'

const require = createRequire(import.meta.url)
const FONT_DIR = require.resolve('@fontsource/eb-garamond/package.json').replace('package.json', 'files/')

/** 태그라인 캡 하이트 비율. OG 기준 워드마크 96px 대 태그라인 26px. */
const TAGLINE_CAP_RATIO = 26 / 96
const RULE_WIDTH = (360 / 96) * 100
const RULE_THICKNESS = (2 / 96) * 100
const GAP_RULE = (32 / 96) * 100
const GAP_TAGLINE = (28 / 96) * 100

/** 사이트 siteTitle 과 같은 타이틀 케이스를 쓴다 (BRAND 원장 §4.8). */
export const WORDMARK_TEXT = 'Gospel Journey'

/** 헌법 §2 의 공식 태그라인. 원본 이미지의 다른 문구는 쓰지 않는다. */
export const TAGLINE_TEXT = 'An Open Journey Through the Gospel'

/** 태그라인 자간. 폰트 유닛(upem 1000) 기준이라 0.1em 이다. */
export const TAGLINE_TRACKING = 100

/** EB Garamond latin 서브셋을 연다. fontkit 2.x 는 woff2 를 직접 읽는다. */
export function loadFont(weight = 500) {
  return fontkit.openSync(`${FONT_DIR}eb-garamond-latin-${weight}-normal.woff2`)
}

/**
 * 텍스트를 폰트 유닛 좌표(Y-up)의 단일 path 로 굽는다.
 *
 * run.positions 를 쓰는 이유: 커닝이 여기에만 반영된다. glyph.advanceWidth 를 더하면 커닝이 빠진다.
 *
 * bbox 는 fontkit 의 run.bbox 가 아니라 배치된 글리프에서 직접 누적한다.
 * run.bbox 는 여기서 수동으로 더하는 tracking 을 모르기 때문에, 자간을 준 텍스트에서
 * 실제 그려지는 폭보다 좁게 나오고 그대로 캔버스를 잡으면 오른쪽이 잘린다.
 */
export function outlineText(text, { weight = 500, tracking = 0, uppercase = false } = {}) {
  const font = loadFont(weight)
  const run = font.layout(uppercase ? text.toUpperCase() : text)

  let cursor = 0
  let d = ''
  const ink = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }

  run.glyphs.forEach((glyph, index) => {
    const position = run.positions[index]
    const path = glyph.path.translate(cursor + position.xOffset, position.yOffset)
    const segment = path.toSVG()

    // 공백 글리프는 그려질 것이 없으므로 잉크 경계에 넣지 않는다.
    if (segment) {
      d += segment
      ink.minX = Math.min(ink.minX, path.bbox.minX)
      ink.minY = Math.min(ink.minY, path.bbox.minY)
      ink.maxX = Math.max(ink.maxX, path.bbox.maxX)
      ink.maxY = Math.max(ink.maxY, path.bbox.maxY)
    }

    cursor += position.xAdvance + tracking
  })

  const empty = ink.minX === Infinity

  return {
    d,
    width: run.glyphs.length > 0 ? cursor - tracking : 0,
    bbox: empty ? { minX: 0, minY: 0, maxX: 0, maxY: 0 } : ink,
    capHeight: font.capHeight,
    unitsPerEm: font.unitsPerEm,
  }
}

/** 폰트 좌표(Y-up)를 SVG 좌표(Y-down)로 뒤집는 그룹 변환을 만든다. */
function flipped(d, topY) {
  return `<g transform="translate(0 ${round(topY)}) scale(1 -1)"><path d="${d}" fill="${PALETTE.deep}"/></g>`
}

/** 부동소수 잡음이 diff 를 흔들지 않도록 자른다. */
function round(value) {
  return Number(value.toFixed(3))
}

/** 중앙 도트를 비우고 좌우로 뻗는 구분선. */
function ruleLine(centerX, y) {
  const half = RULE_WIDTH / 2
  const gap = RULE_THICKNESS * 4
  const left = `M${round(centerX - half)} ${round(y)} h${round(half - gap)} v${round(RULE_THICKNESS)} h${round(-(half - gap))} z`
  const right = `M${round(centerX + gap)} ${round(y)} h${round(half - gap)} v${round(RULE_THICKNESS)} h${round(-(half - gap))} z`
  return `${left}${right}`
}

/** 워드마크 단독 SVG. 잉크 경계에 딱 맞는 viewBox 를 쓴다. */
export function wordmarkSvg() {
  const { d, bbox } = outlineText(WORDMARK_TEXT)
  const width = round(bbox.maxX - bbox.minX)
  const height = round(bbox.maxY - bbox.minY)

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${round(bbox.minX)} 0 ${width} ${height}" role="img" aria-labelledby="gj-wordmark-title">`,
    '<title id="gj-wordmark-title">Gospel Journey</title>',
    flipped(d, bbox.maxY),
    '</svg>',
  ].join('')
}

/**
 * 워드마크 + 구분선 + 태그라인 록업.
 * 좌표계는 워드마크 캡 하이트를 100 으로 두는 디자인 유닛이다.
 */
export function wordmarkFullSvg() {
  const wordmark = outlineText(WORDMARK_TEXT)
  const tagline = outlineText(TAGLINE_TEXT, { tracking: TAGLINE_TRACKING, uppercase: true })

  const wordmarkScale = 100 / wordmark.capHeight
  const taglineScale = (100 * TAGLINE_CAP_RATIO) / tagline.capHeight

  const wordmarkWidth = (wordmark.bbox.maxX - wordmark.bbox.minX) * wordmarkScale
  const wordmarkHeight = (wordmark.bbox.maxY - wordmark.bbox.minY) * wordmarkScale
  const taglineWidth = (tagline.bbox.maxX - tagline.bbox.minX) * taglineScale
  const taglineHeight = 100 * TAGLINE_CAP_RATIO

  const canvasWidth = Math.max(wordmarkWidth, taglineWidth, RULE_WIDTH)
  const canvasHeight = wordmarkHeight + GAP_RULE + RULE_THICKNESS + GAP_TAGLINE + taglineHeight
  const centerX = canvasWidth / 2

  const ruleY = wordmarkHeight + GAP_RULE
  const taglineTop = ruleY + RULE_THICKNESS + GAP_TAGLINE

  const wordmarkX = centerX - wordmarkWidth / 2 - wordmark.bbox.minX * wordmarkScale
  const taglineX = centerX - taglineWidth / 2 - tagline.bbox.minX * taglineScale

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(canvasWidth)} ${round(canvasHeight)}" role="img" aria-labelledby="gj-lockup-title">`,
    `<title id="gj-lockup-title">Gospel Journey — ${TAGLINE_TEXT}</title>`,
    `<g transform="translate(${round(wordmarkX)} 0) scale(${round(wordmarkScale)})">`,
    flipped(wordmark.d, wordmark.bbox.maxY),
    '</g>',
    `<path d="${ruleLine(centerX, ruleY)}" fill="${PALETTE.mid}"/>`,
    `<circle cx="${round(centerX)}" cy="${round(ruleY + RULE_THICKNESS / 2)}" r="${round(RULE_THICKNESS * 2)}" fill="${PALETTE.mid}"/>`,
    `<g transform="translate(${round(taglineX)} ${round(taglineTop)}) scale(${round(taglineScale)})">`,
    flipped(tagline.d, tagline.bbox.maxY),
    '</g>',
    '</svg>',
  ].join('')
}
