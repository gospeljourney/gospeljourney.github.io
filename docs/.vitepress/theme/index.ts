import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import './custom.css'
import KoreanHome from './KoreanHome.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('KoreanHome', KoreanHome)
  }
} satisfies Theme
