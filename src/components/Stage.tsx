import { useEffect, useRef, useState } from 'react'
import type { Repo } from '../lib/types'
import { GraveyardScene } from '../scene/graveyard'
import { classify } from '../lib/vitality'

type Props = {
  repos: Repo[]
  handle: string
  note?: string
  onSelect: (repo: Repo | null) => void
  onLeave: () => void
  selectedName: string | null
  preview?: boolean
}

const LEGEND: { label: string; color: string }[] = [
  { label: 'Still breathing', color: '#e8c48a' },
  { label: 'Fading', color: '#b7a98a' },
  { label: 'Dormant', color: '#7f8a78' },
  { label: 'Buried', color: '#5f7086' },
  { label: 'Forgotten', color: '#4a5464' },
  { label: 'Entombed', color: '#8b8f98' },
]

export function Stage({ repos, handle, note, onSelect, onLeave, selectedName, preview = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sceneRef = useRef<GraveyardScene | null>(null)
  const [hovered, setHovered] = useState<Repo | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scene = new GraveyardScene(canvas, {
      onHover: setHovered,
      onSelect,
    })
    sceneRef.current = scene
    return () => {
      scene.destroy()
      sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    sceneRef.current?.setGraves(repos)
  }, [repos])

  useEffect(() => {
    sceneRef.current?.select(selectedName)
  }, [selectedName])

  const isEmpty = repos.length === 0 && !preview

  return (
    <div className={preview ? 'stage stage-preview' : 'stage'}>
      <canvas ref={canvasRef} aria-label="A graveyard of abandoned repositories. The same graves are listed as buttons after this canvas." />

      {!preview && (
      <div className="hud">
        <div className="wordmark">
          <span className="mark">NECROPOLIS</span>
          <span className="sub">a graveyard for dead side projects</span>
        </div>
        <div className="hud-right">
          {!selectedName && !isEmpty && (
            <span className="chip">
              walking <strong>{handle}</strong> · {repos.length} graves
            </span>
          )}
          <button className="link-btn" onClick={onLeave}>
            Change graveyard
          </button>
        </div>
      </div>
      )}

      {isEmpty ? (
        <div className="empty-yard">
          <div className="empty-card">
            <div className="empty-title">No graves for <strong>{handle}</strong></div>
            <p className="empty-text">
              This GitHub account has no public repositories that aren't forks.
              The graveyard is quiet.
            </p>
            <button className="btn btn-primary" onClick={onLeave}>
              Return to the gate
            </button>
          </div>
        </div>
      ) : (
        <>
          {!preview && (
          <div className="legend" aria-hidden="true">
            {LEGEND.map((l) => (
              <div className="row" key={l.label}>
                <span className="swatch" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
          )}

          {!preview && hovered && (
            <div className="hover-card">
              <div className="name">{hovered.name}</div>
              <div className="meta">
                {classify(hovered) === 'alive' ? 'still breathing' : 'last sign of life'} ·{' '}
                {new Date(hovered.pushedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}
              </div>
            </div>
          )}

          {!preview && <div className="hint">Click a grave to read its autopsy</div>}

          {!preview && note && <div className="demo-note">{note}</div>}
        </>
      )}
    </div>
  )
}
