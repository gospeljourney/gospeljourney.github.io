import { test } from 'node:test'
import assert from 'node:assert/strict'

import { symbolSvg } from './brand-symbol.mjs'
import { ICO_SIZES, encodeIco, pngSize, renderPng } from './brand-raster.mjs'

test('renderPng: PNG 시그니처를 가진 버퍼를 낸다', () => {
  const png = renderPng(symbolSvg('compact'), 32)
  assert.deepEqual(png.subarray(0, 8), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
})

test('renderPng: 요청한 치수로 렌더한다', () => {
  for (const size of [16, 32, 180]) {
    assert.deepEqual(pngSize(renderPng(symbolSvg('compact'), size)), { width: size, height: size })
  }
})

test('renderPng: 폭과 높이를 따로 줄 수 있다', () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f7f3e8"/></svg>'
  assert.deepEqual(pngSize(renderPng(svg, 1200, 630)), { width: 1200, height: 630 })
})

test('renderPng: 같은 입력에 같은 바이트 (결정성)', () => {
  assert.deepEqual(renderPng(symbolSvg('compact'), 32), renderPng(symbolSvg('compact'), 32))
})

test('pngSize: PNG 가 아니면 던진다', () => {
  assert.throws(() => pngSize(Buffer.from('not a png at all')), /PNG/)
})

test('ICO_SIZES: 16·32·48 세 크기', () => {
  assert.deepEqual(ICO_SIZES, [16, 32, 48])
})

test('encodeIco: ICONDIR 헤더가 규격을 지킨다', () => {
  const entries = ICO_SIZES.map((size) => ({ size, png: renderPng(symbolSvg('compact'), size) }))
  const ico = encodeIco(entries)

  assert.equal(ico.readUInt16LE(0), 0, 'reserved 는 0')
  assert.equal(ico.readUInt16LE(2), 1, 'type 은 1 (icon)')
  assert.equal(ico.readUInt16LE(4), 3, 'count 는 3')
})

test('encodeIco: 각 항목의 치수·크기·오프셋이 맞는다', () => {
  const entries = ICO_SIZES.map((size) => ({ size, png: renderPng(symbolSvg('compact'), size) }))
  const ico = encodeIco(entries)

  entries.forEach((entry, index) => {
    const at = 6 + index * 16
    assert.equal(ico.readUInt8(at), entry.size, '너비')
    assert.equal(ico.readUInt8(at + 1), entry.size, '높이')
    assert.equal(ico.readUInt16LE(at + 4), 1, 'color planes')
    assert.equal(ico.readUInt16LE(at + 6), 32, 'bits per pixel')

    const length = ico.readUInt32LE(at + 8)
    const offset = ico.readUInt32LE(at + 12)
    assert.equal(length, entry.png.length)
    assert.deepEqual(ico.subarray(offset, offset + length), entry.png)
  })
})

test('encodeIco: 첫 항목 오프셋이 헤더 뒤에 온다', () => {
  const entries = ICO_SIZES.map((size) => ({ size, png: renderPng(symbolSvg('compact'), size) }))
  const ico = encodeIco(entries)
  assert.equal(ico.readUInt32LE(6 + 12), 6 + 16 * 3)
})
