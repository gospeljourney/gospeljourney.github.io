import { Resvg } from '@resvg/resvg-js'

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/** favicon.ico 에 담을 크기. 48 도 compact 기하로 렌더한다 (BRAND 원장 §4.4). */
export const ICO_SIZES = [16, 32, 48]

/** SVG 문자열을 PNG 버퍼로 렌더한다. height 를 생략하면 정사각이다. */
export function renderPng(svg, width, height = width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    background: 'rgba(0,0,0,0)',
  })
  const png = Buffer.from(resvg.render().asPng())
  const size = pngSize(png)
  if (size.width !== width || size.height !== height) {
    throw new Error(`렌더 치수가 ${size.width}x${size.height} 로 요청한 ${width}x${height} 와 다르다`)
  }

  return png
}

/** PNG IHDR 청크에서 픽셀 치수를 읽는다. */
export function pngSize(buffer) {
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error('PNG 시그니처가 아니다')

  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

/** PNG 버퍼들을 PNG-in-ICO 컨테이너로 묶는다. */
export function encodeIco(entries) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(entries.length, 4)

  const directory = Buffer.alloc(16 * entries.length)
  let offset = header.length + directory.length

  entries.forEach(({ size, png }, index) => {
    const at = index * 16
    directory.writeUInt8(size >= 256 ? 0 : size, at)
    directory.writeUInt8(size >= 256 ? 0 : size, at + 1)
    directory.writeUInt8(0, at + 2)
    directory.writeUInt8(0, at + 3)
    directory.writeUInt16LE(1, at + 4)
    directory.writeUInt16LE(32, at + 6)
    directory.writeUInt32LE(png.length, at + 8)
    directory.writeUInt32LE(offset, at + 12)
    offset += png.length
  })

  return Buffer.concat([header, directory, ...entries.map((entry) => entry.png)])
}
