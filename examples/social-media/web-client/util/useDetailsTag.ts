import { useEffect, useState } from 'react'

/**
 * Expands or collapses HTML Details tag on screen size changes.
 */
export const useDetailsTag = ({ breakpointPx }: { breakpointPx: number }) => {
  // Initialize state based on current window width
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= breakpointPx
    }
    return true // Default for SSR
  })

  useEffect(() => {
    const handleResize = () => {
      // Automatically close if screen shrinks below breakpoint
      if (window.innerWidth < breakpointPx) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)

    // Clean up listener on unmount
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpointPx])

  // Call to handle manual user toggles
  const handleToggle = (e: React.ToggleEvent<HTMLDetailsElement>) => {
    setIsOpen(e.currentTarget.open)
  }

  return {
    isOpen,
    handleToggle,
  }
}
