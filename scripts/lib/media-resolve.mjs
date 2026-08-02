/**
 * audio.file 을 실제로 시도할 URL 목록으로 바꾼다.
 * 앞에서부터 시도하고 재생에 실패하면 다음 후보로 넘어간다.
 *
 * '/' 로 시작하면 사이트가 직접 서빙하는 경로로 보고 그대로 쓴다.
 * (개발 중 로컬 파일, 그리고 훗날 오프라인 패키지에서 쓰인다)
 */
export function resolveAudioSources(file, region, base) {
  if (!file) return []
  if (file.startsWith('http://') || file.startsWith('https://')) return [file]
  if (file.startsWith('/')) return [file]

  const bases = []
  const mirror = region ? base.mirrors?.[region] : undefined
  if (mirror) bases.push(mirror)
  if (base.default) bases.push(base.default)

  return bases.map((prefix) => `${prefix.replace(/\/+$/, '')}/${file.replace(/^\/+/, '')}`)
}
