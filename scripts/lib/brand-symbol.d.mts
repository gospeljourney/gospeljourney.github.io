export type PaletteToken = 'deep' | 'mid' | 'gold' | 'cream'
export type SymbolVariant = 'full' | 'compact'

export interface SymbolGeometry {
  radius: number
  strokeWidth: number
  sun: { cx: number; cy: number; r: number }
  hills: Array<{ fill: PaletteToken; d: string }>
  road: string
  cross: string
}

export declare const PALETTE: Record<PaletteToken, string>
export declare const DECORATIVE_TOKENS: Set<string>
export declare const FULL: SymbolGeometry
export declare const COMPACT: SymbolGeometry
export declare function symbolSvg(variant?: SymbolVariant): string
