import { LOCALES } from './locales.mjs'

function matchingLocale(value, supportedLocales) {
  if (typeof value !== 'string') return undefined

  const language = value.split('-')[0].toLowerCase()
  return supportedLocales.find((locale) => locale.toLowerCase() === language)
}

export function resolvePreferredLocale({
  preferredLocale,
  browserLanguages = [],
  supportedLocales = LOCALES,
  fallback = 'ko',
}) {
  const savedLocale = matchingLocale(preferredLocale, supportedLocales)
  if (savedLocale) return savedLocale

  for (const browserLanguage of browserLanguages) {
    const locale = matchingLocale(browserLanguage, supportedLocales)
    if (locale) return locale
  }

  return fallback
}
