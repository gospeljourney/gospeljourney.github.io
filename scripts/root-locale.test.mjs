import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const root = fileURLToPath(new URL('../', import.meta.url))

test('루트 진입 페이지는 한국어 기본 lang으로 빌드된다', () => {
  execFileSync('npm', ['run', 'docs:build'], { cwd: root, stdio: 'pipe' })

  const html = readFileSync(`${root}docs/.vitepress/dist/index.html`, 'utf8')
  assert.match(html, /^<html lang="ko-KR" dir="ltr">$/m)
})
