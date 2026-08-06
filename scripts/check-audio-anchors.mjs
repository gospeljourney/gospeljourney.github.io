#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadCourses } from './lib/courses.mjs'
import { LOCALES } from './lib/locales.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const docsDir = join(root, 'docs')
const distDir = join(docsDir, '.vitepress', 'dist')

if (!existsSync(distDir)) {
  console.error('빌드 산출물이 없습니다. 먼저 npm run docs:build 를 실행하세요.')
  process.exit(1)
}

/** 사이트 링크를 빌드된 HTML 경로로 바꾼다. cleanUrls: true 기준. */
function distPathFor(link) {
  const relative = link.replace(/^\//, '')
  return relative.endsWith('/')
    ? join(distDir, relative, 'index.html')
    : join(distDir, `${relative}.html`)
}

/** HTML 에 실제로 존재하는 id 속성을 모은다. */
function idsIn(htmlPath) {
  const html = readFileSync(htmlPath, 'utf8')
  return new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]))
}

let failures = 0
let checked = 0

for (const locale of LOCALES) {
  for (const course of loadCourses(docsDir, locale)) {
    const entries = [...course.lessons, ...course.notes]
    const byLink = new Map(entries.map((entry) => [entry.link, entry]))

    for (const entry of entries) {
      const counterpartRef = entry.notes ?? entry.lessonRef
      for (const cue of entry.cues ?? []) {
        if (!cue.note) continue
        checked += 1

        if (!counterpartRef) {
          console.error(
            `  ✗ ${entry.file}\n    AudioCue note="${cue.note}" 가 있지만 notes/lessonRef 가 없습니다.`
          )
          failures += 1
          continue
        }

        const dir = entry.link.slice(0, entry.link.lastIndexOf('/') + 1)
        const targetLink = dir + counterpartRef.replace(/^\.\//, '')
        const target = byLink.get(targetLink)
        const targetPath = distPathFor(targetLink)

        if (!target || !existsSync(targetPath)) {
          console.error(
            `  ✗ ${entry.file}\n    대상 문서 '${targetLink}' 의 빌드 결과를 찾을 수 없습니다.`
          )
          failures += 1
          continue
        }

        // VitePress 의 slugify 는 NFKD 로 정규화한다. 한글은 자모로 분해되므로 손으로 쓴 NFC 앵커와 문자열이 다르다.
        const anchor = cue.note.replace(/^#/, '').normalize('NFKD')
        const ids = new Set([...idsIn(targetPath)].map((id) => id.normalize('NFKD')))
        if (!ids.has(anchor)) {
          console.error(
            `  ✗ ${entry.file}\n    앵커 '#${anchor}' 가 ${targetLink} 에 없습니다.`
          )
          failures += 1
        }
      }
    }
  }
}

console.log(`AudioCue 앵커 ${checked}건을 빌드 산출물과 대조했습니다.`)

if (failures > 0) {
  console.error(`\n앵커 검사 실패: ${failures}건`)
  process.exit(1)
}

console.log('앵커 검사 통과')
