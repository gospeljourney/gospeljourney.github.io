import { test } from 'node:test'
import assert from 'node:assert/strict'

import { resolveAudioSources } from './media-resolve.mjs'

const base = {
  default: 'https://cdn.example.com/audio/',
  mirrors: { cn: 'https://mirror.example.cn/audio/' },
}

test('resolveAudioSources: 기본 베이스로 URL 을 만든다', () => {
  assert.deepEqual(
    resolveAudioSources('lwt-gospel/00.mp3', undefined, base),
    ['https://cdn.example.com/audio/lwt-gospel/00.mp3']
  )
})

test('resolveAudioSources: 지역 미러를 앞에 둔다', () => {
  assert.deepEqual(resolveAudioSources('a.mp3', 'cn', base), [
    'https://mirror.example.cn/audio/a.mp3',
    'https://cdn.example.com/audio/a.mp3',
  ])
})

test('resolveAudioSources: 없는 지역은 기본만 쓴다', () => {
  assert.deepEqual(resolveAudioSources('a.mp3', 'jp', base), [
    'https://cdn.example.com/audio/a.mp3',
  ])
})

test('resolveAudioSources: 슬래시로 시작하면 사이트 자체 경로로 그대로 쓴다', () => {
  assert.deepEqual(resolveAudioSources('/audio/local.mp3', 'cn', base), [
    '/audio/local.mp3',
  ])
})

test('resolveAudioSources: 베이스가 비어 있으면 빈 배열', () => {
  assert.deepEqual(
    resolveAudioSources('a.mp3', undefined, { default: '', mirrors: {} }),
    []
  )
})

test('resolveAudioSources: 베이스 끝 슬래시 유무를 흡수한다', () => {
  assert.deepEqual(
    resolveAudioSources('a.mp3', undefined, { default: 'https://x.test', mirrors: {} }),
    ['https://x.test/a.mp3']
  )
})

test('resolveAudioSources: https 절대 URL을 그대로 돌려준다', () => {
  assert.deepEqual(
    resolveAudioSources('https://r2.example.com/lwt-gospel/00.mp3', undefined, base),
    ['https://r2.example.com/lwt-gospel/00.mp3']
  )
})

test('resolveAudioSources: http 절대 URL을 그대로 돌려준다', () => {
  assert.deepEqual(
    resolveAudioSources('http://media.example.com/lwt-gospel/00.mp3', undefined, base),
    ['http://media.example.com/lwt-gospel/00.mp3']
  )
})

test('resolveAudioSources: 절대 URL에는 지역 미러를 적용하지 않는다', () => {
  assert.deepEqual(
    resolveAudioSources('https://r2.example.com/lwt-gospel/00.mp3', 'cn', base),
    ['https://r2.example.com/lwt-gospel/00.mp3']
  )
})
