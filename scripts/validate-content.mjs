#!/usr/bin/env node
import { fileURLToPath } from 'node:url'

import { loadCourses } from './lib/courses.mjs'
import { LOCALES } from './lib/locales.mjs'
import { validateCourses } from './lib/validate.mjs'

const docsDir = fileURLToPath(new URL('../docs/', import.meta.url))

let total = 0

for (const locale of LOCALES) {
  const courses = loadCourses(docsDir, locale)
  const issues = validateCourses(courses, locale)

  const lessonCount = courses.reduce((sum, course) => sum + course.lessons.length, 0)
  console.log(
    `[${locale}] 과정 ${courses.length}개, 강의 ${lessonCount}개를 검사했습니다.`
  )

  for (const issue of issues) {
    console.error(`  ✗ ${issue.file}\n    [${issue.rule}] ${issue.message}`)
  }
  total += issues.length
}

if (total > 0) {
  console.error(`\n검증 실패: 위반 ${total}건`)
  process.exit(1)
}

console.log('검증 통과')
