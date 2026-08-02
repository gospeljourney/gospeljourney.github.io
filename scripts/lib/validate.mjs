import { ALL_STATUSES } from './courses.mjs'

const COMMON_REQUIRED = [
  'id',
  'title',
  'locale',
  'sourceLocale',
  'translationStatus',
  'course',
  'sourceRevision',
  'updated',
]

/** 상대 참조('./00-a-notes')를 같은 디렉터리 기준 링크로 바꾼다. */
function resolveRef(fromLink, ref) {
  const dir = fromLink.slice(0, fromLink.lastIndexOf('/') + 1)
  return dir + ref.replace(/^\.\//, '')
}

/**
 * 과정 모델을 검사해 위반 목록을 돌려준다.
 * 파일시스템을 읽지 않는 순수 함수다.
 */
export function validateCourses(courses, locale = 'ko') {
  const issues = []
  const seenIds = new Map()

  const add = (file, rule, message) => issues.push({ file, rule, message })

  for (const course of courses) {
    if (!course.index) {
      add(
        `${locale}/courses/${course.slug}/`,
        'missing-index',
        '과정 소개 파일(index.md)이 없거나 kind: course 가 아닙니다.'
      )
    }

    const entries = [course.index, ...course.lessons, ...course.notes].filter(Boolean)
    const allLinks = new Set(entries.map((entry) => entry.link))
    const seenLessonKeys = new Set()

    for (const entry of entries) {
      const required =
        entry.kind === 'course' ? COMMON_REQUIRED : [...COMMON_REQUIRED, 'lesson']

      for (const field of required) {
        if (entry[field] === undefined || entry[field] === null || entry[field] === '') {
          add(entry.file, 'required-fields', `필수 필드 '${field}' 가 없습니다.`)
        }
      }

      if (entry.translationStatus !== undefined && !ALL_STATUSES.has(entry.translationStatus)) {
        add(
          entry.file,
          'status-value',
          `translationStatus '${entry.translationStatus}' 는 허용값이 아닙니다. ` +
            `허용: ${[...ALL_STATUSES].join(', ')}`
        )
      }

      if (entry.id !== undefined) {
        const previous = seenIds.get(entry.id)
        if (previous) {
          add(entry.file, 'duplicate-id', `id '${entry.id}' 가 ${previous} 와 중복됩니다.`)
        } else {
          seenIds.set(entry.id, entry.file)
        }
      }

      if (entry.course !== undefined && entry.course !== course.slug) {
        add(
          entry.file,
          'course-mismatch',
          `course '${entry.course}' 가 디렉터리명 '${course.slug}' 와 다릅니다.`
        )
      }

      if (entry.locale !== undefined && entry.locale !== locale) {
        add(
          entry.file,
          'locale-mismatch',
          `locale '${entry.locale}' 가 경로의 '${locale}' 와 다릅니다.`
        )
      }

      if (entry.kind !== 'course' && entry.lesson !== undefined) {
        const key = `${entry.kind}:${entry.lesson}`
        if (seenLessonKeys.has(key)) {
          add(
            entry.file,
            'duplicate-lesson',
            `과정 '${course.slug}' 안에서 ${entry.kind} lesson ${entry.lesson} 이 중복됩니다.`
          )
        } else {
          seenLessonKeys.add(key)
        }
      }

      for (const field of ['notes', 'lessonRef']) {
        const ref = entry[field]
        if (!ref) continue
        const target = resolveRef(entry.link, ref)
        if (!allLinks.has(target)) {
          add(entry.file, 'broken-ref', `${field} 가 가리키는 '${target}' 문서가 없습니다.`)
        }
      }

      if (entry.audio) {
        const { file, duration } = entry.audio
        if (!file || typeof duration !== 'number' || !Number.isInteger(duration) || duration <= 0) {
          add(
            entry.file,
            'audio-shape',
            'audio 는 file 과 양의 정수 duration 을 함께 가져야 합니다.'
          )
        }
      }
    }
  }

  return issues
}
