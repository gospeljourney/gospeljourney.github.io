import { reactive } from 'vue'

// AudioCue 가 요청한 재생 시점을 LessonAudio 가 받는다.
// nonce 는 같은 시점을 두 번 눌렀을 때도 반응하게 한다.
export const audioState = reactive({
  seekTo: null as number | null,
  nonce: 0,
})

export function requestSeek(seconds: number) {
  audioState.seekTo = seconds
  audioState.nonce += 1
}
