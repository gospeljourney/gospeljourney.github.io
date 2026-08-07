<script setup lang="ts">
import { onMounted } from 'vue'

import { resolvePreferredLocale } from '../../../scripts/lib/locale-detection.mjs'
import { LOCALES } from '../../../scripts/lib/locales.mjs'

onMounted(() => {
  try {
    const preferredLocale = window.localStorage.getItem('preferred-locale')
    const browserLanguages = window.navigator.languages?.length
      ? window.navigator.languages
      : [window.navigator.language]
    const locale = resolvePreferredLocale({
      preferredLocale,
      browserLanguages,
      supportedLocales: LOCALES,
      fallback: 'ko',
    })

    window.location.replace(`/${locale}/`)
  } catch {
    window.location.replace('/ko/')
  }
})
</script>

<template />
