import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import './custom.css'
import LocaleHome from './LocaleHome.vue'
import AudioCue from './AudioCue.vue'
import LessonAudio from './LessonAudio.vue'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'doc-after': () => h(LessonAudio)
    }),
  enhanceApp({ app }) {
    app.component('LocaleHome', LocaleHome)
    app.component('AudioCue', AudioCue)
  }
} satisfies Theme
