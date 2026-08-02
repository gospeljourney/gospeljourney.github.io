// 오디오 URL 은 이 파일 한 곳에서만 조립한다 (ADR-010).
// Markdown 의 audio.file 은 경로 조각일 뿐 URL 을 알지 못한다.
// 호스팅을 옮기거나 미러를 더할 때 Markdown 은 한 글자도 바뀌지 않는다.
export const mediaBase = {
  // Cloudflare R2 공개 URL. 버킷 준비 전에는 비워 둔다.
  // 비어 있으면 audio.file 이 '/' 로 시작하는 사이트 자체 경로만 재생된다.
  default: '',

  // 지역별 미러. 중국 본토는 미해결 상태이며 해결한 척하지 않는다.
  // 경로가 확보되면 여기만 채운다.
  mirrors: {} as Record<string, string>,
}
