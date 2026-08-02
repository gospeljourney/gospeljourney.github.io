const COEFFICIENTS = [0.2126, 0.7152, 0.0722]

/** sRGB 16진수 색의 WCAG 상대 휘도를 계산한다. */
export function relativeLuminance(hex) {
  return hex
    .slice(1)
    .match(/../g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((total, channel, index) => total + channel * COEFFICIENTS[index], 0)
}

/** 두 색의 대비비를 계산한다. 인자 순서는 결과에 영향을 주지 않는다. */
export function contrastRatio(a, b) {
  const first = relativeLuminance(a)
  const second = relativeLuminance(b)
  const [light, dark] = first > second ? [first, second] : [second, first]

  return (light + 0.05) / (dark + 0.05)
}
