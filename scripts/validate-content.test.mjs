import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { LOCALES } from './lib/locales.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))

// 이 테스트는 실제 docs 트리를 대상으로 CLI 를 실행하므로 locale 별 콘텐츠 개수를
// 단정하지 않는다. 개수를 고정하면 그 언어에 콘텐츠가 추가되는 순간 깨진다.
// 콘텐츠가 없는 locale 이 빈 과정 목록으로 처리되는지는 courses.test.mjs 가
// 파일시스템과 무관한 단위 테스트로 검증한다.
test('validate-content: 지원 locale 전체를 검사 대상에 포함한다', () => {
  const output = execFileSync(process.execPath, ['scripts/validate-content.mjs'], {
    cwd: root,
    encoding: 'utf8',
  })

  for (const locale of LOCALES) {
    assert.match(
      output,
      new RegExp(`^\\[${locale}\\] 과정 \\d+개, 강의 \\d+개를 검사했습니다\\.$`, 'm'),
      `${locale} locale 이 검사 출력에 없다`
    )
  }

  assert.match(output, /^검증 통과$/m)
})
