export declare const ICO_SIZES: number[]
export declare function renderPng(svg: string, width: number, height?: number): Buffer
export declare function pngSize(buffer: Buffer): { width: number; height: number }
export declare function encodeIco(entries: Array<{ size: number; png: Buffer }>): Buffer
