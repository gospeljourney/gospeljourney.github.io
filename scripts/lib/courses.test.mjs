import { test } from 'node:test'
import assert from 'node:assert/strict'

import { toLink, parseContentFile, ALL_STATUSES, PUBLIC_STATUSES } from './courses.mjs'

test('toLink: 강의 파일은 확장자를 떼고 앞에 슬래시를 붙인다', () => {
  assert.equal(
    toLink('ko/courses/lwt-gospel/00-gospel-debtor.md'),
    '/ko/courses/lwt-gospel/00-gospel-debtor'
  )
})

test('toLink: index.md는 디렉터리 경로가 된다', () => {
  assert.equal(toLink('ko/courses/lwt-gospel/index.md'), '/ko/courses/lwt-gospel/')
})

test('PUBLIC_STATUSES는 source와 reviewed만 담는다', () => {
  assert.deepEqual([...PUBLIC_STATUSES].sort(), ['reviewed', 'source'])
})

test('ALL_STATUSES는 헌법이 허용한 다섯 값을 담는다', () => {
  assert.deepEqual(
    [...ALL_STATUSES].sort(),
    ['draft', 'outdated', 'reviewed', 'source', 'translated']
  )
})

test('parseContentFile: frontmatter를 평탄한 객체로 옮긴다', () => {
  const raw = [
    '---',
    'id: lwt-gospel-000',
    'title: 복음의 빚진 자',
    'description: 한 문장 설명',
    'locale: ko',
    'sourceLocale: ko',
    'translationStatus: source',
    'course: lwt-gospel',
    'lesson: 0',
    'sourceRevision: 1',
    'updated: 2026-08-01',
    'kind: lesson',
    '---',
    '',
    '# 복음의 빚진 자',
  ].join('\n')

  const parsed = parseContentFile('ko/courses/lwt-gospel/00-gospel-debtor.md', raw)

  assert.equal(parsed.file, 'ko/courses/lwt-gospel/00-gospel-debtor.md')
  assert.equal(parsed.link, '/ko/courses/lwt-gospel/00-gospel-debtor')
  assert.equal(parsed.dir, 'lwt-gospel')
  assert.equal(parsed.kind, 'lesson')
  assert.equal(parsed.id, 'lwt-gospel-000')
  assert.equal(parsed.title, '복음의 빚진 자')
  assert.equal(parsed.locale, 'ko')
  assert.equal(parsed.course, 'lwt-gospel')
  assert.equal(parsed.lesson, 0)
  assert.equal(parsed.sourceRevision, 1)
  assert.equal(parsed.updated, '2026-08-01')
})

test('parseContentFile: kind가 없으면 lesson으로 본다', () => {
  const raw = '---\nid: x\ntitle: 제목\n---\n'
  assert.equal(parseContentFile('ko/courses/x/01-a.md', raw).kind, 'lesson')
})

test('parseContentFile: index.md의 kind 기본값은 course다', () => {
  const raw = '---\nid: x\ntitle: 제목\n---\n'
  assert.equal(parseContentFile('ko/courses/x/index.md', raw).kind, 'course')
})

test('parseContentFile: updated가 날짜로 파싱돼도 YYYY-MM-DD 문자열로 정규화한다', () => {
  const raw = '---\nid: x\ntitle: 제목\nupdated: 2026-08-01\n---\n'
  const parsed = parseContentFile('ko/courses/x/01-a.md', raw)
  assert.equal(typeof parsed.updated, 'string')
  assert.equal(parsed.updated, '2026-08-01')
})

test('parseContentFile: audio 블록을 그대로 실어 나른다', () => {
  const raw = [
    '---',
    'id: x',
    'title: 제목',
    'audio:',
    '  file: lwt-gospel/00-gospel-debtor.mp3',
    '  duration: 2371',
    '---',
  ].join('\n')
  const parsed = parseContentFile('ko/courses/x/01-a.md', raw)
  assert.deepEqual(parsed.audio, {
    file: 'lwt-gospel/00-gospel-debtor.mp3',
    duration: 2371,
  })
})
