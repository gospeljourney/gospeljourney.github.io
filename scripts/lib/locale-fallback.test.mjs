import assert from 'node:assert/strict'
import { lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { test } from 'node:test'

import { canonicalLocaleRoute, prepareLocaleFallbackSource, selectLocalePage } from './locale-fallback.mjs'

const source = {
  file: 'ko/courses/lwt-gospel/00-gospel-debtor.md',
  link: '/ko/courses/lwt-gospel/00-gospel-debtor',
  kind: 'lesson',
  translationStatus: 'source',
}

function translation(status) {
  return {
    ...source,
    file: 'en/courses/lwt-gospel/00-gospel-debtor.md',
    link: '/en/courses/lwt-gospel/00-gospel-debtor',
    locale: 'en',
    translationStatus: status,
  }
}

test('reviewed 번역은 해당 언어 콘텐츠와 자기 canonical을 쓴다', () => {
  const page = selectLocalePage(source, translation('reviewed'), 'en')

  assert.equal(page.entry.locale, 'en')
  assert.equal(page.isFallback, false)
  assert.equal(page.canonicalLink, '/en/courses/lwt-gospel/00-gospel-debtor')
})

test('번역 파일이 없으면 한국어 원문으로 폴백하고 한국어 canonical을 쓴다', () => {
  const page = selectLocalePage(source, undefined, 'en')

  assert.equal(page.entry, source)
  assert.equal(page.isFallback, true)
  assert.equal(page.canonicalLink, '/ko/courses/lwt-gospel/00-gospel-debtor')
})

for (const status of ['draft', 'translated', 'outdated']) {
  test(`${status} 번역 파일은 존재해도 폴백을 유지한다`, () => {
    const page = selectLocalePage(source, translation(status), 'en')

    assert.equal(page.entry, source)
    assert.equal(page.isFallback, true)
    assert.equal(page.canonicalLink, '/ko/courses/lwt-gospel/00-gospel-debtor')
  })
}

test('reviewed 번역은 임시 en 경로의 실제 Markdown 파일로 파생한다', () => {
  const root = join(tmpdir(), `gj-locale-fallback-${process.pid}-${Date.now()}`)
  const docsDir = join(root, 'docs')
  const stageDir = join(root, 'stage')
  const sourceFile = join(docsDir, 'ko/courses/c/00-lesson.md')
  const translationFile = join(docsDir, 'en/courses/c/00-lesson.md')

  try {
    mkdirSync(join(docsDir, 'public'), { recursive: true })
    mkdirSync(join(sourceFile, '..'), { recursive: true })
    mkdirSync(join(translationFile, '..'), { recursive: true })
    writeFileSync(join(docsDir, 'index.md'), '---\ntitle: Root\n---\n', 'utf8')
    writeFileSync(sourceFile, '---\ntitle: 원문\ntranslationStatus: source\n---\n한국어 본문\n', 'utf8')
    writeFileSync(translationFile, '---\ntitle: Translation\ntranslationStatus: reviewed\n---\nEnglish body\n', 'utf8')

    prepareLocaleFallbackSource({ docsDir, stageDir })

    const staged = join(stageDir, 'en/courses/c/00-lesson.md')
    assert.equal(lstatSync(staged).isSymbolicLink(), false)
    assert.equal(lstatSync(staged).isFile(), true)
    assert.equal(relative(stageDir, staged), 'en/courses/c/00-lesson.md')
    assert.equal(readFileSync(staged, 'utf8'), readFileSync(translationFile, 'utf8'))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('locale 홈은 파일이 있으면 상태 필드 없이도 자체 파일을 쓰고, 없으면 한국어 홈으로 폴백한다', () => {
  const root = join(tmpdir(), `gj-locale-home-${process.pid}-${Date.now()}`)
  const docsDir = join(root, 'docs')
  const stageDir = join(root, 'stage')
  const koreanHome = '---\nlayout: LocaleHome\n---\nKorean home\n'
  const englishHome = '---\nlayout: home\n---\nEnglish home\n'

  try {
    mkdirSync(join(docsDir, 'public'), { recursive: true })
    mkdirSync(join(docsDir, 'ko/courses/c'), { recursive: true })
    mkdirSync(join(docsDir, 'en'), { recursive: true })
    writeFileSync(join(docsDir, 'index.md'), '---\ntitle: Root\n---\n', 'utf8')
    writeFileSync(join(docsDir, 'ko/index.md'), koreanHome, 'utf8')
    writeFileSync(join(docsDir, 'en/index.md'), englishHome, 'utf8')
    writeFileSync(join(docsDir, 'ko/courses/c/00-lesson.md'), '---\ntranslationStatus: source\n---\n', 'utf8')

    prepareLocaleFallbackSource({ docsDir, stageDir })

    assert.equal(readFileSync(join(stageDir, 'en/index.md'), 'utf8'), englishHome)
    const japaneseHome = readFileSync(join(stageDir, 'ja/index.md'), 'utf8')
    assert.match(japaneseHome, /localeFallback: true/)
    assert.match(japaneseHome, /Korean home/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('locale 홈의 canonical은 자체 홈 또는 한국어 폴백을 가리킨다', () => {
  assert.equal(canonicalLocaleRoute('en/index.md', false), '/en/')
  assert.equal(canonicalLocaleRoute('ja/index.md', true), '/ko/')
})
