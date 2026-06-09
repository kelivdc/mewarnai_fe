import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { floodFill } from '@/lib/floodFill'
import { saveColoringAction } from '../server/actions/coloring'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColoringCanvasProps {
  /** URL of the B&W coloring page PNG */
  imageUrl: string
  /** Optional: previously saved canvas state as a number[] (PNG bytes) */
  coloringSave?: number[]
  /** Currently selected hex color from the palette */
  activeColor: string
  /** Called whenever the dirty state changes */
  onDirtyChange?: (dirty: boolean) => void
}

export interface ColoringCanvasHandle {
  undo: () => void
  reset: () => void
  getBlob: () => Promise<Blob | null>
  save: (imageId: number) => Promise<{ success: boolean; error?: string }>
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_UNDO = 20

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a CSS hex color string into an [R, G, B] tuple. */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const int = parseInt(full, 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

/** Load an image URL and return the HTMLImageElement once loaded. */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ColoringCanvas
 *
 * Wraps a native <canvas> element that displays a B&W coloring page.
 * Exposes undo / reset / getBlob via an imperative handle.
 *
 * Flood-fill wiring into the click handler is handled by task 12.2.
 */
const ColoringCanvas = forwardRef<ColoringCanvasHandle, ColoringCanvasProps>(
  function ColoringCanvas(
    { imageUrl, coloringSave, activeColor, onDirtyChange },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Keep a reference to the original B&W image so reset can redraw it.
    const baseImageRef = useRef<HTMLImageElement | null>(null)

    // Undo stack — stored outside React state to avoid unnecessary re-renders.
    const undoStackRef = useRef<ImageData[]>([])

    // Dirty flag
    const [isDirty, setIsDirty] = useState(false)
    const isDirtyRef = useRef(false)

    // Track natural image dimensions so the canvas can be sized correctly.
    const imageSizeRef = useRef<{ width: number; height: number }>({
      width: 0,
      height: 0,
    })

    // -----------------------------------------------------------------------
    // Dirty-flag helpers
    // -----------------------------------------------------------------------

    const markDirty = useCallback(() => {
      if (!isDirtyRef.current) {
        isDirtyRef.current = true
        setIsDirty(true)
        onDirtyChange?.(true)
      }
    }, [onDirtyChange])

    const clearDirty = useCallback(() => {
      if (isDirtyRef.current) {
        isDirtyRef.current = false
        setIsDirty(false)
        onDirtyChange?.(false)
      }
    }, [onDirtyChange])

    // -----------------------------------------------------------------------
    // Canvas sizing — responsive: fill container width, keep aspect ratio
    // -----------------------------------------------------------------------

    const applyResponsiveSize = useCallback(
      (canvas: HTMLCanvasElement) => {
        const { width: nw, height: nh } = imageSizeRef.current
        if (!nw || !nh) return

        const container = containerRef.current
        const availableWidth = container ? container.clientWidth : nw

        const scale = availableWidth / nw
        const cssWidth = availableWidth
        const cssHeight = Math.round(nh * scale)

        canvas.style.width = `${cssWidth}px`
        canvas.style.height = `${cssHeight}px`
      },
      [],
    )

    // -----------------------------------------------------------------------
    // Drawing helpers
    // -----------------------------------------------------------------------

    const drawBaseImage = useCallback(
      (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height)
      },
      [],
    )

    // -----------------------------------------------------------------------
    // Imperative handle
    // -----------------------------------------------------------------------

    useImperativeHandle(
      ref,
      () => ({
        /**
         * Undo: pop the last snapshot from the undo stack and restore it.
         */
        undo() {
          const canvas = canvasRef.current
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          if (!ctx) return

          const prev = undoStackRef.current.pop()
          if (prev) {
            ctx.putImageData(prev, 0, 0)
          }

          // If the stack is now empty the canvas is back to its baseline state.
          if (undoStackRef.current.length === 0) {
            clearDirty()
          }
        },

        /**
         * Reset: redraw the original B&W base image, clear the undo stack.
         */
        reset() {
          const canvas = canvasRef.current
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          const img = baseImageRef.current
          if (!img) return

          drawBaseImage(ctx, img)
          undoStackRef.current = []
          clearDirty()
        },

        /**
         * getBlob: export the current canvas state as a PNG Blob.
         */
        getBlob(): Promise<Blob | null> {
          return new Promise((resolve) => {
            const canvas = canvasRef.current
            if (!canvas) return resolve(null)
            canvas.toBlob((blob) => resolve(blob), 'image/png')
          })
        },

        /**
         * save: serialize the canvas as PNG and persist it to the server.
         * Returns { success: true } on success, or { success: false, error } on failure.
         * On success the dirty flag is cleared.
         * Requirements: 6.1, 6.2, 6.5
         */
        async save(imageId: number): Promise<{ success: boolean; error?: string }> {
          const canvas = canvasRef.current
          if (!canvas) return { success: false, error: 'Canvas not available.' }

          // Serialize canvas → PNG Blob
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/png')
          })

          if (!blob) return { success: false, error: 'Failed to export canvas as PNG.' }

          // Convert Blob → ArrayBuffer → number[]
          const arrayBuffer = await blob.arrayBuffer()
          const canvasBlob = Array.from(new Uint8Array(arrayBuffer))

          // Submit to server
          const result = await saveColoringAction({ data: { imageId, canvasBlob } })

          if (result.success) {
            clearDirty()
          }

          return result.success
            ? { success: true }
            : { success: false, error: (result as { success: false; error: string }).error }
        },
      }),
      [clearDirty, drawBaseImage],
    )

    // -----------------------------------------------------------------------
    // Navigation guard: warn before closing/refreshing the tab when dirty
    // Requirements: 6.6, 6.7
    // -----------------------------------------------------------------------

    useEffect(() => {
      const handler = (e: BeforeUnloadEvent) => {
        if (isDirtyRef.current) {
          e.preventDefault()
          // Legacy support: some browsers require returnValue to be set
          e.returnValue = ''
        }
      }
      window.addEventListener('beforeunload', handler)
      return () => window.removeEventListener('beforeunload', handler)
    }, [])

    // -----------------------------------------------------------------------
    // Public snapshot helper used by task 12.2 before each fill
    // -----------------------------------------------------------------------

    /**
     * Push the current canvas ImageData onto the undo stack.
     * Called by the click handler (task 12.2) before every flood fill.
     */
    const pushUndoSnapshot = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)
      undoStackRef.current.push(snapshot)
      if (undoStackRef.current.length > MAX_UNDO) {
        undoStackRef.current.shift()
      }
    }, [])

    // Expose the snapshot helper and dirty marker on the DOM element so the
    // click handler added in task 12.2 can call them without prop-drilling.
    // We attach them to the canvas element itself via a data attribute approach
    // using a ref-attached object instead.
    const canvasHelpersRef = useRef({ pushUndoSnapshot, markDirty })
    useEffect(() => {
      canvasHelpersRef.current = { pushUndoSnapshot, markDirty }
    }, [pushUndoSnapshot, markDirty])

    // Attach helpers to the canvas DOM node so task 12.2 can access them
    // via (canvasRef.current as any).__coloringHelpers
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      ;(canvas as HTMLCanvasElement & { __coloringHelpers?: unknown }).__coloringHelpers =
        canvasHelpersRef.current
    })

    // -----------------------------------------------------------------------
    // activeColor ref — keeps click handler from capturing a stale closure
    // -----------------------------------------------------------------------

    const activeColorRef = useRef(activeColor)
    useEffect(() => {
      activeColorRef.current = activeColor
    }, [activeColor])

    // -----------------------------------------------------------------------
    // Click handler — flood fill on canvas click (task 12.2)
    // -----------------------------------------------------------------------

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      function handleClick(e: MouseEvent) {
        const ctx = canvas!.getContext('2d')
        if (!ctx) return

        // Convert CSS-space click position to canvas pixel coordinates
        const rect = canvas!.getBoundingClientRect()
        const scaleX = canvas!.width / rect.width
        const scaleY = canvas!.height / rect.height
        const x = Math.floor((e.clientX - rect.left) * scaleX)
        const y = Math.floor((e.clientY - rect.top) * scaleY)

        // Grab helpers attached to the DOM node
        const helpers = (
          canvas as HTMLCanvasElement & {
            __coloringHelpers?: { pushUndoSnapshot: () => void; markDirty: () => void }
          }
        ).__coloringHelpers
        helpers?.pushUndoSnapshot()

        const imageData = ctx.getImageData(0, 0, canvas!.width, canvas!.height)
        const rgb = hexToRgb(activeColorRef.current)
        floodFill(imageData, x, y, rgb)

        // Defer putImageData to keep the UI responsive
        requestAnimationFrame(() => {
          ctx.putImageData(imageData, 0, 0)
          helpers?.markDirty()
        })
      }

      canvas.addEventListener('click', handleClick)
      return () => {
        canvas.removeEventListener('click', handleClick)
      }
    }, []) // intentionally empty — reads activeColorRef.current at click time

    // -----------------------------------------------------------------------
    // Mount: load image and initialise canvas
    // -----------------------------------------------------------------------

    useEffect(() => {
      let cancelled = false

      async function init() {
        const canvas = canvasRef.current
        if (!canvas) return

        try {
          const img = await loadImage(imageUrl)
          if (cancelled) return

          // Store natural dimensions
          imageSizeRef.current = { width: img.naturalWidth, height: img.naturalHeight }

          // Set canvas resolution to match the image
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight

          // Apply responsive CSS sizing
          applyResponsiveSize(canvas)

          // Re-apply after a frame so the DOM has fully laid out
          requestAnimationFrame(() => applyResponsiveSize(canvas))

          // Store base image reference for reset
          baseImageRef.current = img

          const ctx = canvas.getContext('2d')
          if (!ctx) return

          // If there is a saved coloring state, restore it; otherwise draw base.
          if (coloringSave && coloringSave.length > 0) {
            const bytes = new Uint8Array(coloringSave)
            const blob = new Blob([bytes], { type: 'image/png' })
            const blobUrl = URL.createObjectURL(blob)
            try {
              const savedImg = await loadImage(blobUrl)
              if (cancelled) return
              ctx.drawImage(savedImg, 0, 0, canvas.width, canvas.height)
            } finally {
              URL.revokeObjectURL(blobUrl)
            }
          } else {
            drawBaseImage(ctx, img)
          }

          // Initialise undo stack (empty) and dirty flag (clean)
          undoStackRef.current = []
          clearDirty()
        } catch (err) {
          if (!cancelled) {
            console.error('[ColoringCanvas] Failed to load image:', err)
          }
        }
      }

      init()

      return () => {
        cancelled = true
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageUrl])

    // -----------------------------------------------------------------------
    // Responsive resize listener
    // -----------------------------------------------------------------------

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const observer = new ResizeObserver(() => {
        applyResponsiveSize(canvas)
      })

      if (containerRef.current) {
        observer.observe(containerRef.current)
      }

      return () => observer.disconnect()
    }, [applyResponsiveSize])

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <div
        ref={containerRef}
        className="w-full"
        aria-label="Coloring canvas"
      >
        <canvas
          ref={canvasRef}
          className="block w-full touch-none"
          aria-label="Coloring page"
          // width/height (pixel resolution) set programmatically after image load
          // CSS width overridden by applyResponsiveSize to match container
        />
        {/* Dirty indicator accessible to screen-readers */}
        <span className="sr-only" aria-live="polite">
          {isDirty ? 'Ada perubahan yang belum disimpan.' : ''}
        </span>
      </div>
    )
  },
)

ColoringCanvas.displayName = 'ColoringCanvas'

export default ColoringCanvas
