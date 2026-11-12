import type { Autopsy, Repo } from './types'

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

export function renderObituary(repo: Repo, autopsy: Autopsy, handle: string): string {
  const W = 1200
  const H = 630
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D unavailable')

  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#070a12')
  bg.addColorStop(0.6, '#0b1018')
  bg.addColorStop(1, '#05070d')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const halo = ctx.createRadialGradient(880, 120, 10, 880, 120, 420)
  halo.addColorStop(0, 'rgba(206,222,255,0.16)')
  halo.addColorStop(1, 'rgba(120,150,200,0)')
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(222,219,200,0.9)'
  ctx.beginPath()
  ctx.arc(980, 118, 62, 0, Math.PI * 2)
  ctx.fill()

  const fog = ctx.createLinearGradient(0, 430, 0, H)
  fog.addColorStop(0, 'rgba(150,180,220,0)')
  fog.addColorStop(0.5, 'rgba(150,180,220,0.07)')
  fog.addColorStop(1, 'rgba(150,180,220,0)')
  ctx.fillStyle = fog
  ctx.fillRect(0, 380, W, 250)

  ctx.save()
  ctx.translate(300, 500)
  const stone = ctx.createLinearGradient(-150, 0, 150, 0)
  stone.addColorStop(0, '#2b333f')
  stone.addColorStop(0.4, '#1a212b')
  stone.addColorStop(1, '#0e131a')
  ctx.fillStyle = stone
  ctx.beginPath()
  ctx.moveTo(-150, 0)
  ctx.lineTo(-150, -230)
  ctx.quadraticCurveTo(-150, -330, 0, -330)
  ctx.quadraticCurveTo(150, -330, 150, -230)
  ctx.lineTo(150, 0)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(180,200,230,0.28)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.beginPath()
  ctx.ellipse(0, 8, 200, 26, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.textAlign = 'center'
  ctx.fillStyle = '#e8e2d2'
  ctx.font = '600 34px "Cormorant Garamond", Georgia, serif'
  const name = repo.name.replace(/[-_]/g, ' ').toUpperCase()
  ctx.fillText(name.length > 18 ? `${name.slice(0, 17)}…` : name, 0, -244, 250)

  ctx.fillStyle = 'rgba(232,226,210,0.6)'
  ctx.font = '500 15px "Plus Jakarta Sans", system-ui, sans-serif'
  const born = new Date(repo.createdAt).getFullYear()
  const last = new Date(repo.pushedAt).getFullYear()
  ctx.fillText(`${born} — ${last}`, 0, -216)

  ctx.strokeStyle = 'rgba(232,226,210,0.25)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(-42, -198)
  ctx.lineTo(42, -198)
  ctx.stroke()

  ctx.fillStyle = 'rgba(232,226,210,0.72)'
  ctx.font = 'italic 500 19px "Cormorant Garamond", Georgia, serif'
  const epi = wrap(ctx, autopsy.epitaph, 210)
  epi.slice(0, 3).forEach((line, i) => ctx.fillText(line, 0, -168 + i * 24))
  ctx.restore()

  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(232,226,210,0.55)'
  ctx.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif'
  ctx.letterSpacing = '3px'
  ctx.fillText('NECROPOLIS', 560, 120)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = '#e8e2d2'
  ctx.font = '600 54px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(repo.name, 560, 178, 560)

  ctx.fillStyle = 'rgba(232,226,210,0.62)'
  ctx.font = '400 20px "Plus Jakarta Sans", system-ui, sans-serif'
  const desc = repo.description ?? 'No description. It never said what it was for.'
  wrap(ctx, desc, 540)
    .slice(0, 2)
    .forEach((line, i) => ctx.fillText(line, 560, 220 + i * 30))

  ctx.strokeStyle = 'rgba(232,226,210,0.16)'
  ctx.beginPath()
  ctx.moveTo(560, 300)
  ctx.lineTo(1120, 300)
  ctx.stroke()

  const stats: [string, string][] = [
    [autopsy.stateLabel.toUpperCase(), 'STATE'],
    [`${autopsy.revival} / 100`, 'REVIVAL ODDS'],
    [autopsy.daysSince === 0 ? 'today' : `${autopsy.daysSince.toLocaleString()} d`, 'SINCE LAST SIGN'],
    [repo.stars.toLocaleString(), 'STARS'],
  ]
  stats.forEach(([value, label], i) => {
    const x = 560 + (i % 2) * 290
    const y = 348 + Math.floor(i / 2) * 92
    ctx.fillStyle = '#e8e2d2'
    ctx.font = '600 30px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(value, x, y)
    ctx.fillStyle = 'rgba(232,226,210,0.45)'
    ctx.font = '600 11px "Plus Jakarta Sans", system-ui, sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText(label, x, y + 20)
    ctx.letterSpacing = '0px'
  })

  ctx.fillStyle = 'rgba(232,163,61,0.9)'
  ctx.font = '500 16px "Plus Jakarta Sans", system-ui, sans-serif'
  ctx.fillText(`github.com/${handle}`, 560, 560)

  ctx.fillStyle = 'rgba(232,226,210,0.35)'
  ctx.font = '400 13px "Plus Jakarta Sans", system-ui, sans-serif'
  ctx.fillText('A graveyard for dead side projects. Walk yours at Necropolis.', 560, 592)

  return c.toDataURL('image/png')
}
