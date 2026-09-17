import { getPaletteSync, getSwatchesSync } from 'colorthief'

/**
 * @returns lighter version of color
 */
function lightenColor(rgbString: string, percent: number = 90 / 100): string {
  const rgb = rgbString.match(/\d+/g)!.map(Number)
  const r = Math.round(rgb[0]! + (255 - rgb[0]!) * percent)
  const g = Math.round(rgb[1]! + (255 - rgb[1]!) * percent)
  const b = Math.round(rgb[2]! + (255 - rgb[2]!) * percent)
  return `rgb(${r}, ${g}, ${b})`
}

/**
 *  Gets {@link https://m3.material.io/styles/color/dynamic/content-based-source | Content-based Color} from image.
 */
export const getImgColor = (img: HTMLImageElement): string => {
  const swatches = getSwatchesSync(img)
  let choosenColor: string | undefined = undefined

  //  Choose vibrant color if present
  if (swatches.Vibrant) {
    choosenColor = swatches.Vibrant.color.css()
  }
  if (!choosenColor) {
    const palette = getPaletteSync(img)

    //  Choose a non-grey color
    for (const color of palette!) {
      const rgb = color.rgb()
      const rgbArr = [rgb.r, rgb.g, rgb.b]
      if (Math.max(...rgbArr) - Math.min(...rgbArr) <= 20) continue
      choosenColor = color.css()!
      break
    }

    // If no vibrant or non-grey colors are present, choose a random color
    if (!choosenColor) choosenColor = palette![0]?.css() ?? ''
  }
  return lightenColor(choosenColor)
}
