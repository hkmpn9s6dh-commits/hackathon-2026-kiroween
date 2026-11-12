import type { Repo } from '../lib/types'
import { classify } from '../lib/vitality'

const VW = 1600
const VH = 900

type Grave = {
  repo: Repo
  x: number
  y: number
  scale: number
  tilt: number
  seed: number
  w: number
  h: number
}

type Camera = { x: number; y: number; zoom: number }

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export class GraveyardScene {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private graves: Grave[] = []
  private hovered: number | null = null
  private selected: number | null = null
  private cam: Camera = { x: VW / 2, y: VH / 2, zoom: 1 }
  private target: Camera = { x: VW / 2, y: VH / 2, zoom: 1 }
  private raf = 0
  private t0 = performance.now()
  private dpr = 1
  private w = 0
  private h = 0
  private embers: { x: number; y: number; vx: number; r: number; seed: number }[] = []
  private bg: HTMLCanvasElement | null = null
  private onHover?: (repo: Repo | null) => void
  private onSelect?: (repo: Repo | null) => void
  private pointer = { x: 0, y: 0 }
  private reduced = false

  constructor(
    canvas: HTMLCanvasElement,
    handlers: {
      onHover?: (repo: Repo | null) => void
      onSelect?: (repo: Repo | null) => void
    } = {},
  ) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('Canvas 2D is not available in this browser.')
    this.ctx = ctx
    this.onHover = handlers.onHover
    this.onSelect = handlers.onSelect
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.resize()
    window.addEventListener('resize', this.resize)
    canvas.addEventListener('pointermove', this.handleMove)
    canvas.addEventListener('pointerleave', this.handleLeave)
    canvas.addEventListener('click', this.handleClick)
    this.seedEmbers()
    this.loop()
  }

  setGraves(repos: Repo[]) {
    const sorted = [...repos].sort((a, b) => +new Date(a.pushedAt) - +new Date(b.pushedAt))
    const shares = [0.3, 0.35, 0.35]
    const counts = shares.map((s) => Math.max(1, Math.round(sorted.length * s)))
    while (counts.reduce((a, b) => a + b, 0) > sorted.length) {
      const i = counts.indexOf(Math.max(...counts))
      counts[i] -= 1
    }
    while (counts.reduce((a, b) => a + b, 0) < sorted.length) counts[counts.length - 1] += 1

    const rowY = [512, 648, 800]
    const rowScale = [0.8, 1.02, 1.3]
    const spread = 1140

    const graveList: Grave[] = []
    let index = 0

    counts.forEach((count, row) => {
      const step = count === 1 ? 0 : spread / (count - 1)
      for (let col = 0; col < count; col++) {
        const repo = sorted[index++]
        if (!repo) return
        const jitter = mulberry32(hash(repo.name) + row * 17)
        const baseX = count === 1 ? VW / 2 : VW / 2 - spread / 2 + step * col
        const x = Math.min(VW - 90, Math.max(90, baseX + (jitter() - 0.5) * 34))
        const y = rowY[row] + (jitter() - 0.5) * 12
        const scale = rowScale[row] * (0.93 + jitter() * 0.14)
        graveList.push({
          repo,
          x,
          y,
          scale,
          tilt: (jitter() - 0.5) * 0.05,
          seed: jitter() * 1e6,
          w: 72,
          h: 96,
        })
      }
    })

    this.graves = graveList
    this.selected = null
    this.hovered = null
    this.target = { x: VW / 2, y: VH / 2, zoom: 1 }
  }

  select(name: string | null) {
    if (!name) {
      this.selected = null
      this.target = { x: VW / 2, y: 520, zoom: 1.02 }
      return
    }
    const i = this.graves.findIndex((g) => g.repo.name === name)
    if (i < 0) return
    this.selected = i
    const g = this.graves[i]
    this.target = { x: g.x + 150, y: g.y - 50, zoom: 1.45 }
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.resize)
    this.canvas.removeEventListener('pointermove', this.handleMove)
    this.canvas.removeEventListener('pointerleave', this.handleLeave)
    this.canvas.removeEventListener('click', this.handleClick)
  }

  private resize = () => {
    const rect = this.canvas.getBoundingClientRect()
    this.dpr = Math.min(2, window.devicePixelRatio || 1)
    this.w = rect.width
    this.h = rect.height
    this.canvas.width = Math.round(rect.width * this.dpr)
    this.canvas.height = Math.round(rect.height * this.dpr)
    this.bg = this.paintBackground()
  }

  private handleMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect()
    this.pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const hit = this.hitTest(this.pointer.x, this.pointer.y)
    if (hit !== this.hovered) {
      this.hovered = hit
      this.onHover?.(hit === null ? null : this.graves[hit].repo)
      this.canvas.style.cursor = hit === null ? 'default' : 'pointer'
    }
  }

  private handleLeave = () => {
    this.hovered = null
    this.onHover?.(null)
    this.canvas.style.cursor = 'default'
  }

  private handleClick = () => {
    if (this.hovered === null) {
      this.selected = null
      this.target = { x: VW / 2, y: VH / 2, zoom: 1 }
      this.onSelect?.(null)
      return
    }
    const g = this.graves[this.hovered]
    this.selected = this.hovered
    this.target = { x: g.x + 150, y: g.y - 50, zoom: 1.45 }
    this.onSelect?.(g.repo)
  }

  private toVirtual(sx: number, sy: number) {
    const s = Math.min(this.w / VW, this.h / VH)
    const z = s * this.cam.zoom
    return { x: (sx - this.w / 2) / z + this.cam.x, y: (sy - this.h / 2) / z + this.cam.y }
  }

  private hitTest(sx: number, sy: number): number | null {
    const p = this.toVirtual(sx, sy)
    for (let i = this.graves.length - 1; i >= 0; i--) {
      const g = this.graves[i]
      const halfW = (g.w * g.scale) / 2 + 10
      const top = g.y - g.h * g.scale
      if (p.x > g.x - halfW && p.x < g.x + halfW && p.y > top && p.y < g.y + 10) return i
    }
    return null
  }

  private seedEmbers() {
    const rnd = mulberry32(7)
    this.embers = Array.from({ length: 56 }, () => ({
      x: rnd() * VW,
      y: 520 + rnd() * 340,
      vx: (rnd() - 0.5) * 6,
      r: 0.6 + rnd() * 1.8,
      seed: rnd() * 10,
    }))
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    const now = performance.now()
    const t = (now - this.t0) / 1000

    if (!this.reduced) {
      this.cam.x += (this.target.x - this.cam.x) * 0.08
      this.cam.y += (this.target.y - this.cam.y) * 0.08
      this.cam.zoom += (this.target.zoom - this.cam.zoom) * 0.08
    } else {
      this.cam = { ...this.target }
    }

    this.draw(t)
  }

  private paintBackground(): HTMLCanvasElement {
    const off = document.createElement('canvas')
    off.width = Math.max(1, Math.round(this.w * this.dpr))
    off.height = Math.max(1, Math.round(this.h * this.dpr))
    const c = off.getContext('2d')
    if (!c) return off
    c.scale(this.dpr, this.dpr)
    const W = this.w
    const H = this.h
    const s = Math.min(W / VW, H / VH)
    const ox = (W - VW * s) / 2
    const oy = (H - VH * s) / 2

    c.fillStyle = '#05070d'
    c.fillRect(0, 0, W, H)
    c.save()
    c.translate(ox, oy)
    c.scale(s, s)

    const sky = c.createLinearGradient(0, 0, 0, 540)
    sky.addColorStop(0, '#060810')
    sky.addColorStop(0.5, '#0a111d')
    sky.addColorStop(1, '#16202e')
    c.fillStyle = sky
    c.fillRect(0, 0, VW, 560)

    const rnd = mulberry32(99)
    for (let i = 0; i < 190; i++) {
      const x = rnd() * VW
      const y = rnd() * 420
      c.fillStyle = `rgba(214,226,255,${(0.10 + rnd() * 0.55).toFixed(3)})`
      c.fillRect(x, y, 1.3, 1.3)
    }

    const moonX = 1176
    const moonY = 186
    const halo = c.createRadialGradient(moonX, moonY, 40, moonX, moonY, 380)
    halo.addColorStop(0, 'rgba(206,222,255,0.22)')
    halo.addColorStop(0.45, 'rgba(170,195,240,0.08)')
    halo.addColorStop(1, 'rgba(120,150,200,0)')
    c.fillStyle = halo
    c.fillRect(0, 0, VW, 720)

    const moon = c.createRadialGradient(moonX - 30, moonY - 36, 12, moonX, moonY, 118)
    moon.addColorStop(0, '#f6f2e3')
    moon.addColorStop(0.68, '#ded9c6')
    moon.addColorStop(1, '#b6b19c')
    c.fillStyle = moon
    c.beginPath()
    c.arc(moonX, moonY, 110, 0, Math.PI * 2)
    c.fill()

    const crater = mulberry32(4242)
    for (let i = 0; i < 16; i++) {
      const a = crater() * Math.PI * 2
      const r = Math.sqrt(crater()) * 92
      c.fillStyle = `rgba(150,146,128,${(0.08 + crater() * 0.14).toFixed(3)})`
      c.beginPath()
      c.arc(moonX + Math.cos(a) * r, moonY + Math.sin(a) * r, 4 + crater() * 15, 0, Math.PI * 2)
      c.fill()
    }

    // distant ridge + treeline
    c.fillStyle = 'rgba(9,13,19,0.9)'
    c.beginPath()
    c.moveTo(0, 512)
    c.bezierCurveTo(220, 470, 380, 505, 560, 486)
    c.bezierCurveTo(760, 464, 980, 500, 1180, 480)
    c.bezierCurveTo(1360, 462, 1490, 490, VW, 472)
    c.lineTo(VW, 620)
    c.lineTo(0, 620)
    c.closePath()
    c.fill()

    // soft treeline: overlapping crowns, not spikes
    const tree = mulberry32(808)
    c.fillStyle = 'rgba(6,9,14,0.92)'
    c.beginPath()
    c.moveTo(0, 512)
    for (let x = 0; x <= VW; x += 24) {
      const crown = 500 - 26 - tree() * 34
      c.lineTo(x, crown)
    }
    c.lineTo(VW, 560)
    c.lineTo(0, 560)
    c.closePath()
    c.fill()

    // low stone wall at the back of the yard
    c.fillStyle = 'rgba(16,19,24,0.95)'
    c.fillRect(0, 514, VW, 16)
    c.fillStyle = 'rgba(28,33,40,0.85)'
    for (let x = 0; x < VW; x += 34) {
      c.fillRect(x, 510, 26, 5)
    }
    c.fillStyle = 'rgba(0,0,0,0.4)'
    c.fillRect(0, 528, VW, 4)

    const ground = c.createLinearGradient(0, 520, 0, VH)
    ground.addColorStop(0, '#0d131b')
    ground.addColorStop(0.35, '#0a0e14')
    ground.addColorStop(1, '#05070b')
    c.fillStyle = ground
    c.fillRect(0, 520, VW, VH - 520)

    // path
    const path = c.createLinearGradient(0, 560, 0, VH)
    path.addColorStop(0, 'rgba(150,160,175,0.028)')
    path.addColorStop(1, 'rgba(150,160,175,0.008)')
    c.fillStyle = path
    c.beginPath()
    c.moveTo(720, 540)
    c.lineTo(880, 540)
    c.lineTo(1010, VH)
    c.lineTo(590, VH)
    c.closePath()
    c.fill()

    c.strokeStyle = 'rgba(150,175,210,0.04)'
    c.lineWidth = 2
    for (let i = 0; i < 10; i++) {
      const y = 560 + i * 34
      c.beginPath()
      c.moveTo(0, y)
      c.bezierCurveTo(400, y - 7, 900, y + 7, VW, y - 3)
      c.stroke()
    }

    // grass tufts
    const grass = mulberry32(313)
    c.strokeStyle = 'rgba(90,110,86,0.28)'
    c.lineWidth = 1.2
    for (let i = 0; i < 220; i++) {
      const x = grass() * VW
      const y = 545 + grass() * 340
      const hh = 3 + grass() * 7
      c.beginPath()
      c.moveTo(x, y)
      c.lineTo(x + (grass() - 0.5) * 4, y - hh)
      c.stroke()
    }

    c.restore()
    return off
  }

  private draw(t: number) {
    const { ctx, w, h } = this
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.fillStyle = '#05070d'
    ctx.fillRect(0, 0, w, h)

    if (this.bg) ctx.drawImage(this.bg, 0, 0, w, h)

    const s = Math.min(w / VW, h / VH)
    const z = s * this.cam.zoom
    const ox = w / 2 - this.cam.x * z
    const oy = h / 2 - this.cam.y * z

    ctx.save()
    ctx.translate(ox, oy)
    ctx.scale(z, z)

    this.drawClouds(t)
    this.drawFog(t, 0.6)
    this.graves.forEach((g, i) => this.drawGrave(g, i, t))
    this.drawFog(t, 1)
    this.drawEmbers(t)
    this.drawVignette()

    ctx.restore()
  }

  private drawClouds(t: number) {
    const c = this.ctx
    c.save()
    c.globalCompositeOperation = 'screen'
    for (let i = 0; i < 4; i++) {
      const y = 120 + i * 74
      const x = ((t * (6 + i * 3) + i * 380) % (VW + 700)) - 350
      const g = c.createRadialGradient(x, y, 20, x, y, 300)
      g.addColorStop(0, 'rgba(120,145,180,0.045)')
      g.addColorStop(1, 'rgba(120,145,180,0)')
      c.fillStyle = g
      c.beginPath()
      c.ellipse(x, y, 300, 34, 0, 0, Math.PI * 2)
      c.fill()
    }
    c.restore()
  }

  private drawFog(t: number, layer: number) {
    const c = this.ctx
    c.save()
    c.globalCompositeOperation = 'screen'
    for (let i = 0; i < 5; i++) {
      const y = 560 + i * 64 + layer * 10
      const drift = ((t * (5 + i * 1.8) + i * 280) % (VW + 700)) - 350
      const grad = c.createRadialGradient(drift, y, 20, drift, y, 360)
      grad.addColorStop(0, `rgba(150,180,220,${(0.06 * layer).toFixed(3)})`)
      grad.addColorStop(1, 'rgba(150,180,220,0)')
      c.fillStyle = grad
      c.beginPath()
      c.ellipse(drift, y, 380, 50, 0, 0, Math.PI * 2)
      c.fill()
      const drift2 = VW - drift
      c.beginPath()
      c.ellipse(drift2, y + 26, 300, 40, 0, 0, Math.PI * 2)
      c.fill()
    }
    c.restore()
  }

  private drawGrave(g: Grave, i: number, t: number) {
    const c = this.ctx
    const state = classify(g.repo)
    const hover = this.hovered === i
    const selected = this.selected === i
    const scale = g.scale * (hover ? 1.04 : 1) * (selected ? 1.06 : 1)
    const W = g.w
    const H = g.h

    c.save()
    c.translate(g.x, g.y)
    c.rotate(g.tilt)
    c.scale(scale, scale)

    const soil = c.createRadialGradient(0, 2, 4, 0, 2, 52)
    soil.addColorStop(0, 'rgba(0,0,0,0.6)')
    soil.addColorStop(1, 'rgba(0,0,0,0)')
    c.fillStyle = soil
    c.beginPath()
    c.ellipse(0, 3, 54, 13, 0, 0, Math.PI * 2)
    c.fill()

    if (hover || selected) {
      const halo = c.createRadialGradient(0, -H / 2, 6, 0, -H / 2, 120)
      halo.addColorStop(0, selected ? 'rgba(232,163,61,0.26)' : 'rgba(232,163,61,0.16)')
      halo.addColorStop(1, 'rgba(232,163,61,0)')
      c.fillStyle = halo
      c.fillRect(-130, -H - 70, 260, 190)
    }

    const shadow = c.createLinearGradient(W / 2 - 6, 0, W / 2 + 26, 0)
    shadow.addColorStop(0, 'rgba(0,0,0,0.5)')
    shadow.addColorStop(1, 'rgba(0,0,0,0)')
    c.fillStyle = shadow
    c.beginPath()
    c.moveTo(W / 2 - 4, 0)
    c.lineTo(W / 2 + 26, 10)
    c.lineTo(W / 2 + 26, 30)
    c.lineTo(W / 2 - 4, 6)
    c.closePath()
    c.fill()

    const body = c.createLinearGradient(-W / 2, 0, W / 2, 0)
    body.addColorStop(0, '#464a4f')
    body.addColorStop(0.28, '#2b3036')
    body.addColorStop(0.75, '#1a1e23')
    body.addColorStop(1, '#0d1014')
    c.fillStyle = body
    c.beginPath()
    const shape = Math.floor(mulberry32(Math.floor(g.seed) + 5)() * 3)
    if (shape === 1) {
      c.moveTo(-W / 2, 0)
      c.lineTo(-W / 2, -H + 34)
      c.quadraticCurveTo(-W / 2 + 2, -H + 16, -W / 2 + 10, -H + 10)
      c.quadraticCurveTo(-2, -H - 6, 0, -H - 8)
      c.quadraticCurveTo(2, -H - 6, W / 2 - 10, -H + 10)
      c.quadraticCurveTo(W / 2 - 2, -H + 16, W / 2, -H + 34)
      c.lineTo(W / 2, 0)
      c.closePath()
    } else if (shape === 2) {
      c.moveTo(-W / 2, 0)
      c.lineTo(-W / 2, -H + 24)
      c.quadraticCurveTo(-W / 2, -H, 0, -H)
      c.quadraticCurveTo(W / 2, -H, W / 2, -H + 24)
      c.lineTo(W / 2, 0)
      c.closePath()
      c.moveTo(-3.2, -H + 6)
      c.lineTo(3.2, -H + 6)
      c.lineTo(3.2, -H - 12)
      c.lineTo(9, -H - 12)
      c.lineTo(9, -H - 18)
      c.lineTo(3.2, -H - 18)
      c.lineTo(3.2, -H - 26)
      c.lineTo(-3.2, -H - 26)
      c.lineTo(-3.2, -H - 18)
      c.lineTo(-9, -H - 18)
      c.lineTo(-9, -H - 12)
      c.lineTo(-3.2, -H - 12)
      c.closePath()
    } else {
      c.moveTo(-W / 2, 0)
      c.lineTo(-W / 2, -H + 24)
      c.quadraticCurveTo(-W / 2, -H, 0, -H)
      c.quadraticCurveTo(W / 2, -H, W / 2, -H + 24)
      c.lineTo(W / 2, 0)
      c.closePath()
    }
    c.fill()

    c.strokeStyle = selected ? 'rgba(232,163,61,0.9)' : hover ? 'rgba(232,163,61,0.6)' : 'rgba(205,218,236,0.13)'
    c.lineWidth = selected || hover ? 1.8 : 1
    c.stroke()

    // moonlit top edge
    c.strokeStyle = 'rgba(226,236,252,0.22)'
    c.lineWidth = 1.1
    c.beginPath()
    c.moveTo(-W / 2 + 2, -H + 26)
    c.quadraticCurveTo(-W / 2 + 2, -H + 2, 0, -H + 2)
    c.quadraticCurveTo(W / 2 - 2, -H + 2, W / 2 - 2, -H + 26)
    c.stroke()

    c.strokeStyle = 'rgba(200,220,255,0.12)'
    c.lineWidth = 1.3
    c.beginPath()
    c.moveTo(-W / 2 + 6, -8)
    c.lineTo(-W / 2 + 6, -H + 26)
    c.stroke()

    const rnd = mulberry32(Math.floor(g.seed))
    c.strokeStyle = 'rgba(0,0,0,0.35)'
    c.lineWidth = 0.8
    for (let k = 0; k < 2; k++) {
      const sx = -W / 2 + 14 + rnd() * (W - 28)
      const sy = -H + 32 + rnd() * 34
      c.beginPath()
      c.moveTo(sx, sy)
      c.lineTo(sx + (rnd() - 0.5) * 12, sy + 9 + rnd() * 9)
      c.stroke()
    }

    c.fillStyle = 'rgba(74,102,66,0.55)'
    for (let k = 0; k < 3; k++) {
      const mx = -W / 2 + 8 + rnd() * (W - 16)
      c.beginPath()
      c.ellipse(mx, -3 - rnd() * 4, 6 + rnd() * 6, 2.6, 0, 0, Math.PI * 2)
      c.fill()
    }

    const label = g.repo.name.replace(/[-_]/g, ' ').toUpperCase()
    const size = label.length > 14 ? 10.4 : label.length > 10 ? 12 : 13.6
    c.textAlign = 'center'
    c.fillStyle = 'rgba(0,0,0,0.55)'
    c.font = `600 ${size}px "Cormorant Garamond", Georgia, serif`
    const shown = label.length > 19 ? `${label.slice(0, 18)}…` : label
    c.fillText(shown, 0.6, -H + 40.6, W - 10)
    c.fillStyle = state === 'alive' ? '#f6eed6' : '#e0d9c6'
    c.font = `600 ${size}px "Cormorant Garamond", Georgia, serif`
    c.fillText(shown, 0, -H + 40, W - 10)

    c.fillStyle = 'rgba(214,208,190,0.62)'
    c.font = '500 7.4px "Plus Jakarta Sans", system-ui, sans-serif'
    const born = new Date(g.repo.createdAt).getFullYear()
    const last = new Date(g.repo.pushedAt).getFullYear()
    c.fillText(`${born} — ${last}`, 0, -H + 50)

    c.strokeStyle = 'rgba(200,196,180,0.26)'
    c.lineWidth = 0.7
    c.beginPath()
    c.moveTo(-12, -H + 56)
    c.lineTo(12, -H + 56)
    c.stroke()

    if (state === 'alive' || state === 'fading') {
      const flick = 0.85 + Math.sin(t * 9 + g.seed) * 0.12 + Math.sin(t * 23 + g.seed) * 0.05
      c.fillStyle = 'rgba(232,163,61,0.12)'
      c.beginPath()
      c.arc(0, -12, 8 * flick, 0, Math.PI * 2)
      c.fill()
      c.fillStyle = '#e8c48a'
      c.fillRect(-1.8, -9, 3.6, 7)
      const flame = c.createRadialGradient(0, -13, 0.4, 0, -13, 4.8)
      flame.addColorStop(0, '#fff2c8')
      flame.addColorStop(0.6, '#f2b45a')
      flame.addColorStop(1, 'rgba(232,163,61,0)')
      c.fillStyle = flame
      c.beginPath()
      c.ellipse(0, -14 * flick, 2.4, 5 * flick, 0, 0, Math.PI * 2)
      c.fill()
    }

    if (state === 'entombed') {
      c.strokeStyle = 'rgba(160,170,185,0.55)'
      c.lineWidth = 1.6
      c.beginPath()
      c.moveTo(-W / 2 + 4, -7)
      c.lineTo(W / 2 - 4, -H + 12)
      c.stroke()
    }

    c.restore()
  }

  private drawEmbers(t: number) {
    const c = this.ctx
    c.save()
    c.globalCompositeOperation = 'screen'
    for (const e of this.embers) {
      const y = ((e.y + t * 8) % (VH - 480)) + 480
      const x = e.x + Math.sin(t * 0.5 + e.seed) * 20
      const a = 0.08 + 0.1 * Math.sin(t * 2 + e.seed)
      c.fillStyle = `rgba(232,180,110,${Math.max(0, a).toFixed(3)})`
      c.beginPath()
      c.arc(x, y, e.r, 0, Math.PI * 2)
      c.fill()
    }
    c.restore()
  }

  private drawVignette() {
    const c = this.ctx
    const g = c.createRadialGradient(VW / 2, 640, 260, VW / 2, 640, 900)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.6)')
    c.fillStyle = g
    c.fillRect(0, 0, VW, VH)
  }
}
