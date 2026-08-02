export interface OutlinedText {
  d: string
  width: number
  bbox: { minX: number; minY: number; maxX: number; maxY: number }
  capHeight: number
  unitsPerEm: number
}

export declare const WORDMARK_TEXT: string
export declare const TAGLINE_TEXT: string
export declare const TAGLINE_TRACKING: number
export declare function loadFont(weight?: number): unknown
export declare function outlineText(
  text: string,
  options?: { weight?: number; tracking?: number; uppercase?: boolean }
): OutlinedText
export declare function wordmarkSvg(): string
export declare function wordmarkFullSvg(): string
