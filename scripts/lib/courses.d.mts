export interface ContentFile {
  file: string
  link: string
  dir: string
  kind: 'course' | 'lesson' | 'notes'
  id?: string
  title?: string
  description?: string
  locale?: string
  sourceLocale?: string
  translationStatus?: string
  course?: string
  lesson?: number
  sourceRevision?: number
  updated?: string
  notes?: string
  lessonRef?: string
  audio?: { file: string; duration: number }
}

export interface Course {
  slug: string
  title: string
  description?: string
  link: string
  index: ContentFile | null
  lessons: ContentFile[]
  notes: ContentFile[]
}

export declare const ALL_STATUSES: Set<string>
export declare const PUBLIC_STATUSES: Set<string>
export declare function toLink(relPath: string): string
export declare function parseContentFile(relPath: string, raw: string): ContentFile
export declare function loadCourses(docsDir: string, locale: string): Course[]
