import { useState } from 'react'

type Props = {
  onSubmit: (handle: string) => void
  onDemo: () => void
  loading: boolean
  error: string | null
}

export function Gate({ onSubmit, onDemo, loading, error }: Props) {
  const [value, setValue] = useState('')

  return (
    <div className="gate">
      <div className="gate-card">
        <div className="eyebrow">Kiroween 2026 · Costume Contest</div>
        <h1>Necropolis</h1>
        <p className="tagline">
          Every developer has a graveyard of abandoned projects. Walk yours, read the autopsies, and decide what
          deserves to rise again.
        </p>

        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault()
            if (!loading) onSubmit(value)
          }}
        >
          <label htmlFor="handle" className="sr-only">
            GitHub handle
          </label>
          <input
            id="handle"
            name="handle"
            placeholder="GitHub handle, e.g. sindresorhus"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={loading}
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Digging…' : 'Enter'}
          </button>
        </form>

        <div className="alt">
          No handle handy?{' '}
          <button type="button" className="link-btn" onClick={onDemo} disabled={loading}>
            Walk the demo graveyard
          </button>
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="gate-foot">
          <span>Public GitHub data only</span>
          <span>Nothing is stored on a server</span>
          <span>Free, forever</span>
        </div>
      </div>
    </div>
  )
}
