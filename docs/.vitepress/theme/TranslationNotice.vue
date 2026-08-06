<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter, theme } = useData()
const message = computed(() => frontmatter.value.localeFallback && theme.value.translationNotice)
const label = computed(() => theme.value.translationNoticeLabel)
</script>

<template>
  <aside v-if="message" class="translation-notice" :aria-label="label">
    {{ message }}
  </aside>
</template>

<style scoped>
.translation-notice {
  margin: 1.5rem auto;
  max-width: 768px;
  padding: 0.875rem 1rem;
  color: var(--vp-c-text-1);
  background: var(--vp-c-brand-soft);
  border-inline-start: 4px solid var(--vp-c-brand-1);
  border-radius: 0.25rem;
  font-weight: 600;
}

.VPDoc .translation-notice {
  margin: 0 0 1.5rem;
}
</style>
