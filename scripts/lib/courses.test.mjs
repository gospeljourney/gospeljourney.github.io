import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  toLink,
  parseContentFile,
  loadCourses,
  ALL_STATUSES,
  PUBLIC_STATUSES,
} from './courses.mjs'

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

/** 임시 docs 트리를 만든다. files 는 { '상대경로': '파일내용' }. */
function makeDocs(files) {
  const root = mkdtempSync(join(tmpdir(), 'gj-docs-'))
  for (const [rel, content] of Object.entries(files)) {
    const full = join(root, rel)
    mkdirSync(join(full, '..'), { recursive: true })
    writeFileSync(full, content, 'utf8')
  }
  return root
}

function fm(fields) {
  const body = Object.entries(fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
  return `---\n${body}\n---\n`
}

test('loadCourses: courses 디렉터리가 없으면 빈 배열', () => {
  const root = makeDocs({ 'ko/index.md': fm({ title: '홈' }) })
  try {
    assert.deepEqual(loadCourses(root, 'ko'), [])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('loadCourses: index.md와 강의 파일을 과정으로 묶는다', () => {
  const root = makeDocs({
    'ko/courses/lwt-gospel/index.md': fm({
      id: 'lwt-gospel',
      title: 'LWT 1.3학기 Gospel',
      description: '과정 소개',
      course: 'lwt-gospel',
      kind: 'course',
    }),
    'ko/courses/lwt-gospel/00-gospel-debtor.md': fm({
      id: 'lwt-gospel-000',
      title: '복음의 빚진 자',
      course: 'lwt-gospel',
      lesson: 0,
      kind: 'lesson',
    }),
  })
  try {
    const courses = loadCourses(root, 'ko')
    assert.equal(courses.length, 1)
    assert.equal(courses[0].slug, 'lwt-gospel')
    assert.equal(courses[0].title, 'LWT 1.3학기 Gospel')
    assert.equal(courses[0].description, '과정 소개')
    assert.equal(courses[0].link, '/ko/courses/lwt-gospel/')
    assert.equal(courses[0].lessons.length, 1)
    assert.equal(courses[0].lessons[0].id, 'lwt-gospel-000')
    assert.equal(courses[0].notes.length, 0)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('loadCourses: 강의를 lesson 오름차순으로 정렬한다', () => {
  const root = makeDocs({
    'ko/courses/c/index.md': fm({ title: '과정', course: 'c', kind: 'course' }),
    'ko/courses/c/02-b.md': fm({ title: 'B', course: 'c', lesson: 2, kind: 'lesson' }),
    'ko/courses/c/00-a.md': fm({ title: 'A', course: 'c', lesson: 0, kind: 'lesson' }),
    'ko/courses/c/01-c.md': fm({ title: 'C', course: 'c', lesson: 1, kind: 'lesson' }),
  })
  try {
    const [course] = loadCourses(root, 'ko')
    assert.deepEqual(course.lessons.map((l) => l.lesson), [0, 1, 2])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('loadCourses: kind가 notes인 파일은 notes로 분리한다', () => {
  const root = makeDocs({
    'ko/courses/c/index.md': fm({ title: '과정', course: 'c', kind: 'course' }),
    'ko/courses/c/00-a.md': fm({ title: 'A', course: 'c', lesson: 0, kind: 'lesson' }),
    'ko/courses/c/00-a-notes.md': fm({ title: 'A 노트', course: 'c', lesson: 0, kind: 'notes' }),
  })
  try {
    const [course] = loadCourses(root, 'ko')
    assert.equal(course.lessons.length, 1)
    assert.equal(course.notes.length, 1)
    assert.equal(course.notes[0].title, 'A 노트')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('loadCourses: index.md가 없어도 과정을 버리지 않고 index를 null로 둔다', () => {
  const root = makeDocs({
    'ko/courses/c/00-a.md': fm({ title: 'A', course: 'c', lesson: 0, kind: 'lesson' }),
  })
  try {
    const [course] = loadCourses(root, 'ko')
    assert.equal(course.index, null)
    assert.equal(course.title, 'c')
    assert.equal(course.lessons.length, 1)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('loadCourses: 과정을 slug 사전순으로 정렬한다', () => {
  const root = makeDocs({
    'ko/courses/zeta/00-a.md': fm({ title: 'A', course: 'zeta', lesson: 0 }),
    'ko/courses/alpha/00-a.md': fm({ title: 'A', course: 'alpha', lesson: 0 }),
  })
  try {
    assert.deepEqual(loadCourses(root, 'ko').map((c) => c.slug), ['alpha', 'zeta'])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('parseContentFile: 본문을 body 로 보존한다', () => {
  const raw = '---\nid: x\ntitle: 제목\n---\n\n# 제목\n\n본문 한 줄\n'
  const parsed = parseContentFile('ko/courses/x/01-a.md', raw)
  assert.match(parsed.body, /본문 한 줄/)
  assert.doesNotMatch(parsed.body, /^id: x/m)
})

test('parseContentFile: AudioCue 를 순서대로 뽑는다', () => {
  const raw = [
    '---',
    'id: x',
    'title: 제목',
    '---',
    '',
    '## 1. 첫 단원',
    '',
    '<AudioCue t="0:00" note="#첫-단원" />',
    '',
    '## 2. 다음 단원',
    '',
    '<AudioCue t="5:57" />',
  ].join('\n')

  const { cues } = parseContentFile('ko/courses/x/01-a.md', raw)

  assert.equal(cues.length, 2)
  assert.deepEqual(cues[0], { raw: '0:00', t: 0, note: '#첫-단원' })
  assert.deepEqual(cues[1], { raw: '5:57', t: 357, note: undefined })
})

test('parseContentFile: 속성 순서가 바뀌어도 읽는다', () => {
  const raw = '---\nid: x\ntitle: 제목\n---\n\n<AudioCue note="#a" t="1:00" />\n'
  const { cues } = parseContentFile('ko/courses/x/01-a.md', raw)
  assert.deepEqual(cues[0], { raw: '1:00', t: 60, note: '#a' })
})

test('parseContentFile: 형식이 틀린 타임코드는 t 가 null 이고 raw 는 남는다', () => {
  const raw = '---\nid: x\ntitle: 제목\n---\n\n<AudioCue t="5:60" />\n'
  const { cues } = parseContentFile('ko/courses/x/01-a.md', raw)
  assert.equal(cues[0].t, null)
  assert.equal(cues[0].raw, '5:60')
})

test('parseContentFile: AudioCue 가 없으면 빈 배열', () => {
  const raw = '---\nid: x\ntitle: 제목\n---\n\n# 제목\n'
  assert.deepEqual(parseContentFile('ko/courses/x/01-a.md', raw).cues, [])
})
