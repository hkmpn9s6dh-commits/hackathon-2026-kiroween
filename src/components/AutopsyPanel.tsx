import { useEffect } from 'react'
import type { Autopsy as AutopsyType, Repo } from '../lib/types'
import { yearsLine } from '../lib/vitality'

type Props = {
  repo: Repo
  autopsy: AutopsyType
  onClose: () => void
  onObituary: () => void
}

export function AutopsyPanel({ repo, autopsy, onClose, onObituary }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <aside className="panel" aria-label={`Autopsy of ${repo.name}`}>
      <button className="panel-close" onClick={onClose} aria-label="Close autopsy">
        ×
      </button>

      <div className="state">
        <span
          className="swatch"
          style={{ background: autopsy.state === 'alive' ? '#e8c48a' : 'rgba(232,226,210,0.45)' }}
          aria-hidden="true"
        />
        {autopsy.stateLabel}
      </div>

      <h2>{repo.name}</h2>
      <div className="years">{yearsLine(repo)}</div>

      <blockquote className="epitaph">“{autopsy.epitaph}”</blockquote>

      <div className="section">
        <h3>Cause of death</h3>
        <p>{autopsy.cause}</p>
      </div>

      <div className="section">
        <h3>Vital signs</h3>
        <div className="vitals">
          {autopsy.vitals.map((v) => (
            <div className="vital" key={v.label}>
              <div className="k">{v.label}</div>
              <div className="v">{v.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>Revival odds</h3>
        <div className="revival">
          <div className="num">{autopsy.revival}</div>
          <div style={{ flex: 1 }}>
            <div className="bar">
              <span style={{ width: `${autopsy.revival}%` }} />
            </div>
            <div className="caption">
              {autopsy.revival >= 70
                ? 'Worth a weekend. It still has a pulse.'
                : autopsy.revival >= 40
                  ? 'A coin toss. Set a two-hour budget, not a roadmap.'
                  : 'Let it rest, or bury it properly with a README.'}
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h3>How to raise it</h3>
        <ol className="plan">
          {autopsy.plan.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="panel-actions">
        <button className="btn btn-primary" onClick={onObituary}>
          Write the obituary
        </button>
        <a className="btn btn-ghost" href={repo.url} target="_blank" rel="noreferrer noopener">
          Open on GitHub
        </a>
      </div>
    </aside>
  )
}
