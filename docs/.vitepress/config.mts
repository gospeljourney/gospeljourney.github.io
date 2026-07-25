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
