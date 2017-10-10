const clamp = (n, n1, n2) => n < n1 ? n1 : n > n2 ? n2 : n

// source: https://www.developers.meethue.com/documentation/color-conversions-rgb-xy
export const xy2rgb = (x, y, l) => {
  console.log('=>', x, y)

  const Y = l / 255,
        z = 1 - x - y,
        X = (Y / y) * x,
        Z = (Y / y) * z

  let r, g, b

  //sRGB conversion
  r =  X * 1.656492 - Y * 0.354851 - Z * 0.255038
  g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152
  b =  X * 0.051713 - Y * 0.121364 + Z * 1.011530

  // trimming
  if (r > b && r > g && r > 1) {
    g = g / r
    b = b / r
    r = 1
  }
  else if (g > b && g > r && g > 1) {
    r = r / g
    b = b / g
    g = 1
  }
  else if (b > r && b > g && b > 1) {
    r = r / b
    g = g / b
    b = 1
  }

  return {
    r: (0xff * clamp(r, 0, 1)) | 0,
    g: (0xff * clamp(g, 0, 1)) | 0,
    b: (0xff * clamp(b, 0, 1)) | 0,
  }

  // gamma correction
  r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055
  g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055
  b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055

  // trimming again
  if (r > b && r > g && r > 1) {
    g = g / r
    b = b / r
    r = 1
  }
  else if (g > b && g > r && g > 1) {
    r = r / g
    b = b / g
    g = 1
  }
  else if (b > r && b > g && b > 1) {
    r = r / b
    g = g / b
    b = 1
  }

  return {
    r: (0xff * clamp(r, 0, 1)) | 0,
    g: (0xff * clamp(g, 0, 1)) | 0,
    b: (0xff * clamp(b, 0, 1)) | 0,
  }
}

// source: http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/ (reworked)
export const ct2rgb = k => {
  const t = k / 100

  // r
  const r = t <= 66
    ? 255
    : 329.698727446 * Math.pow(t - 60, -0.1332047592)

  // g
  const g = t <= 66
    ? 99.4708025861 * Math.log(t) - 161.1195681661
    : 288.1221695283 * Math.pow(t - 60, -0.0755148492)

  // b
  const b = t >= 66
    ? 255
    : t <= 19
    ? 0
    : 138.5177312231 * Math.log(t - 10) - 305.0447927307

  return {
    r: clamp(r, 0, 0xff) | 0,
    g: clamp(g, 0, 0xff) | 0,
    b: clamp(b, 0, 0xff) | 0,
  }
}

/*
 we need hsl values to ensure smooth "tint-based" color transitions
 but we use rgb as pivot point as it looks impossible to find "___toHSL" color converters
 */
// source: https://gist.github.com/mjackson/5311256
export const rgb2hsv = ({ r, g, b }) => {
  r /= 255
  g /= 255
  b /= 255

  let h, s, v

  const max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        d   = max - min

  if (max == min) { h = 0 }
  else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break;

      case g:
        h = (b - r) / d + 2
        break;

      case b:
        h = (r - g) / d + 4
        break;
    }

    h /= 6
  }

  s = max !== 0 ? d / max : 0
  v = max

  return {
    h: clamp(h * 360,  0,  360),
    s: clamp(s * 0xff, 0, 0xff),
    v: clamp(v * 0xff, 0, 0xff)
  }
}
