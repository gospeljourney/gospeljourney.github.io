/**
 * 브랜드 팔레트. deep 은 --vp-c-brand-1, mid 는 --vp-c-brand-3 과 값을 공유한다.
 * 테마 색을 바꾸면 여기도 같이 바꾼다 (BRAND 원장 §4.2).
 */
export const PALETTE = {
  deep: '#2f5d50',
  mid: '#4f8b78',
  gold: '#e0c48a',
  cream: '#f7f3e8',
}

/** 장식 요소. 크림 대비 3:1 기준에서 제외한다. 마크의 판독은 deep 이 담당한다. */
export const DECORATIVE_TOKENS = new Set(['gold'])

/** 풀디테일 기하. 32px 이상에서 쓴다. */
export const FULL = {
  radius: 30,
  strokeWidth: 2.4,
  sun: { cx: 32, cy: 31.2, r: 8.4 },
  hills: [
    { fill: 'mid', d: 'M0 29 C 8 26, 14 25, 20 27 C 25 29, 29 29, 34 28 C 40 26, 44 27, 49 25 C 55 22, 60 24, 64 24 L64 64 L0 64 Z' },
    { fill: 'deep', d: 'M0 35 C 8 31, 15 33, 21 36 C 27 38, 32 36, 37 34 C 44 31, 51 33, 57 30 C 60 29, 62 29, 64 30 L64 64 L0 64 Z' },
  ],
  road: 'M31.25 32 C 30.8 39, 25.8 48, 13 64 L51 64 C 38.2 48, 33.2 39, 32.75 32 Z',
  cross: 'M30.5 13 h3 v7.2 h5.8 v3 h-5.8 v8.8 h-3 v-8.8 h-5.8 v-3 h5.8 z',
}

/** 작은 크기 전용 기하. 16·24px 에서 쓴다. 실루엣은 FULL 과 같고 획만 굵다. */
export const COMPACT = {
  radius: 29.5,
  strokeWidth: 5,
  sun: { cx: 32, cy: 31, r: 8.8 },
  hills: [
    // 해가 걸치는 구간(x 23~41)은 능선을 평평하게 둔다. 좌우 높이가 다르면 해가 한쪽으로 쏠린 덩어리로 보인다.
    { fill: 'deep', d: 'M0 34 C 8 31, 14 32, 20 32 C 26 32, 38 32, 44 32 C 50 31, 57 29, 64 27 L64 64 L0 64 Z' },
  ],
  road: 'M30.5 32 C 30.1 39, 25 48, 15.5 64 L48.5 64 C 39 48, 33.9 39, 33.5 32 Z',
  cross: 'M29.6 13 h4.8 v6.4 h7 v4.6 h-7 v8 h-4.8 v-8 h-7 v-4.6 h7 z',
}

const GEOMETRY = { full: FULL, compact: COMPACT }

/**
 * 심볼 SVG 문자열을 만든다.
 * 크림 원판이 자기 배경이라 어떤 배경 위에서도 성립한다. 다크 변형을 만들지 않는 이유다 (BRAND 원장 §4.5).
 */
export function symbolSvg(variant = 'full') {
  const geometry = GEOMETRY[variant]
  if (!geometry) throw new Error(`알 수 없는 심볼 변형: ${variant}`)

  const { radius, strokeWidth, sun, hills, road, cross } = geometry
  const clipId = `gj-${variant}-clip`
  const titleId = `gj-${variant}-title`

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-labelledby="${titleId}">`,
    `<title id="${titleId}">Gospel Journey</title>`,
    `<clipPath id="${clipId}"><circle cx="32" cy="32" r="${radius}"/></clipPath>`,
    `<circle cx="32" cy="32" r="${radius}" fill="${PALETTE.cream}"/>`,
    `<g clip-path="url(#${clipId})">`,
    `<circle cx="${sun.cx}" cy="${sun.cy}" r="${sun.r}" fill="${PALETTE.gold}"/>`,
    ...hills.map((hill) => `<path d="${hill.d}" fill="${PALETTE[hill.fill]}"/>`),
    `<path d="${road}" fill="${PALETTE.cream}"/>`,
    `<path d="${cross}" fill="${PALETTE.deep}"/>`,
    '</g>',
    `<circle cx="32" cy="32" r="${radius}" fill="none" stroke="${PALETTE.deep}" stroke-width="${strokeWidth}"/>`,
    '</svg>',
  ].join('')
}
