import { test } from 'node:test'
import assert from 'node:assert/strict'

import { contrastRatio, relativeLuminance } from './color.mjs'

test('relativeLuminance: 검정은 0, 흰색은 1', () => {
  assert.equal(relativeLuminance('#000000'), 0)
  assert.equal(relativeLuminance('#ffffff'), 1)
})

test('contrastRatio: 검정과 흰색은 21:1', () => {
  assert.equal(contrastRatio('#000000', '#ffffff').toFixed(4), '21.0000')
})

test('contrastRatio: 인자 순서가 결과를 바꾸지 않는다', () => {
  assert.equal(contrastRatio('#2f5d50', '#f7f3e8'), contrastRatio('#f7f3e8', '#2f5d50'))
})

test('contrastRatio: 브랜드 딥그린과 크림의 실측값', () => {
  assert.equal(contrastRatio('#2f5d50', '#f7f3e8').toFixed(4), '6.7585')
})

test('contrastRatio: 기존 스크립트의 흰색 고정 계산과 일치한다', () => {
  const legacy = (hex) => {
    const channels = hex.slice(1).match(/../g).map((c) => Number.parseInt(c, 16) / 255)
    const luminance = channels
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      .reduce((total, c, index) => total + c * [0.2126, 0.7152, 0.0722][index], 0)
    return 1.05 / (luminance + 0.05)
  }
  for (const hex of ['#2f5d50', '#3f7465', '#274c42']) {
    assert.equal(contrastRatio(hex, '#ffffff').toFixed(6), legacy(hex).toFixed(6))
  }
})
