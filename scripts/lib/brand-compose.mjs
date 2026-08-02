import { PALETTE, symbolSvg } from './brand-symbol.mjs'
import { wordmarkFullSvg } from './brand-wordmark.mjs'

export const OG_SIZE = { width: 1200, height: 630 }

/** 모든 요소가 이 여백 안쪽에 들어와야 한다. */
export const OG_SAFE_MARGIN = 60

export const APPLE_TOUCH_SIZE = 180

const OG_SYMBOL_SIZE = 200
const OG_SYMBOL_GAP = 48

/** 다른 SVG 를 중첩할 수 있도록 루트 svg 태그와 title 을 벗겨 내용만 남긴다. */
function innerSvg(svg) {
  return svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/<title[^>]*>.*?<\/title>/, '')
}

/** 중첩할 SVG 의 viewBox 를 읽는다. */
function viewBoxOf(svg) {
  const [minX, minY, width, height] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number)

  return { minX, minY, width, height }
}

/** 1200x630 OG 이미지. 심볼과 록업을 세로로 쌓아 중앙 정렬한다. */
export function ogSvg() {
  const lockup = wordmarkFullSvg()
  const box = viewBoxOf(lockup)

  // 워드마크 캡 하이트 96px 기준. 록업 좌표계는 캡 하이트 = 100 디자인 유닛이다.
  const lockupScale = 96 / 100
  const lockupWidth = box.width * lockupScale
  const lockupHeight = box.height * lockupScale

  const stackHeight = OG_SYMBOL_SIZE + OG_SYMBOL_GAP + lockupHeight
  const top = (OG_SIZE.height - stackHeight) / 2
  const centerX = OG_SIZE.width / 2

  const symbolX = centerX - OG_SYMBOL_SIZE / 2
  const lockupX = centerX - lockupWidth / 2
  const lockupY = top + OG_SYMBOL_SIZE + OG_SYMBOL_GAP

  if (top < OG_SAFE_MARGIN) throw new Error(`OG 스택이 안전 여백을 넘는다: 상단 ${top.toFixed(1)}px`)
  if (lockupWidth > OG_SIZE.width - OG_SAFE_MARGIN * 2) {
    throw new Error(`OG 록업 폭 ${lockupWidth.toFixed(1)}px 가 안전폭을 넘는다`)
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${OG_SIZE.width} ${OG_SIZE.height}" width="${OG_SIZE.width}" height="${OG_SIZE.height}">`,
    `<rect x="0" y="0" width="${OG_SIZE.width}" height="${OG_SIZE.height}" fill="${PALETTE.cream}"/>`,
    `<g transform="translate(${round(symbolX)} ${round(top)}) scale(${round(OG_SYMBOL_SIZE / 64)})">${innerSvg(symbolSvg('full'))}</g>`,
    `<g transform="translate(${round(lockupX)} ${round(lockupY)}) scale(${round(lockupScale)})">${innerSvg(lockup)}</g>`,
    '</svg>',
  ].join('')
}

/** iOS 홈 화면 아이콘. 모서리를 iOS 가 마스킹하므로 투명 배경을 쓰지 않는다. */
export function appleTouchSvg() {
  const inset = APPLE_TOUCH_SIZE * 0.1
  const symbolSize = APPLE_TOUCH_SIZE - inset * 2

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${APPLE_TOUCH_SIZE} ${APPLE_TOUCH_SIZE}" width="${APPLE_TOUCH_SIZE}" height="${APPLE_TOUCH_SIZE}">`,
    `<rect x="0" y="0" width="${APPLE_TOUCH_SIZE}" height="${APPLE_TOUCH_SIZE}" fill="${PALETTE.cream}"/>`,
    `<g transform="translate(${inset} ${inset}) scale(${round(symbolSize / 64)})">${innerSvg(symbolSvg('full'))}</g>`,
    '</svg>',
  ].join('')
}

function round(value) {
  return Number(value.toFixed(3))
}
