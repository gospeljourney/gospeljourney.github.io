/**
 * "5:57", "1:02:03", 357, "357" 을 초 단위 정수로 바꾼다.
 * 형식이 맞지 않으면 null 을 돌려준다. 예외를 던지지 않는다.
 */
export function parseTimecode(value) {
  if (value === null || value === undefined) return null

  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 0 ? value : null
  }

  const text = String(value).trim()
  if (text === '') return null

  const parts = text.split(':')
  if (parts.length > 3) return null
  if (!parts.every((part) => /^\d+$/.test(part))) return null

  const numbers = parts.map(Number)

  // 초와 분 자리는 60 미만이어야 한다.
  if (numbers.length > 1 && numbers[numbers.length - 1] >= 60) return null
  if (numbers.length > 2 && numbers[1] >= 60) return null

  return numbers.reduce((total, part) => total * 60 + part, 0)
}
