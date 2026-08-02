import type { Course } from './courses.d.mts'

export declare function buildSidebar(
  courses: Course[],
  options?: { locale?: string; notesLabel?: string }
): Record<string, unknown[]>
