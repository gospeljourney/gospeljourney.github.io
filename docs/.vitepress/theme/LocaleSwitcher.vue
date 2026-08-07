<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

import { LOCALES } from '../../../scripts/lib/locales.mjs'

const props = defineProps<{
  mobile?: boolean
}>()

const { hash, localeIndex, page, site, theme } = useData()
const isOpen = ref(false)
const switcher = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const menuItems = ref<HTMLAnchorElement[]>([])

const currentLocale = computed(() => localeIndex.value)
const currentLabel = computed(
  () => site.value.locales[currentLocale.value]?.label ?? currentLocale.value
)
const languageMenuLabel = computed(() => theme.value.languageMenuLabel)
const ariaLabel = computed(() => `${languageMenuLabel.value}: ${currentLabel.value}`)
const className = computed(() => (props.mobile ? 'LocaleSwitcher--mobile' : 'LocaleSwitcher--desktop'))

const locales = computed(() =>
  LOCALES.map((locale) => ({
    locale,
    label: site.value.locales[locale]?.label ?? locale,
    href: localePath(locale),
  }))
)

function localePath(targetLocale: string) {
  const relativePath = page.value.relativePath
    .replace(new RegExp(`^${currentLocale.value}/`), '')
    .replace(/index\.md$/, '')
    .replace(/\.md$/, '')

  return `/${targetLocale}/${relativePath}${hash.value}`
}

function setMenuItem(element: Element | null) {
  if (element instanceof HTMLAnchorElement && !menuItems.value.includes(element)) {
    menuItems.value.push(element)
  }
}

function openMenu(focusIndex = 0) {
  menuItems.value = []
  isOpen.value = true
  nextTick(() => menuItems.value[focusIndex]?.focus())
}

function closeMenu(returnFocus = false) {
  isOpen.value = false
  if (returnFocus) nextTick(() => trigger.value?.focus())
}

function chooseLocale(locale: string) {
  if (locale === currentLocale.value) return

  try {
    window.localStorage.setItem('preferred-locale', locale)
  } catch {
    // 저장소를 사용할 수 없어도 현재 문서의 언어 경로로 이동한다.
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu(true)
    return
  }

  if (!isOpen.value || !['ArrowDown', 'ArrowUp'].includes(event.key)) return

  const currentIndex = menuItems.value.indexOf(event.target as HTMLAnchorElement)
  if (currentIndex === -1) return

  event.preventDefault()
  const direction = event.key === 'ArrowDown' ? 1 : -1
  const nextIndex = (currentIndex + direction + menuItems.value.length) % menuItems.value.length
  menuItems.value[nextIndex]?.focus()
}

function closeOnOutsideClick(event: MouseEvent) {
  if (switcher.value && !switcher.value.contains(event.target as Node)) closeMenu()
}

onMounted(() => document.addEventListener('click', closeOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', closeOnOutsideClick))
</script>

<template>
  <div ref="switcher" class="LocaleSwitcher" :class="className" @keydown="onKeydown">
    <button
      ref="trigger"
      class="LocaleSwitcher-trigger"
      type="button"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      :aria-label="ariaLabel"
      @click="isOpen ? closeMenu() : openMenu()"
      @keydown.down.prevent="openMenu()"
      @keydown.up.prevent="openMenu(locales.length - 1)"
    >
      <span aria-hidden="true" class="vpi-languages LocaleSwitcher-icon" />
      <span>{{ currentLabel }}</span>
      <span aria-hidden="true" class="vpi-chevron-down LocaleSwitcher-chevron" />
    </button>

    <div v-if="isOpen" class="LocaleSwitcher-menu" role="menu" :aria-label="languageMenuLabel">
      <a
        v-for="locale in locales"
        :key="locale.locale"
        :ref="setMenuItem"
        class="LocaleSwitcher-option"
        :href="locale.href"
        role="menuitem"
        :aria-current="locale.locale === currentLocale ? 'page' : undefined"
        @click="chooseLocale(locale.locale)"
      >
        {{ locale.label }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.LocaleSwitcher {
  position: relative;
  pointer-events: auto;
}

.LocaleSwitcher-trigger,
.LocaleSwitcher-option {
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 500;
}

.LocaleSwitcher-trigger {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 32px;
  padding: 0 0.5rem;
  border: 0;
  border-radius: 0.375rem;
  background: transparent;
  cursor: pointer;
}

.LocaleSwitcher-trigger:hover,
.LocaleSwitcher-option:hover,
.LocaleSwitcher-option[aria-current='page'] {
  color: var(--vp-c-brand-1);
}

.LocaleSwitcher-trigger:focus-visible,
.LocaleSwitcher-option:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.LocaleSwitcher-icon,
.LocaleSwitcher-chevron {
  color: var(--vp-c-text-2);
}

.LocaleSwitcher-menu {
  position: absolute;
  top: calc(100% + 0.25rem);
  right: 0;
  z-index: 1;
  min-width: 9rem;
  padding: 0.375rem;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
  box-shadow: var(--vp-shadow-3);
}

.LocaleSwitcher-option {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
}

.LocaleSwitcher-option:hover {
  background: var(--vp-c-default-soft);
}

.LocaleSwitcher--mobile {
  margin-top: 1.5rem;
}

.LocaleSwitcher--mobile .LocaleSwitcher-trigger {
  padding-left: 0;
}

.LocaleSwitcher--mobile .LocaleSwitcher-menu {
  right: auto;
  left: 0;
}

@media (max-width: 767px) {
  .LocaleSwitcher--desktop {
    display: none;
  }
}
</style>
