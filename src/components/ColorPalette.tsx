// src/components/ColorPalette.tsx
// Color swatch picker for the canvas coloring interface.
// Requirements: 5.2, 5.3, 8.3, 8.1

import { COLOR_PALETTE } from '../lib/colorPalette'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ColorPaletteProps {
  /** Hex value of the currently selected color, or null if none selected. */
  selectedColor: string | null
  /** Called with the hex value when the user picks a color. */
  onColorSelect: (hex: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders all 22 palette colors as circular swatches.
 * - Each swatch is ≥ 44×44px (WCAG minimum touch target — Req 8.1)
 * - Color name displayed below the swatch in Indonesian (Req 8.3)
 * - `title` tooltip on the button for hover / accessibility (Req 8.3)
 * - Selected swatch has a prominent ring highlight (Req 5.3)
 */
export function ColorPalette({ selectedColor, onColorSelect }: ColorPaletteProps) {
  return (
    <div
      className="flex flex-nowrap overflow-x-auto gap-3 p-3 justify-start lg:flex-wrap lg:justify-center scrollbar-none"
      role="radiogroup"
      aria-label="Pilih warna"
    >
      {COLOR_PALETTE.map((color) => {
        const isSelected = selectedColor !== null && color.hex.toLowerCase() === selectedColor.toLowerCase()

        return (
          <div key={color.id} className="flex flex-col items-center gap-1 shrink-0">
            {/* Swatch button */}
            <button
              type="button"
              title={color.name}
              aria-label={color.name}
              aria-checked={isSelected}
              role="radio"
              onClick={() => onColorSelect(color.hex)}
              style={{ backgroundColor: color.hex }}
              className={[
                // Size: ≥ 44×44px per WCAG / Req 8.1
                'w-12 h-12 rounded-full cursor-pointer',
                // Smooth transition for ring appearance
                'transition-all duration-150',
                // Border to ensure visibility on light/white swatches
                'border-2',
                isSelected
                  ? // Selected: thick, contrasting ring offset (Req 5.3)
                    'border-gray-800 ring-4 ring-offset-2 ring-gray-700 scale-110 shadow-lg'
                  : // Unselected: subtle border only
                    'border-gray-300 hover:scale-105 hover:shadow-md hover:border-gray-500',
              ]
                .filter(Boolean)
                .join(' ')}
            />

            {/* Color name below swatch — Indonesian, ≥ 16px (Req 8.1, 8.3) */}
            <span
              className="text-center text-base font-medium text-gray-700 leading-tight max-w-[64px] break-words"
              aria-hidden="true"
            >
              {color.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
