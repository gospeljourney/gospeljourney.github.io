import { test } from 'node:test'
import assert from 'node:assert/strict'

import { buildSidebar } from './sidebar.mjs'

/** 테스트용 최소 Course 를 만든다. */
function course({ slug = 'c', title = '과정', lessons = [], notes = [] } = {}) {
  return {
    slug,
    title,
    link: `/ko/courses/${slug}/`,
    index: null,
    description: undefined,
    lessons,
    notes,
  }
}

function lesson({ n = 0, title = '강의', status = 'source', slug = 'c' } = {}) {
  return {
    kind: 'lesson',
    lesson: n,
    title,
    translationStatus: status,
    link: `/ko/courses/${slug}/0${n}-l`,
  }
}

function note({ n = 0, status = 'source', slug = 'c' } = {}) {
  return {
    kind: 'notes',
    lesson: n,
    title: '노트',
    translationStatus: status,
    link: `/ko/courses/${slug}/0${n}-l-notes`,
  }
}

test('buildSidebar: 과정이 없으면 빈 객체', () => {
  assert.deepEqual(buildSidebar([]), {})
})

test('buildSidebar: /ko/courses/ 키 아래에 과정 그룹을 만든다', () => {
  const result = buildSidebar([
    course({ title: 'LWT 1.3학기 Gospel', lessons: [lesson({ title: '복음의 빚진 자' })] }),
  ])

  assert.deepEqual(result, {
    '/ko/courses/': [
      {
        text: 'LWT 1.3학기 Gospel',
        link: '/ko/courses/c/',
        collapsed: false,
        items: [{ text: '복음의 빚진 자', link: '/ko/courses/c/00-l' }],
      },
    ],
  })
})

test('buildSidebar: source와 reviewed만 노출한다', () => {
  const result = buildSidebar([
    course({
      lessons: [
        lesson({ n: 0, title: '공개', status: 'source' }),
        lesson({ n: 1, title: '검토됨', status: 'reviewed' }),
        lesson({ n: 2, title: '초안', status: 'draft' }),
        lesson({ n: 3, title: '번역됨', status: 'translated' }),
        lesson({ n: 4, title: '오래됨', status: 'outdated' }),
      ],
    }),
  ])

  assert.deepEqual(
    result['/ko/courses/'][0].items.map((i) => i.text),
    ['공개', '검토됨']
  )
})

test('buildSidebar: 같은 lesson 번호의 노트를 강의 하위에 중첩한다', () => {
  const result = buildSidebar([
    course({ lessons: [lesson({ n: 0 })], notes: [note({ n: 0 })] }),
  ], { notesLabel: '강의 노트' })

  assert.deepEqual(result['/ko/courses/'][0].items[0].items, [
    { text: '강의 노트', link: '/ko/courses/c/00-l-notes' },
  ])
})

test('buildSidebar: 비공개 상태의 노트는 중첩하지 않는다', () => {
  const result = buildSidebar([
    course({ lessons: [lesson({ n: 0 })], notes: [note({ n: 0, status: 'draft' })] }),
  ])

  assert.equal(result['/ko/courses/'][0].items[0].items, undefined)
})

test('buildSidebar: 노출할 강의가 없는 과정은 그룹을 만들지 않는다', () => {
  const result = buildSidebar([
    course({ lessons: [lesson({ status: 'draft' })] }),
  ])

  assert.deepEqual(result, {})
})

test('buildSidebar: notesLabel 을 바꿀 수 있다', () => {
  const result = buildSidebar(
    [course({ lessons: [lesson({ n: 0 })], notes: [note({ n: 0 })] })],
    { notesLabel: '녹취 정리' }
  )

  assert.equal(result['/ko/courses/'][0].items[0].items[0].text, '녹취 정리')
})
