<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

import { parseTimecode } from '../../../scripts/lib/timecode.mjs'
import { requestSeek } from './audioStore'

const props = defineProps<{ t: string | number; note?: string }>()
const { frontmatter } = useData()

const seconds = computed(() => parseTimecode(props.t))

const label = computed(() => {
  const total = seconds.value
  if (total === null) return String(props.t)
  const minutes = Math.floor(total / 60)
  const rest = String(total % 60).padStart(2, '0')
  return `${minutes}:${rest}`
})

// note 가 가리킬 페이지는 본문이 아니라 frontmatter 가 정한다.
// 강의에서는 notes 로, 노트에서는 lessonRef 로 간다.
const counterpart = computed(() => frontmatter.value.notes ?? frontmatter.value.lessonRef)
const counterpartLabel = computed(() =>
  frontmatter.value.notes ? '강의 노트에서 자세히' : '교안으로'
)
const counterpartHref = computed(() => {
  if (!props.note || !counterpart.value) return null
  const anchor = props.note.replace(/^#/, '').normalize('NFKD')
  return `${counterpart.value}#${anchor}`
})

function play() {
  if (seconds.value !== null) requestSeek(seconds.value)
}
</script>

<template>
  <p class="audio-cue">
    <button type="button" class="audio-cue__play" @click="play">
      ▶ 이 부분 듣기 ({{ label }})
    </button>
    <a v-if="counterpartHref" class="audio-cue__link" :href="counterpartHref">
      {{ counterpartLabel }} →
    </a>
  </p>
</template>

<style scoped>
.audio-cue {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin: 0.75rem 0 1.25rem;
}
.audio-cue__play {
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 0.25rem 0.9rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
}
.audio-cue__play:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.audio-cue__link {
  font-size: 0.85rem;
}
</style>
