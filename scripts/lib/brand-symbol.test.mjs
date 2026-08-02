import { test } from 'node:test'
import assert from 'node:assert/strict'

import { contrastRatio } from './color.mjs'
import { COMPACT, DECORATIVE_TOKENS, FULL, PALETTE, symbolSvg } from './brand-symbol.mjs'

test('PALETTE: 확정된 4색을 정확히 갖는다', () => {
  assert.deepEqual(PALETTE, {
    deep: '#2f5d50',
    mid: '#4f8b78',
    gold: '#e0c48a',
    cream: '#f7f3e8',
  })
})

test('PALETTE: 장식을 뺀 모든 토큰이 크림 대비 3:1 이상', () => {
  for (const [token, hex] of Object.entries(PALETTE)) {
    if (token === 'cream' || DECORATIVE_TOKENS.has(token)) continue
    const ratio = contrastRatio(hex, PALETTE.cream)
    assert.ok(ratio >= 3, `${token} 대비가 ${ratio.toFixed(2)}:1 로 3:1 미만`)
  }
})

test('PALETTE: 폐기한 밝은 세이지를 쓰지 않는다', () => {
  assert.ok(!Object.values(PALETTE).includes('#a9bf8e'))
})

test('PALETTE: 테마 브랜드 색과 값을 공유한다', () => {
  assert.equal(PALETTE.deep, '#2f5d50')
  assert.equal(PALETTE.mid, '#4f8b78')
})

for (const variant of ['full', 'compact']) {
  test(`symbolSvg(${variant}): 뷰박스가 0 0 64 64`, () => {
    assert.match(symbolSvg(variant), /viewBox="0 0 64 64"/)
  })

  test(`symbolSvg(${variant}): text 요소를 만들지 않는다`, () => {
    assert.ok(!symbolSvg(variant).includes('<text'))
  })

  test(`symbolSvg(${variant}): 팔레트 밖의 색을 쓰지 않는다`, () => {
    const used = symbolSvg(variant).match(/#[0-9a-f]{6}/g) ?? []
    const allowed = new Set(Object.values(PALETTE))
    for (const hex of used) assert.ok(allowed.has(hex), `허용되지 않은 색 ${hex}`)
  })

  test(`symbolSvg(${variant}): 같은 입력에 같은 출력 (결정성)`, () => {
    assert.equal(symbolSvg(variant), symbolSvg(variant))
  })
}

test('symbolSvg: 기본 인자는 full', () => {
  assert.equal(symbolSvg(), symbolSvg('full'))
})

test('심볼 기하: compact 테두리가 16px 에서 1px 이상이 되도록 굵다', () => {
  // 64 뷰박스 기준 stroke 5 는 16px 렌더에서 1.25px. full 의 2.4 는 0.6px 로 서브픽셀이 된다.
  assert.ok(COMPACT.strokeWidth * (16 / 64) >= 1)
  assert.ok(FULL.strokeWidth * (16 / 64) < 1)
})

test('심볼 기하: 테두리를 포함한 원이 뷰박스를 넘지 않는다', () => {
  for (const geometry of [FULL, COMPACT]) {
    assert.ok(geometry.radius + geometry.strokeWidth / 2 <= 32)
  }
})

test('심볼 기하: full 은 언덕 2겹, compact 는 1겹', () => {
  assert.equal(FULL.hills.length, 2)
  assert.equal(COMPACT.hills.length, 1)
})
