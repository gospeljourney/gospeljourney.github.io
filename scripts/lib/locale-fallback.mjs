import matter from 'gray-matter'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

import { LOCALES } from './locales.mjs'
import { parseContentFile } from './courses.mjs'

const REVIEWED_TRANSLATION = 'reviewed'

function localizedLink(link, locale) {
  return link.replace(/^\/ko(?=\/|$)/, `/${locale}`)
}

/** locale Markdown의 canonical URL은 자체 페이지 또는 한국어 폴백으로 한정한다. */
export function canonicalLocaleRoute(relativePath, isFallback) {
  const match = relativePath.match(/^(ko|en|ja)\/(.+)\.md$/)
  if (!match) throw new Error(`Expected a locale Markdown path, received: ${relativePath}`)

  const [, locale, path] = match
  const route = `/${locale}/${path === 'index' ? '' : path}`
  return isFallback ? `/ko/${path === 'index' ? '' : path}` : route
}

/**
 * ADR-012는 원문(source)과 번역(reviewed)을 같은 공개 상태로 보지 않는다.
 * PUBLIC_STATUSES에는 한국어 원문용 source가 포함되므로, 대상 언어의 폴백 판정에는
 * 재사용하지 않는다. 대상 번역은 reviewed일 때만 자체 콘텐츠가 된다.
 */
export function selectLocalePage(source, translation, locale) {
  const hasReviewedTranslation = translation?.translationStatus === REVIEWED_TRANSLATION
  const localized = localizedLink(source.link, locale)

  return {
    entry: hasReviewedTranslation ? translation : source,
    isFallback: !hasReviewedTranslation,
    link: localized,
    // 실제 번역은 자신을, 한국어 폴백은 한국어 원문을 정규 URL로 선언한다.
    canonicalLink: hasReviewedTranslation ? localized : source.link,
  }
}

function byKoreanFile(courses) {
  const entries = new Map()
  for (const course of courses) {
    for (const entry of [course.index, ...course.lessons, ...course.notes]) {
      if (!entry) continue
      entries.set(entry.file.replace(/^[^/]+\//, 'ko/'), entry)
    }
  }
  return entries
}

function localizeEntry(source, translations, locale) {
  const translation = translations.get(source.file)
  const page = selectLocalePage(source, translation, locale)
  return { ...page.entry, link: page.link }
}

/**
 * 폴백 URL의 탐색 모델을 만든다. 제목도 표시 중인 한국어 원문을 쓴다. 이는 독자가
 * 클릭한 페이지와 사이드바의 제목을 일치시키며, reviewed 번역은 그 제목으로 바꾼다.
 */
export function localizeCourses(sourceCourses, translatedCourses, locale) {
  if (locale === 'ko') return sourceCourses
  const translations = byKoreanFile(translatedCourses)

  return sourceCourses.map((course) => {
    const index = course.index && localizeEntry(course.index, translations, locale)
    const lessons = course.lessons.map((entry) => localizeEntry(entry, translations, locale))
    const notes = course.notes.map((entry) => localizeEntry(entry, translations, locale))
    return {
      ...course,
      title: index?.title ?? course.title,
      description: index?.description ?? course.description,
      link: localizedLink(course.link, locale),
      index,
      lessons,
      notes,
    }
  })
}

function markdownFiles(root) {
  const files = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, entry.name)
    if (entry.isDirectory()) files.push(...markdownFiles(full))
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(full)
  }
  return files
}

function fallbackMarkdown(raw) {
  const parsed = matter(raw)
  return matter.stringify(parsed.content, { ...parsed.data, localeFallback: true })
}

function createSymlink(target, destination, type) {
  mkdirSync(dirname(destination), { recursive: true })
  symlinkSync(target, destination, type)
}

function writeMarkdownTree(sourceDir, destinationDir) {
  for (const sourceFile of markdownFiles(sourceDir)) {
    const destination = join(destinationDir, relative(sourceDir, sourceFile))
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, readFileSync(sourceFile, 'utf8'), 'utf8')
  }
}

/**
 * VitePress가 정적으로 발견할 수 있는 임시 입력 트리를 만든다. VitePress가 symlink의
 * 실제 경로를 pageData에 기록하므로, 원문도 이 임시 트리에 매 빌드 다시 쓴다. 폴백
 * Markdown도 함께 매 빌드 파생하므로 docs/en 또는 docs/ja에 한국어 복사본을 남기지 않고
 * 원문 개정이 조용히 낡지 않는다.
 */
export function prepareLocaleFallbackSource({ docsDir, stageDir }) {
  const koreanDir = join(docsDir, 'ko')
  rmSync(stageDir, { recursive: true, force: true })
  mkdirSync(stageDir, { recursive: true })
  writeFileSync(join(stageDir, 'index.md'), readFileSync(join(docsDir, 'index.md'), 'utf8'), 'utf8')
  writeMarkdownTree(koreanDir, join(stageDir, 'ko'))
  // public assets do not supply VitePress pageData, so this symlink cannot alter relativePath.
  createSymlink(join(docsDir, 'public'), join(stageDir, 'public'), 'dir')

  for (const sourceFile of markdownFiles(koreanDir)) {
    const sourceRelative = relative(koreanDir, sourceFile)
    const sourceRaw = readFileSync(sourceFile, 'utf8')
    const source = parseContentFile(`ko/${sourceRelative}`, sourceRaw)

    for (const locale of LOCALES) {
      if (locale === 'ko') continue
      const translationFile = join(docsDir, locale, sourceRelative)
      const destination = join(stageDir, locale, sourceRelative)

      // Locale 홈은 과정 콘텐츠의 번역 계약 밖이다. ko 홈도 id·sourceRevision·
      // translationStatus가 없고, hero/features 랜딩 페이지에는 추적할 revision이 없다.
      // validate.mjs도 courses/만 검사하므로, 홈에 반쪽 계약을 강제하지 않는다.
      if (sourceRelative === 'index.md' && existsSync(translationFile)) {
        mkdirSync(dirname(destination), { recursive: true })
        writeFileSync(destination, readFileSync(translationFile, 'utf8'), 'utf8')
        continue
      }

      const translation = existsSync(translationFile)
        ? parseContentFile(`${locale}/${sourceRelative}`, readFileSync(translationFile, 'utf8'))
        : undefined
      const page = selectLocalePage(source, translation, locale)

      if (page.isFallback) {
        mkdirSync(dirname(destination), { recursive: true })
        writeFileSync(destination, fallbackMarkdown(sourceRaw), 'utf8')
      } else {
        // Markdown symlink은 VitePress가 실제 대상 경로를 pageData에 기록한다. reviewed
        // 번역도 임시 locale 경로에 실제 파일로 파생해 canonical/hreflang 경로 계약을 지킨다.
        mkdirSync(dirname(destination), { recursive: true })
        writeFileSync(destination, readFileSync(translationFile, 'utf8'), 'utf8')
      }
    }
  }
}

/** 빌드 완료 후 임시 입력 트리를 제거해 working tree에 파생 파일을 남기지 않는다. */
export function removeLocaleFallbackSource(stageDir) {
  rmSync(stageDir, { recursive: true, force: true })
}
