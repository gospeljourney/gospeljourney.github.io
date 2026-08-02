import { test } from 'node:test'
import assert from 'node:assert/strict'

import { parseTimecode } from './timecode.mjs'

test('parseTimecode: 분:초를 초로 바꾼다', () => {
  assert.equal(parseTimecode('0:00'), 0)
  assert.equal(parseTimecode('5:57'), 357)
  assert.equal(parseTimecode('39:31'), 2371)
})

test('parseTimecode: 시:분:초도 받는다', () => {
  assert.equal(parseTimecode('1:02:03'), 3723)
})

test('parseTimecode: 정수는 그대로 초로 본다', () => {
  assert.equal(parseTimecode(357), 357)
  assert.equal(parseTimecode('357'), 357)
})

test('parseTimecode: 초가 60 이상이면 null', () => {
  assert.equal(parseTimecode('5:60'), null)
})

test('parseTimecode: 음수와 형식 오류는 null', () => {
  assert.equal(parseTimecode('-1'), null)
  assert.equal(parseTimecode('abc'), null)
  assert.equal(parseTimecode(''), null)
  assert.equal(parseTimecode(null), null)
  assert.equal(parseTimecode('1:2:3:4'), null)
})
