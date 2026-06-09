/**
 * Property-based tests for the ColorPalette component.
 *
 * Property 23: Palette Colors Have Names
 * Validates: Requirements 8.3
 *
 * For any color in the COLOR_PALETTE array, its rendered swatch element
 * should include the color's `name` as visible text or an accessible tooltip
 * (title attribute).
 */

// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ColorPalette } from './ColorPalette'
import { COLOR_PALETTE } from '../lib/colorPalette'

describe('ColorPalette – Property 23: Palette Colors Have Names (Validates: Requirements 8.3)', () => {
  /**
   * Property 23: For any color in the COLOR_PALETTE array, its rendered
   * swatch element should include the color's `name` as visible text or an
   * accessible tooltip (title attribute).
   */
  it('every color in COLOR_PALETTE has its name as visible text or a title attribute', () => {
    const { container } = render(
      <ColorPalette selectedColor={null} onColorSelect={() => {}} />,
    )

    for (const color of COLOR_PALETTE) {
      // Check 1: color name appears as visible text somewhere in the component
      const visibleTextElements = screen.queryAllByText(color.name)
      const hasVisibleText = visibleTextElements.length > 0

      // Check 2: any element within the component carries a `title` attribute
      // equal to the color name (tooltip / accessibility)
      const elementsWithTitle = container.querySelectorAll(
        `[title="${color.name}"]`,
      )
      const hasTitleTooltip = elementsWithTitle.length > 0

      expect(
        hasVisibleText || hasTitleTooltip,
        `Color "${color.name}" (id: ${color.id}) should appear as visible text ` +
          `or a title attribute, but neither was found in the rendered output.`,
      ).toBe(true)
    }
  })

  it('every rendered swatch button carries the color name as an aria-label', () => {
    const { container } = render(
      <ColorPalette selectedColor={null} onColorSelect={() => {}} />,
    )

    for (const color of COLOR_PALETTE) {
      const buttons = container.querySelectorAll(
        `button[aria-label="${color.name}"]`,
      )
      expect(
        buttons.length,
        `Color "${color.name}" should have a button with aria-label="${color.name}"`,
      ).toBeGreaterThan(0)
    }
  })
})
