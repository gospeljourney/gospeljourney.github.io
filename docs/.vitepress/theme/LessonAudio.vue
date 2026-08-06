<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useData } from 'vitepress'

import { resolveAudioSources } from '../../../scripts/lib/media-resolve.mjs'
import { mediaBase } from '../media.mts'
import { audioState } from './audioStore'

const { frontmatter, theme } = useData()

const audio = computed(() => frontmatter.value.audio)
const sources = computed(() =>
  audio.value ? resolveAudioSources(audio.value.file, undefined, mediaBase) : []
)

const sourceIndex = ref(0)
const element = ref<HTMLAudioElement | null>(null)
const failed = ref(false)

const currentSource = computed(() => sources.value[sourceIndex.value] ?? null)
const downloadHref = computed(() => sources.value[sources.value.length - 1] ?? null)

// 재생에 실패하면 다음 미러로 넘어간다. 지역을 추측하지 않는다.
function onError() {
  if (sourceIndex.value + 1 < sources.value.length) {
    sourceIndex.value += 1
    return
  }
  failed.value = true
}

watch(
  () => audioState.nonce,
  () => {
    const target = audioState.seekTo
    if (target === null || !element.value) return
    element.value.currentTime = target
    void element.value.play()
  }
)
</script>

<template>
  <div v-if="audio" class="lesson-audio">
    <div v-if="failed" class="lesson-audio__fallback">
      {{ theme.lessonAudio.unavailable }}
      <a v-if="downloadHref" :href="downloadHref" download>{{ theme.lessonAudio.download }}</a>
    </div>
    <audio
      v-else-if="currentSource"
      ref="element"
      class="lesson-audio__player"
      controls
      preload="metadata"
      :src="currentSource"
      @error="onError"
    ></audio>
    <div v-else class="lesson-audio__fallback">{{ theme.lessonAudio.unconfigured }}</div>
  </div>
</template>

<style scoped>
.lesson-audio {
  position: sticky;
  bottom: 0;
  z-index: 20;
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg);
  border-top: 1px solid var(--vp-c-divider);
}
.lesson-audio__player {
  width: 100%;
}
.lesson-audio__fallback {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
</style>
