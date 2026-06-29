'use client'

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"

interface CountUpProps {
  to: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
  className?: string
}

export function CountUp({
  to,
  duration = 1.8,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: "-30px" })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(parseFloat((to * eased).toFixed(decimals)))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, to, duration, decimals])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {decimals > 0 ? val.toFixed(decimals) : Math.round(val)}
      {suffix}
    </span>
  )
}
