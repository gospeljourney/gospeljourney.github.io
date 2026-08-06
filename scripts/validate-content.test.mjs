import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const root = fileURLToPath(new URL('../', import.meta.url))

test('validate-content: 콘텐츠가 없는 지원 locale도 검사한다', () => {
  const output = execFileSync(process.execPath, ['scripts/validate-content.mjs'], {
    cwd: root,
    encoding: 'utf8',
  })

  assert.match(output, /^\[ko\] 과정 \d+개, 강의 \d+개를 검사했습니다\.$/m)
  assert.match(output, /^\[en\] 과정 0개, 강의 0개를 검사했습니다\.$/m)
  assert.match(output, /^\[ja\] 과정 0개, 강의 0개를 검사했습니다\.$/m)
})
