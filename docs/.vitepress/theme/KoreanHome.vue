<script setup lang="ts">
import { Content, useData } from 'vitepress'
import {
  VPHomeContent,
  VPHomeFeatures,
  VPHomeHero
} from 'vitepress/theme'

const { frontmatter, theme } = useData()
</script>

<template>
  <main
    class="VPHome"
    :class="{
      'external-link-icon-enabled': theme.externalLinkIcon
    }"
  >
    <VPHomeHero />
    <VPHomeFeatures />
    <VPHomeContent v-if="frontmatter.markdownStyles !== false">
      <Content />
    </VPHomeContent>
    <Content v-else />
  </main>
</template>
