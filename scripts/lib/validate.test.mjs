import { test } from 'node:test'
import assert from 'node:assert/strict'

import { validateCourses } from './validate.mjs'

function entry(overrides = {}) {
  return {
    file: 'ko/courses/c/00-a.md',
    link: '/ko/courses/c/00-a',
    dir: 'c',
    kind: 'lesson',
    id: 'c-000',
    title: '강의',
    locale: 'ko',
    sourceLocale: 'ko',
    translationStatus: 'source',
    course: 'c',
    lesson: 0,
    sourceRevision: 1,
    updated: '2026-08-01',
    ...overrides,
  }
}

function indexEntry(overrides = {}) {
  return entry({
    file: 'ko/courses/c/index.md',
    link: '/ko/courses/c/',
    kind: 'course',
    id: 'c',
    lesson: undefined,
    ...overrides,
  })
}

function course(overrides = {}) {
  const index = overrides.index === undefined ? indexEntry() : overrides.index
  return {
    slug: 'c',
    title: '과정',
    link: '/ko/courses/c/',
    index,
    lessons: [],
    notes: [],
    ...overrides,
    index,
  }
}

const rules = (issues) => issues.map((i) => i.rule).sort()

test('validateCourses: 온전한 과정은 문제를 만들지 않는다', () => {
  assert.deepEqual(validateCourses([course({ lessons: [entry()] })]), [])
})

test('required-fields: 강의에 id가 없으면 오류', () => {
  const issues = validateCourses([course({ lessons: [entry({ id: undefined })] })])
  assert.ok(rules(issues).includes('required-fields'))
  assert.match(issues[0].message, /id/)
})

test('required-fields: 강의에 lesson이 없으면 오류', () => {
  const issues = validateCourses([course({ lessons: [entry({ lesson: undefined })] })])
  assert.ok(rules(issues).includes('required-fields'))
})

test('required-fields: 과정 소개에는 lesson을 요구하지 않는다', () => {
  assert.deepEqual(validateCourses([course()]), [])
})

test('status-value: 허용되지 않은 상태는 오류', () => {
  const issues = validateCourses([
    course({ lessons: [entry({ translationStatus: 'published' })] }),
  ])
  assert.deepEqual(rules(issues), ['status-value'])
})

test('duplicate-id: 같은 id가 두 번 나오면 오류', () => {
  const issues = validateCourses([
    course({
      lessons: [
        entry({ file: 'ko/courses/c/00-a.md', lesson: 0 }),
        entry({ file: 'ko/courses/c/01-b.md', lesson: 1 }),
      ],
    }),
  ])
  assert.deepEqual(rules(issues), ['duplicate-id'])
})

test('course-mismatch: course 값이 디렉터리명과 다르면 오류', () => {
  const issues = validateCourses([
    course({ lessons: [entry({ course: 'other' })] }),
  ])
  assert.deepEqual(rules(issues), ['course-mismatch'])
})

test('duplicate-lesson: 같은 kind에서 lesson 번호가 겹치면 오류', () => {
  const issues = validateCourses([
    course({
      lessons: [
        entry({ id: 'c-000', file: 'ko/courses/c/00-a.md', lesson: 0 }),
        entry({ id: 'c-001', file: 'ko/courses/c/00-b.md', lesson: 0 }),
      ],
    }),
  ])
  assert.deepEqual(rules(issues), ['duplicate-lesson'])
})

test('duplicate-lesson: 강의와 노트가 같은 번호를 쓰는 것은 정상', () => {
  const issues = validateCourses([
    course({
      lessons: [entry()],
      notes: [entry({ id: 'c-000-notes', file: 'ko/courses/c/00-a-notes.md', kind: 'notes' })],
    }),
  ])
  assert.deepEqual(issues, [])
})

test('missing-index: 과정 소개 파일이 없으면 오류', () => {
  const issues = validateCourses([course({ index: null, lessons: [entry()] })])
  assert.deepEqual(rules(issues), ['missing-index'])
})

test('broken-ref: notes가 존재하지 않는 파일을 가리키면 오류', () => {
  const issues = validateCourses([
    course({ lessons: [entry({ notes: './00-a-notes' })] }),
  ])
  assert.deepEqual(rules(issues), ['broken-ref'])
})

test('broken-ref: notes 대상이 실제로 있으면 통과', () => {
  const issues = validateCourses([
    course({
      lessons: [entry({ notes: './00-a-notes' })],
      notes: [
        entry({
          id: 'c-000-notes',
          file: 'ko/courses/c/00-a-notes.md',
          link: '/ko/courses/c/00-a-notes',
          kind: 'notes',
          lessonRef: './00-a',
        }),
      ],
    }),
  ])
  assert.deepEqual(issues, [])
})

test('locale-mismatch: frontmatter locale이 경로와 다르면 오류', () => {
  const issues = validateCourses([course({ lessons: [entry({ locale: 'en' })] })])
  assert.deepEqual(rules(issues), ['locale-mismatch'])
})

test('audio-shape: file만 있고 duration이 없으면 오류', () => {
  const issues = validateCourses([
    course({ lessons: [entry({ audio: { file: 'a.mp3' } })] }),
  ])
  assert.deepEqual(rules(issues), ['audio-shape'])
})

test('audio-shape: duration이 0 이하면 오류', () => {
  const issues = validateCourses([
    course({ lessons: [entry({ audio: { file: 'a.mp3', duration: 0 } })] }),
  ])
  assert.deepEqual(rules(issues), ['audio-shape'])
})

test('audio-shape: 올바른 audio 블록은 통과', () => {
  const issues = validateCourses([
    course({ lessons: [entry({ audio: { file: 'a.mp3', duration: 2371 } })] }),
  ])
  assert.deepEqual(issues, [])
})
