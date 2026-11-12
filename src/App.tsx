import { useEffect, useMemo, useState } from 'react'
import { Gate } from './components/Gate'
import { Stage } from './components/Stage'
import { AutopsyPanel } from './components/AutopsyPanel'
import { ObituaryDialog } from './components/ObituaryDialog'
import { demoGraveyard, loadGraveyard, type LoadResult } from './lib/github'
import { DEMO_REPOS, DEMO_USER } from './lib/demo'
import { autopsy } from './lib/vitality'
import type { Repo } from './lib/types'

const HANDLE_KEY = 'necropolis:last-handle'

export function App() {
  const [result, setResult] = useState<LoadResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Repo | null>(null)
  const [obituaryOpen, setObituaryOpen] = useState(false)

  useEffect(() => {
    document.title = result ? `Necropolis — ${result.user}` : 'Necropolis — a graveyard for your dead side projects'
  }, [result])

  useEffect(() => {
    try {
      const last = localStorage.getItem(HANDLE_KEY)
      if (last) localStorage.setItem(HANDLE_KEY, last)
    } catch {
      /* ignore */
    }
  }, [])

  const enter = async (handle: string) => {
    setLoading(true)
    setError(null)
    try {
      const loaded = await loadGraveyard(handle)
      setResult(loaded)
      setSelected(null)
      try {
        localStorage.setItem(HANDLE_KEY, loaded.user)
      } catch {
        /* ignore */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const enterDemo = () => {
    setError(null)
    setResult(demoGraveyard())
    setSelected(null)
  }

  const selectedAutopsy = useMemo(() => (selected ? autopsy(selected) : null), [selected])

  const leave = () => {
    setResult(null)
    setSelected(null)
    setError(null)
  }

  return (
    <div className="app">
      <Stage
        repos={result?.repos ?? DEMO_REPOS}
        handle={result?.user ?? DEMO_USER}
        note={result?.note}
        preview={!result}
        selectedName={selected?.name ?? null}
        onSelect={(repo) => {
          setSelected(repo)
          setObituaryOpen(false)
        }}
        onLeave={leave}
      />

      {!result && <Gate onSubmit={enter} onDemo={enterDemo} loading={loading} error={error} />}

      {result && (
        <ul className="sr-only" aria-label="Graves">
          {result.repos.map((repo) => (
            <li key={repo.id}>
              <button onClick={() => setSelected(repo)}>{repo.name}</button>
            </li>
          ))}
        </ul>
      )}

      {result && selected && selectedAutopsy && (
        <AutopsyPanel
          repo={selected}
          autopsy={selectedAutopsy}
          onClose={() => setSelected(null)}
          onObituary={() => setObituaryOpen(true)}
        />
      )}

      {result && selected && selectedAutopsy && obituaryOpen && (
        <ObituaryDialog
          repo={selected}
          autopsy={selectedAutopsy}
          handle={result.user}
          onClose={() => setObituaryOpen(false)}
        />
      )}
    </div>
  )
}
