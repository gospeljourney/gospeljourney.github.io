// 콘텐츠 경로 계약 (Issue #9 확정 사항)
// /ko/는 기준 원문이자 현재 유일하게 공개되는 locale이다.
// /en/, /ja/, /zh/는 향후 다국어 콘텐츠용 예약 경로이다.
// 예약 경로 디렉터리는 실제 번역 파일이 추가될 때 만든다. 빈 디렉터리를 .gitkeep 등으로 미리 만들지 않는다.
// nav, sidebar, locales 에는 reviewed 상태의 번역만 노출한다.
// 모든 언어는 동일한 상대 경로와 동일한 콘텐츠 id를 사용한다.
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitepress'

import { loadCourses } from '../../scripts/lib/courses.mjs'
import { buildSidebar } from '../../scripts/lib/sidebar.mjs'

// 사이드바와 과정 목록은 docs/<locale>/courses/ 를 빌드 시점에 스캔해 만든다.
// 생성된 산출물을 커밋하지 않으므로 Markdown 을 추가하면 그대로 반영된다.
const docsDir = fileURLToPath(new URL('..', import.meta.url))
const courses = loadCourses(docsDir, 'ko')

const nav = [{ text: '홈', link: '/ko/' }]
if (courses.length > 0) {
  // 과정이 여럿이 되면 과정 목록 페이지를 만들고 이 링크를 그쪽으로 옮긴다.
  nav.push({ text: '과정', link: courses[0].link })
}

export default defineConfig({
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
    ['meta', { property: 'og:url', content: 'https://gospeljourney.github.io/' }],
    ['meta', { property: 'og:image', content: 'https://gospeljourney.github.io/og-image.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
  ],

  themeConfig: {
    siteTitle: 'Gospel Journey',
    logo: '/brand/symbol-compact.svg',

    nav,

    sidebar: buildSidebar(courses, { locale: 'ko' }),

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/gospeljourney'
      }
    ],

    outline: {
      label: '이 페이지의 내용',
      level: [2, 3]
    },

    docFooter: {
      prev: '이전',
      next: '다음'
    },

    lastUpdated: {
      text: '마지막 수정'
    },

    returnToTopLabel: '맨 위로',
    sidebarMenuLabel: '메뉴',
    darkModeSwitchLabel: '화면 테마',

    footer: {
      message: 'An Open Journey Through the Gospel',
      copyright: 'Copyright © Gospel Journey'
    }
  }
})
