function expandHex(hex) {
  const value = String(hex).replace('#', '');
  return value.length === 3 ? value.split('').map(character => character + character).join('') : value;
}

export function hexToRgb(hex) {
  const value = expandHex(hex);
  if (!/^[0-9a-f]{6}$/i.test(value)) throw new TypeError(`Unsupported color: ${hex}`);
  return [0, 2, 4].map(offset => Number.parseInt(value.slice(offset, offset + 2), 16));
}

export function relativeLuminance(hex) {
  const channels = hexToRgb(hex).map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(foreground, background) {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

