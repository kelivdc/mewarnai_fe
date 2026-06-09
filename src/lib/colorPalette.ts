// src/lib/colorPalette.ts

export interface PaletteColor {
  id: string
  name: string // Human-readable name in Indonesian
  hex: string
}

export const COLOR_PALETTE: PaletteColor[] = [
  { id: 'red',       name: 'Merah',      hex: '#FF0000' },
  { id: 'orange',    name: 'Oranye',     hex: '#FF7F00' },
  { id: 'yellow',    name: 'Kuning',     hex: '#FFFF00' },
  { id: 'lime',      name: 'Hijau Muda', hex: '#7FFF00' },
  { id: 'green',     name: 'Hijau',      hex: '#00AA00' },
  { id: 'teal',      name: 'Tosca',      hex: '#00AAAA' },
  { id: 'cyan',      name: 'Biru Muda',  hex: '#00FFFF' },
  { id: 'blue',      name: 'Biru',       hex: '#0000FF' },
  { id: 'navy',      name: 'Biru Tua',   hex: '#000080' },
  { id: 'purple',    name: 'Ungu',       hex: '#7F00FF' },
  { id: 'magenta',   name: 'Magenta',    hex: '#FF00FF' },
  { id: 'pink',      name: 'Merah Muda', hex: '#FF7FBF' },
  { id: 'brown',     name: 'Coklat',     hex: '#8B4513' },
  { id: 'skin',      name: 'Kulit',      hex: '#FFDBAC' },
  { id: 'gold',      name: 'Emas',       hex: '#FFD700' },
  { id: 'silver',    name: 'Abu-abu',    hex: '#C0C0C0' },
  { id: 'white',     name: 'Putih',      hex: '#FFFFFF' },
  { id: 'black',     name: 'Hitam',      hex: '#222222' },
  { id: 'darkgreen', name: 'Hijau Tua',  hex: '#006400' },
  { id: 'coral',     name: 'Koral',      hex: '#FF6B6B' },
  { id: 'sky',       name: 'Langit',     hex: '#87CEEB' },
  { id: 'mint',      name: 'Mint',       hex: '#98FF98' },
]
// 22 colors total — satisfies ≥ 20 requirement (Requirements 5.2, 8.3)
