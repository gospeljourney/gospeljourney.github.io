import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import './custom.css'
import LocaleHome from './LocaleHome.vue'
import AudioCue from './AudioCue.vue'
import LessonAudio from './LessonAudio.vue'
import LocaleSwitcher from './LocaleSwitcher.vue'
import RootLocaleRedirect from './RootLocaleRedirect.vue'
import TranslationNotice from './TranslationNotice.vue'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'doc-before': () => h(TranslationNotice),
      'doc-after': () => h(LessonAudio),
      'page-top': () => h(TranslationNotice),
      'nav-bar-content-after': () => h(LocaleSwitcher),
      'nav-screen-content-after': () => h(LocaleSwitcher, { mobile: true }),
    }),
  enhanceApp({ app }) {
    app.component('LocaleHome', LocaleHome)
    app.component('LocaleSwitcher', LocaleSwitcher)
    app.component('RootLocaleRedirect', RootLocaleRedirect)
    app.component('AudioCue', AudioCue)
    app.component('TranslationNotice', TranslationNotice)
  }
} satisfies Theme
