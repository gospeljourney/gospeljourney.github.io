import { PUBLIC_STATUSES } from './courses.mjs'

const isPublic = (entry) => PUBLIC_STATUSES.has(entry.translationStatus)

/**
 * 과정 모델을 VitePress sidebar 객체로 바꾼다.
 * 공개 탐색에는 source 와 reviewed 만 노출한다 (ADR-006).
 */
export function buildSidebar(courses, options = {}) {
  const { locale = 'ko', notesLabel = '강의 노트' } = options

  const groups = courses
    .map((course) => ({
      text: course.title,
      link: course.link,
      collapsed: false,
      items: course.lessons.filter(isPublic).map((lesson) => {
        const item = { text: lesson.title, link: lesson.link }
        const note = course.notes.find(
          (candidate) => candidate.lesson === lesson.lesson && isPublic(candidate)
        )
        if (note) item.items = [{ text: notesLabel, link: note.link }]
        return item
      }),
    }))
    .filter((group) => group.items.length > 0)

  if (groups.length === 0) return {}
  return { [`/${locale}/courses/`]: groups }
}
