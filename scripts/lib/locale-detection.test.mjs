import assert from 'node:assert/strict'
import { test } from 'node:test'

import { LOCALES } from './locales.mjs'
import { resolvePreferredLocale } from './locale-detection.mjs'

const fallback = 'ko'

test('저장된 선택은 브라우저 언어보다 우선한다', () => {
  assert.equal(
    resolvePreferredLocale({
      preferredLocale: 'en',
      browserLanguages: ['ja-JP'],
      supportedLocales: LOCALES,
      fallback,
    }),
    'en'
  )
})

test('지원하지 않는 저장된 선택은 브라우저 언어를 계속 확인한다', () => {
  assert.equal(
    resolvePreferredLocale({
      preferredLocale: 'zh',
      browserLanguages: ['ja-JP'],
      supportedLocales: LOCALES,
      fallback,
    }),
    'ja'
  )
})

test('지역 코드가 붙은 브라우저 언어는 기본 태그로 대조한다', () => {
  assert.equal(
    resolvePreferredLocale({
      preferredLocale: null,
      browserLanguages: ['en-US'],
      supportedLocales: LOCALES,
      fallback,
    }),
    'en'
  )
})

test('브라우저 언어 목록은 순서상 첫 일치를 사용한다', () => {
  assert.equal(
    resolvePreferredLocale({
      preferredLocale: null,
      browserLanguages: ['fr-FR', 'ja', 'en-US'],
      supportedLocales: LOCALES,
      fallback,
    }),
    'ja'
  )
})

test('일치하는 언어가 없으면 한국어 fallback을 쓴다', () => {
  assert.equal(
    resolvePreferredLocale({
      preferredLocale: null,
      browserLanguages: ['fr-FR'],
      supportedLocales: LOCALES,
      fallback,
    }),
    'ko'
  )
})

test('대소문자 차이를 흡수한다', () => {
  assert.equal(
    resolvePreferredLocale({
      preferredLocale: null,
      browserLanguages: ['EN-us'],
      supportedLocales: LOCALES,
      fallback,
    }),
    'en'
  )
})

test('지원 언어 목록은 locales 모듈의 단일 출처를 사용한다', () => {
  assert.deepEqual(LOCALES, ['ko', 'en', 'ja'])
})
