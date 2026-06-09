// src/lib/colorPalette.ts

export interface PaletteColor {
  id: string
  name: string // Human-readable color name in English
  hex: string
}

export const COLOR_PALETTE: PaletteColor[] = [
  { id: 'red',       name: 'Red',        hex: '#FF0000' },
  { id: 'orange',    name: 'Orange',     hex: '#FF7F00' },
  { id: 'yellow',    name: 'Yellow',     hex: '#FFFF00' },
  { id: 'lime',      name: 'Lime',       hex: '#7FFF00' },
  { id: 'green',     name: 'Green',      hex: '#00AA00' },
  { id: 'teal',      name: 'Teal',       hex: '#00AAAA' },
  { id: 'cyan',      name: 'Cyan',       hex: '#00FFFF' },
  { id: 'blue',      name: 'Blue',       hex: '#0000FF' },
  { id: 'navy',      name: 'Navy',       hex: '#000080' },
  { id: 'purple',    name: 'Purple',     hex: '#7F00FF' },
  { id: 'magenta',   name: 'Magenta',    hex: '#FF00FF' },
  { id: 'pink',      name: 'Pink',       hex: '#FF7FBF' },
  { id: 'brown',     name: 'Brown',      hex: '#8B4513' },
  { id: 'skin',      name: 'Skin',       hex: '#FFDBAC' },
  { id: 'gold',      name: 'Gold',       hex: '#FFD700' },
  { id: 'silver',    name: 'Silver',     hex: '#C0C0C0' },
  { id: 'white',     name: 'White',      hex: '#FFFFFF' },
  { id: 'black',     name: 'Black',      hex: '#222222' },
  { id: 'darkgreen', name: 'Dark Green', hex: '#006400' },
  { id: 'coral',     name: 'Coral',      hex: '#FF6B6B' },
  { id: 'sky',       name: 'Sky Blue',   hex: '#87CEEB' },
  { id: 'mint',      name: 'Mint',       hex: '#98FF98' },
]
// 22 colors total — satisfies ≥ 20 requirement (Requirements 5.2, 8.3)
