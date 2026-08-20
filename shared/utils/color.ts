/**
 * Convert hex color to rgba string.
 */
export function hexToRgba(hex: string, opacity: number): string {
  const h = hex.replace('#', '')
  const r = Number.parseInt(h.substring(0, 2), 16)
  const g = Number.parseInt(h.substring(2, 4), 16)
  const b = Number.parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Lighten a hex color by adjusting its HSL lightness.
 * Amount is 0-1 (e.g. 0.2 = +20% lightness).
 */
export function lighten(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  let r = Number.parseInt(h.substring(0, 2), 16) / 255
  let g = Number.parseInt(h.substring(2, 4), 16) / 255
  let b = Number.parseInt(h.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let hue = 0
  let sat = 0
  let light = (max + min) / 2

  if (max !== min) {
    const d = max - min
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) hue = ((b - r) / d + 2) / 6
    else hue = ((r - g) / d + 4) / 6
  }

  light = Math.min(1, light + amount)

  // HSL to RGB
  if (sat === 0) {
    r = g = b = light
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat
    const p = 2 * light - q
    r = hue2rgb(p, q, hue + 1 / 3)
    g = hue2rgb(p, q, hue)
    b = hue2rgb(p, q, hue - 1 / 3)
  }

  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
