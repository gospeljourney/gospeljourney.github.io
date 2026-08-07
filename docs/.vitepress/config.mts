// 콘텐츠 경로 계약 (ADR-002, ADR-006, ADR-012)
// 지원 locale 목록은 scripts/lib/locales.mjs에서 한 번만 정한다: ko, en, ja.
// 한국어 원문이 있는 상대 경로는 지원 언어의 URL 계약을 정하며, 번역이 없을 때의
// 한국어 폴백과 안내는 후속 #45가 빌드 시점에 만든다. 빈 locale 디렉터리는 만들지 않는다.
// reviewed 번역만 해당 언어의 콘텐츠로 인정하며, 모든 언어는 같은 상대 경로와 콘텐츠 id를 쓴다.
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

import { defineConfig } from 'vitepress'

import { loadCourses } from '../../scripts/lib/courses.mjs'
import {
  canonicalLocaleRoute,
  localizeCourses,
  prepareLocaleFallbackSource,
  removeLocaleFallbackSource,
} from '../../scripts/lib/locale-fallback.mjs'
import { LOCALES } from '../../scripts/lib/locales.mjs'
import { buildSidebar } from '../../scripts/lib/sidebar.mjs'

// 사이드바와 과정 목록은 docs/<locale>/courses/ 를 빌드 시점에 스캔해 만든다.
// 생성된 산출물을 커밋하지 않으므로 Markdown 을 추가하면 그대로 반영된다.
const docsDir = fileURLToPath(new URL('..', import.meta.url))
const fallbackSourceDir = join(docsDir, '.vitepress', 'locale-fallback')
prepareLocaleFallbackSource({ docsDir, stageDir: fallbackSourceDir })
const localeText = {
  ko: {
    label: '한국어',
    lang: 'ko-KR',
    home: '홈',
    courses: '과정',
    notesLabel: '강의 노트',
    outline: '이 페이지의 내용',
    prev: '이전',
    next: '다음',
    lastUpdated: '마지막 수정',
    returnToTop: '맨 위로',
    sidebarMenu: '메뉴',
    darkMode: '화면 테마',
    translationNotice: '',
    translationNoticeLabel: '',
    audioCue: { notesLink: '강의 노트에서 자세히', lessonLink: '교안으로', playLabel: '▶ 이 부분 듣기' },
    lessonAudio: { unavailable: '오디오를 재생할 수 없습니다.', download: '파일 내려받기', unconfigured: '오디오 주소가 아직 설정되지 않았습니다.' },
  },
  en: {
    label: 'English',
    lang: 'en-US',
    home: 'Home',
    courses: 'Courses',
    notesLabel: 'Lecture notes',
    outline: 'On this page',
    prev: 'Previous',
    next: 'Next',
    lastUpdated: 'Last updated',
    returnToTop: 'Return to top',
    sidebarMenu: 'Menu',
    darkMode: 'Appearance',
    // Temporary wording: revised per Issue #48 review; owner confirmation still pending (see report for alternate candidates).
    translationNotice: "This page isn't available in English. You can read the Korean text shown below.",
    translationNoticeLabel: 'Translation notice',
    audioCue: { notesLink: 'More in lecture notes', lessonLink: 'Go to lesson', playLabel: '▶ Listen to this part' },
    lessonAudio: { unavailable: 'Audio could not be played.', download: 'Download file', unconfigured: 'Audio URL is not configured yet.' },
  },
  ja: {
    label: '日本語',
    lang: 'ja-JP',
    home: 'ホーム',
    courses: '講座',
    // 임시값: 영어 잔존 오류(#44)를 Issue #48에서 수정했다. 용어 선택은 소유자 확인 전이다.
    notesLabel: '講義ノート',
    outline: 'このページの内容',
    prev: '前へ',
    next: '次へ',
    lastUpdated: '最終更新',
    returnToTop: 'トップに戻る',
    sidebarMenu: 'メニュー',
    darkMode: '外観',
    // 임시값: Issue #48 검토로 문구와 敬語 등급을 개정했으나 소유자 확인 전이다 (보고서에 대안 후보 있음).
    translationNotice: 'このページの日本語訳はありません。下に表示している韓国語の本文を読むことができます。',
    translationNoticeLabel: '翻訳のお知らせ',
    audioCue: { notesLink: '講義ノートで詳しく見る', lessonLink: '講義へ', playLabel: '▶ この部分を聴く' },
    lessonAudio: { unavailable: '音声を再生できません。', download: 'ファイルをダウンロード', unconfigured: '音声のURLはまだ設定されていません。' },
  },
}

function themeConfigFor(locale: (typeof LOCALES)[number]) {
  const text = localeText[locale]
  const courses = localizeCourses(
    loadCourses(docsDir, 'ko'),
    loadCourses(docsDir, locale),
    locale
  )
  const nav = [{ text: text.home, link: `/${locale}/` }]
  if (courses.length > 0) {
    // 과정이 여럿이 되면 과정 목록 페이지를 만들고 이 링크를 그쪽으로 옮긴다.
    nav.push({ text: text.courses, link: courses[0].link })
  }

  return {
    nav,
    sidebar: buildSidebar(courses, { locale, notesLabel: text.notesLabel }),
    outline: { label: text.outline, level: [2, 3] },
    docFooter: { prev: text.prev, next: text.next },
    lastUpdated: { text: text.lastUpdated },
    returnToTopLabel: text.returnToTop,
    sidebarMenuLabel: text.sidebarMenu,
    darkModeSwitchLabel: text.darkMode,
    translationNotice: text.translationNotice,
    translationNoticeLabel: text.translationNoticeLabel,
    audioCue: text.audioCue,
    lessonAudio: text.lessonAudio,
  }
}

export default defineConfig({
  srcDir: '.vitepress/locale-fallback',
  lang: 'ko-KR',
  title: 'Gospel Journey',
  titleTemplate: false,
  description: 'An Open Journey Through the Gospel',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Gospel Journey' }],
    ['meta', { property: 'og:title', content: 'Gospel Journey' }],
    ['meta', { property: 'og:description', content: 'An Open Journey Through the Gospel' }],
    ['meta', { property: 'og:image', content: 'https://gospeljourney.github.io/og-image.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
  ],

  themeConfig: {
    siteTitle: 'Gospel Journey',
    logo: '/brand/symbol-compact.svg',

    footer: {
      message: 'An Open Journey Through the Gospel',
      copyright: 'Copyright © Gospel Journey'
    }
  },

  locales: Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      {
        label: localeText[locale].label,
        lang: localeText[locale].lang,
        link: `/${locale}/`,
        themeConfig: themeConfigFor(locale),
      },
    ])
  ),

  transformHead({ pageData }) {
    const match = pageData.relativePath.match(/^(ko|en|ja)\/(.+)\.md$/)
    if (!match) {
      // VitePress의 루트 진입점과 기본 404 페이지만 locale 밖의 정상 Markdown이다.
      if (pageData.relativePath === 'index.md' || pageData.relativePath === '404.md') {
        return [['meta', { property: 'og:url', content: 'https://gospeljourney.github.io/' }]]
      }
      throw new Error(
        `Expected a locale Markdown path while rendering head, received: ${pageData.relativePath}`
      )
    }

    const [, locale, path] = match
    const canonicalRoute = canonicalLocaleRoute(
      pageData.relativePath,
      Boolean(pageData.frontmatter.localeFallback)
    )
    const absolute = (value: string) => `https://gospeljourney.github.io${value}`
    const alternate = (targetLocale: string) =>
      `/${targetLocale}/${path === 'index' ? '' : path}`

    return [
      ['link', { rel: 'canonical', href: absolute(canonicalRoute) }],
      ...LOCALES.map((targetLocale) => [
        'link',
        { rel: 'alternate', hreflang: targetLocale, href: absolute(alternate(targetLocale)) },
      ]),
      ['link', { rel: 'alternate', hreflang: 'x-default', href: absolute(alternate('ko')) }],
      // og:url도 canonical과 맞춰 폴백 한국어 본문을 별도 사회 공유 URL로 만들지 않는다.
      ['meta', { property: 'og:url', content: absolute(canonicalRoute) }],
    ]
  },

  buildEnd() {
    removeLocaleFallbackSource(fallbackSourceDir)
  },
})
