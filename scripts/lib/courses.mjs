import matter from 'gray-matter'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const ALL_STATUSES = new Set([
  'source',
  'draft',
  'translated',
  'reviewed',
  'outdated',
])

export const PUBLIC_STATUSES = new Set(['source', 'reviewed'])

/**
 * 저장소의 docs/ 기준 상대 경로를 사이트 링크로 바꾼다.
 * cleanUrls: true 이므로 확장자를 떼고, index.md 는 디렉터리 경로가 된다.
 */
export function toLink(relPath) {
  const noExt = relPath.replace(/\.md$/, '')
  if (noExt === 'index') return '/'
  if (noExt.endsWith('/index')) return '/' + noExt.slice(0, -'index'.length)
  return '/' + noExt
}

/** YAML이 Date로 바꿔 버린 값을 YYYY-MM-DD 문자열로 되돌린다. */
function toDateString(value) {
  if (value == null) return undefined
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value)
}

/**
 * Markdown 원문을 파싱해 평탄한 콘텐츠 객체로 만든다.
 * 파일시스템을 건드리지 않는 순수 함수다.
 */
export function parseContentFile(relPath, raw) {
  const { data } = matter(raw)
  const segments = relPath.split('/')
  const base = segments[segments.length - 1]
  const dir = segments[segments.length - 2]
  const defaultKind = base === 'index.md' ? 'course' : 'lesson'

  return {
    file: relPath,
    link: toLink(relPath),
    dir,
    kind: data.kind ?? defaultKind,
    id: data.id,
    title: data.title,
    description: data.description,
    locale: data.locale,
    sourceLocale: data.sourceLocale,
    translationStatus: data.translationStatus,
    course: data.course,
    lesson: data.lesson,
    sourceRevision: data.sourceRevision,
    updated: toDateString(data.updated),
    notes: data.notes,
    lessonRef: data.lessonRef,
    audio: data.audio,
  }
}

/**
 * docsDir/<locale>/courses/ 아래의 과정을 모두 읽는다.
 * docsDir 는 VitePress 의 docs 디렉터리 절대 경로다.
 */
export function loadCourses(docsDir, locale) {
  const coursesDir = join(docsDir, locale, 'courses')
  if (!existsSync(coursesDir)) return []

  const slugs = readdirSync(coursesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  return slugs.map((slug) => readCourse(coursesDir, locale, slug))
}

function readCourse(coursesDir, locale, slug) {
  const dir = join(coursesDir, slug)
  const fileNames = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort()

  const parsed = fileNames.map((name) => {
    const relPath = `${locale}/courses/${slug}/${name}`
    return parseContentFile(relPath, readFileSync(join(dir, name), 'utf8'))
  })

  const index = parsed.find((entry) => entry.kind === 'course') ?? null
  const byLesson = (a, b) => (a.lesson ?? 0) - (b.lesson ?? 0)

  return {
    slug,
    title: index?.title ?? slug,
    description: index?.description,
    link: `/${locale}/courses/${slug}/`,
    index,
    lessons: parsed.filter((entry) => entry.kind === 'lesson').sort(byLesson),
    notes: parsed.filter((entry) => entry.kind === 'notes').sort(byLesson),
  }
}
