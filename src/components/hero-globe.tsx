'use client'

import { useEffect, useRef } from "react"

const CITIES: [string, number, number, boolean][] = [
  ["Luanda", -8.8, 13.2, true],
  ["Lagos", 6.5, 3.4, false],
  ["Joburg", -26.2, 28.0, false],
  ["Nairobi", -1.3, 36.8, false],
  ["Casablanca", 33.6, -7.6, false],
  ["Lisbon", 38.7, -9.1, false],
  ["London", 51.5, -0.1, false],
  ["Dubai", 25.2, 55.3, false],
  ["New York", 40.7, -74.0, false],
  ["São Paulo", -23.5, -46.6, false],
  ["Singapore", 1.3, 103.8, false],
  ["Tokyo", 35.7, 139.7, false],
  ["Sydney", -33.9, 151.2, false],
  ["Mumbai", 19.1, 72.9, false],
  ["Beijing", 39.9, 116.4, false],
  ["Los Angeles", 34.1, -118.2, false],
  ["Buenos Aires", -34.6, -58.4, false],
  ["Cairo", 30.1, 31.2, false],
  ["Istanbul", 41.0, 28.9, false],
  ["Moscow", 55.8, 37.6, false],
]

const CONNECTIONS: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8],
  [0, 9], [0, 10], [0, 13], [0, 17], [1, 2], [1, 3], [1, 4], [1, 17],
  [2, 3], [2, 4], [2, 17], [3, 7], [3, 13], [3, 17], [4, 5], [4, 6],
  [4, 17], [4, 18], [5, 17], [5, 18], [17, 7], [17, 18], [17, 13],
  [5, 6], [5, 7], [6, 7], [6, 8], [6, 14], [6, 18], [6, 19], [18, 19],
  [19, 7], [7, 13], [7, 10], [7, 14], [7, 18], [7, 19], [13, 10],
  [13, 14], [13, 18], [13, 19], [10, 11], [10, 12], [10, 14], [11, 12],
  [11, 14], [11, 15], [11, 8], [12, 9], [12, 15], [14, 19], [14, 11],
  [8, 9], [8, 15], [8, 16], [9, 15], [9, 16], [15, 16], [16, 0],
  [11, 8], [15, 14], [12, 8],
]

const toXYZ = (lat: number, lon: number): [number, number, number] => {
  const φ = (lat * Math.PI) / 180
  const λ = (lon * Math.PI) / 180

  return [
    Math.cos(φ) * Math.cos(λ),
    Math.sin(φ),
    Math.cos(φ) * Math.sin(λ),
  ]
}

const rotY = (
  [x, y, z]: [number, number, number],
  a: number
): [number, number, number] => [
  x * Math.cos(a) + z * Math.sin(a),
  y,
  -x * Math.sin(a) + z * Math.cos(a),
]

const rotX = (
  [x, y, z]: [number, number, number],
  a: number
): [number, number, number] => [
  x,
  y * Math.cos(a) - z * Math.sin(a),
  y * Math.sin(a) + z * Math.cos(a),
]

const proj = (
  p: [number, number, number],
  angleY: number,
  angleX: number,
  cx: number,
  cy: number,
  r: number
) => {
  const [rx, ry, rz] = rotY(rotX(p, angleX), angleY)

  return {
    sx: cx + rx * r,
    sy: cy - ry * r,
    d: rz,
  }
}

const slerp = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
  lift: number
): [number, number, number] => {
  const dot = Math.min(
    1,
    Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])
  )

  const ω = Math.acos(dot)

  let x, y, z

  if (ω < 1e-4) {
    x = a[0] + t * (b[0] - a[0])
    y = a[1] + t * (b[1] - a[1])
    z = a[2] + t * (b[2] - a[2])
  } else {
    const s0 = Math.sin((1 - t) * ω) / Math.sin(ω)
    const s1 = Math.sin(t * ω) / Math.sin(ω)

    x = s0 * a[0] + s1 * b[0]
    y = s0 * a[1] + s1 * b[1]
    z = s0 * a[2] + s1 * b[2]
  }

  const h = 1 + (lift - 1) * Math.sin(t * Math.PI)

  return [x * h, y * h, z * h]
}

const buildArc = (
  from: [number, number, number],
  to: [number, number, number],
  n = 72,
  lift = 1.26
): [number, number, number][] =>
  Array.from({ length: n + 1 }, (_, i) =>
    slerp(from, to, i / n, lift)
  )

const FRAME_MS = 1000 / 30

export default function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const rotRef = useRef(0.38)
  const rotXRef = useRef(0)
  const dragging = useRef(false)
  const lastX = useRef(0)
  const lastY = useRef(0)
  const velRef = useRef(0)
  const velYRef = useRef(0)
  const inViewRef = useRef(true)
  const lastPaintRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext("2d")

    if (!ctx) return

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const getSize = () => {
      if (window.innerWidth < 480) return Math.min(window.innerWidth - 32, 260)
      if (window.innerWidth < 768) return Math.min(window.innerWidth - 40, 340)
      return 660
    }

    let SIZE = getSize()

    const resizeCanvas = () => {
      SIZE = getSize()

      canvas.width = SIZE * dpr
      canvas.height = SIZE * dpr

      canvas.style.width = `${SIZE}px`
      canvas.style.height = `${SIZE}px`

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    resizeCanvas()

    const clampX = (v: number) => Math.max(-1.1, Math.min(1.1, v))

    const onMouseDown = (e: MouseEvent) => {
      dragging.current = true
      lastX.current = e.clientX
      lastY.current = e.clientY
      velRef.current = 0
      velYRef.current = 0
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return

      const dx = e.clientX - lastX.current
      const dy = e.clientY - lastY.current

      velRef.current = dx * 0.004
      velYRef.current = dy * 0.004

      rotRef.current += dx * 0.004
      rotXRef.current = clampX(rotXRef.current + dy * 0.004)

      lastX.current = e.clientX
      lastY.current = e.clientY
    }

    const onMouseUp = () => {
      dragging.current = false
    }

    const onTouchStart = (e: TouchEvent) => {
      dragging.current = true

      lastX.current = e.touches[0].clientX
      lastY.current = e.touches[0].clientY

      velRef.current = 0
      velYRef.current = 0
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return

      const dx = e.touches[0].clientX - lastX.current
      const dy = e.touches[0].clientY - lastY.current

      velRef.current = dx * 0.004
      velYRef.current = dy * 0.004

      rotRef.current += dx * 0.004
      rotXRef.current = clampX(rotXRef.current + dy * 0.004)

      lastX.current = e.touches[0].clientX
      lastY.current = e.touches[0].clientY
    }

    const onTouchEnd = () => {
      dragging.current = false
    }

    canvas.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)

    canvas.addEventListener("touchstart", onTouchStart, {
      passive: true,
    })

    window.addEventListener("touchmove", onTouchMove, {
      passive: true,
    })

    window.addEventListener("touchend", onTouchEnd)

    window.addEventListener("resize", resizeCanvas)

    const cityXYZ = CITIES.map(([, lat, lon]) => toXYZ(lat, lon))

    const arcPoints = CONNECTIONS.map(([i, j]) =>
      buildArc(cityXYZ[i], cityXYZ[j])
    )

    const packets = CONNECTIONS.map(() => [
      {
        t: Math.random(),
        speed: 0.0042 + Math.random() * 0.002,
      },
      {
        t: (Math.random() + 0.5) % 1,
        speed: 0.0033 + Math.random() * 0.002,
      },
    ])

    const drawFrame = () => {
      const cx = SIZE / 2
      const cy = SIZE / 2
      const r = SIZE * 0.37

      ctx.clearRect(0, 0, SIZE, SIZE)

      const atmo = ctx.createRadialGradient(
        cx,
        cy,
        r * 0.88,
        cx,
        cy,
        r * 1.32
      )

      atmo.addColorStop(0, "rgba(30,96,182,0.24)")
      atmo.addColorStop(0.55, "rgba(30,96,182,0.07)")
      atmo.addColorStop(1, "rgba(30,96,182,0)")

      ctx.fillStyle = atmo

      ctx.beginPath()
      ctx.arc(cx, cy, r * 1.32, 0, Math.PI * 2)
      ctx.fill()

      const base = ctx.createRadialGradient(
        cx - r * 0.3,
        cy - r * 0.28,
        r * 0.06,
        cx,
        cy,
        r
      )

      base.addColorStop(0, "#1e4882")
      base.addColorStop(0.38, "#0c1e3e")
      base.addColorStop(1, "#040c1a")

      ctx.fillStyle = base

      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()

      const spec = ctx.createRadialGradient(
        cx - r * 0.36,
        cy - r * 0.36,
        0,
        cx - r * 0.36,
        cy - r * 0.36,
        r * 0.58
      )

      spec.addColorStop(0, "rgba(255,255,255,0.09)")
      spec.addColorStop(1, "rgba(255,255,255,0)")

      ctx.fillStyle = spec

      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.save()

      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.clip()

      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath()

        let pen = false

        for (let lon = -180; lon <= 180; lon += 3) {
          const { sx, sy, d } = proj(
            toXYZ(lat, lon),
            rotRef.current,
            rotXRef.current,
            cx,
            cy,
            r
          )

          const a = Math.max(0, (d + 0.4) / 1.4) * 0.1

          ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`
          ctx.lineWidth = 0.6

          if (!pen) {
            ctx.moveTo(sx, sy)
            pen = true
          } else {
            ctx.lineTo(sx, sy)
          }
        }

        ctx.stroke()
      }

      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath()

        let pen = false

        for (let lat = -90; lat <= 90; lat += 3) {
          const { sx, sy, d } = proj(
            toXYZ(lat, lon),
            rotRef.current,
            rotXRef.current,
            cx,
            cy,
            r
          )

          const a = Math.max(0, (d + 0.4) / 1.4) * 0.1

          ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`
          ctx.lineWidth = 0.6

          if (!pen) {
            ctx.moveTo(sx, sy)
            pen = true
          } else {
            ctx.lineTo(sx, sy)
          }
        }

        ctx.stroke()
      }

      ctx.restore()

      arcPoints.forEach((pts, arcIdx) => {
        let drawing = false

        for (let i = 0; i < pts.length; i++) {
          const { sx, sy, d } = proj(
            pts[i],
            rotRef.current,
            rotXRef.current,
            cx,
            cy,
            r
          )

          if (d < -0.15) {
            drawing = false
            continue
          }

          const a = Math.max(0, (d + 0.6) / 1.6) * 0.55

          if (!drawing) {
            ctx.beginPath()
            ctx.moveTo(sx, sy)
            drawing = true
          } else {
            ctx.lineTo(sx, sy)
            ctx.strokeStyle = `rgba(30,96,182,${a.toFixed(3)})`
            ctx.lineWidth = window.innerWidth < 768 ? 0.8 : 1
            ctx.stroke()

            ctx.beginPath()
            ctx.moveTo(sx, sy)
          }
        }

        packets[arcIdx].forEach((pkt) => {
          pkt.t = (pkt.t + pkt.speed) % 1

          const idx = Math.min(
            pts.length - 1,
            Math.floor(pkt.t * pts.length)
          )

          const { sx, sy, d } = proj(
            pts[idx],
            rotRef.current,
            rotXRef.current,
            cx,
            cy,
            r
          )

          if (d < 0) return

          const a = Math.max(0, (d + 0.5) / 1.5)

          ctx.globalAlpha = a * 0.35
          ctx.fillStyle = "rgba(227,6,19,0.85)"

          ctx.beginPath()
          ctx.arc(sx, sy, window.innerWidth < 768 ? 5 : 7, 0, Math.PI * 2)
          ctx.fill()

          ctx.globalAlpha = a
          ctx.fillStyle = "rgba(255,110,90,0.95)"

          ctx.beginPath()
          ctx.arc(sx, sy, window.innerWidth < 768 ? 1.8 : 2.2, 0, Math.PI * 2)
          ctx.fill()

          ctx.globalAlpha = 1
        })
      })

      const now = Date.now()

      cityXYZ.forEach((xyz, i) => {
        const { sx, sy, d } = proj(
          xyz,
          rotRef.current,
          rotXRef.current,
          cx,
          cy,
          r
        )

        if (d < 0.05) return

        const a = Math.max(0, (d - 0.05) / 0.95)

        const [, , , isHub] = CITIES[i]

        if (isHub) {
          const pulse = (Math.sin(now * 0.003) + 1) / 2

          ;[
            window.innerWidth < 768 ? 6 + pulse * 8 : 8 + pulse * 10,
            window.innerWidth < 768 ? 4 + pulse * 4 : 5 + pulse * 5,
          ].forEach((rad, ri) => {
            ctx.beginPath()
            ctx.arc(sx, sy, rad, 0, Math.PI * 2)

            ctx.strokeStyle = `rgba(227,6,19,${(
              (0.5 - ri * 0.2) *
              a
            ).toFixed(3)})`

            ctx.lineWidth = 1
            ctx.stroke()
          })

          ctx.beginPath()
          ctx.arc(sx, sy, window.innerWidth < 768 ? 3 : 4, 0, Math.PI * 2)

          ctx.fillStyle = `rgba(227,6,19,${a.toFixed(3)})`
          ctx.fill()
        } else {
          ctx.fillStyle = `rgba(180,210,255,${(a * 0.22).toFixed(3)})`

          ctx.beginPath()
          ctx.arc(sx, sy, window.innerWidth < 768 ? 7 : 9, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = `rgba(220,235,255,${a.toFixed(3)})`

          ctx.beginPath()
          ctx.arc(sx, sy, window.innerWidth < 768 ? 1.5 : 2, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)

      ctx.strokeStyle = "rgba(30,96,182,0.35)"
      ctx.lineWidth = 1.2
      ctx.stroke()

      if (!dragging.current) {
        velRef.current *= 0.92
        velYRef.current *= 0.92

        if (Math.abs(velRef.current) > 0.0002) {
          rotRef.current += velRef.current
        } else {
          rotRef.current += window.innerWidth < 768 ? 0.0018 : 0.0025
        }

        if (Math.abs(velYRef.current) > 0.0002) {
          rotXRef.current = Math.max(
            -1.1,
            Math.min(1.1, rotXRef.current + velYRef.current)
          )
        }
      }
    }

    const cleanupListeners = () => {
      canvas.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)

      canvas.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)

      window.removeEventListener("resize", resizeCanvas)
    }

    const tick = (t: number) => {
      const visible = inViewRef.current && !document.hidden

      if (!visible) {
        animRef.current = 0
        return
      }

      if (t - lastPaintRef.current < FRAME_MS) {
        animRef.current = requestAnimationFrame(tick)
        return
      }

      lastPaintRef.current = t

      drawFrame()

      animRef.current = requestAnimationFrame(tick)
    }

    const startRAF = () => {
      if (animRef.current !== 0) return

      lastPaintRef.current = 0

      animRef.current = requestAnimationFrame(tick)
    }

    const stopRAF = () => {
      cancelAnimationFrame(animRef.current)
      animRef.current = 0
    }

    if (reducedMotion) {
      drawFrame()
      return cleanupListeners
    }

    const io = new IntersectionObserver(
      ([e]) => {
        inViewRef.current = e.isIntersecting

        if (inViewRef.current && !document.hidden) {
          startRAF()
        } else {
          stopRAF()
        }
      },
      {
        rootMargin: "120px",
        threshold: 0,
      }
    )

    io.observe(canvas)

    const onVis = () => {
      if (!document.hidden && inViewRef.current) {
        startRAF()
      } else {
        stopRAF()
      }
    }

    document.addEventListener("visibilitychange", onVis)

    inViewRef.current = true

    startRAF()

    return () => {
      io.disconnect()

      document.removeEventListener("visibilitychange", onVis)

      stopRAF()

      cleanupListeners()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="block w-full max-w-[260px] sm:max-w-[340px] md:max-w-[660px] h-auto cursor-grab active:cursor-grabbing touch-pan-y select-none"
    />
  )
}