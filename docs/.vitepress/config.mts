// 콘텐츠 경로 계약 (Issue #9 확정 사항)
// /ko/는 기준 원문이자 현재 유일하게 공개되는 locale이다.
// /en/, /ja/, /zh/는 향후 다국어 콘텐츠용 예약 경로이다.
// 예약 경로 디렉터리는 실제 번역 파일이 추가될 때 만든다. 빈 디렉터리를 .gitkeep 등으로 미리 만들지 않는다.
// nav, sidebar, locales 에는 reviewed 상태의 번역만 노출한다.
// 모든 언어는 동일한 상대 경로와 동일한 콘텐츠 id를 사용한다.
import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'ko-KR',
  title: 'The Way',
  titleTemplate: false,
  description: 'An Open Journey Through the Gospel',
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    siteTitle: 'The Way',

    nav: [
      { text: '홈', link: '/ko/' }
    ],

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
      copyright: 'Copyright © The Way'
    }
  }
})
