'use client'

import { useEffect, useRef, useState } from 'react'

type UseScrollAnimationOptions = {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isVisible }
}

// Hook pour animer plusieurs éléments avec stagger
export function useStaggerAnimation<T extends HTMLElement = HTMLDivElement>(
  itemCount: number,
  options: UseScrollAnimationOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options
  const containerRef = useRef<T>(null)
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(itemCount).fill(false))

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animer les items avec un délai progressif
          visibleItems.forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems((prev) => {
                const newState = [...prev]
                newState[index] = true
                return newState
              })
            }, index * 100)
          })
          if (triggerOnce) {
            observer.unobserve(container)
          }
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(container)

    return () => {
      observer.unobserve(container)
    }
  }, [threshold, rootMargin, triggerOnce, itemCount, visibleItems])

  return { containerRef, visibleItems }
}

