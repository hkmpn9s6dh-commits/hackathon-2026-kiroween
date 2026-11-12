import { useEffect, useState } from 'react'
import { renderObituary } from '../lib/obituary'
import type { Autopsy, Repo } from '../lib/types'

type Props = {
  repo: Repo
  autopsy: Autopsy
  handle: string
  onClose: () => void
}

export function ObituaryDialog({ repo, autopsy, handle, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    const draw = () => {
      if (!alive) return
      try {
        setUrl(renderObituary(repo, autopsy, handle))
      } catch {
        setUrl(null)
      }
    }
    if (document.fonts?.ready) {
      document.fonts.ready.then(draw)
    } else {
      draw()
    }
    return () => {
      alive = false
    }
  }, [repo, autopsy, handle])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleCopyCaption = async () => {
    const liveUrl = window.location.origin || 'https://your-username.github.io/necropolis'
    const caption = `${repo.name}: ${autopsy.epitaph} — Walk the graveyard at ${liveUrl}`
    
    try {
      await navigator.clipboard.writeText(caption)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers or insecure contexts
      try {
        const textArea = document.createElement('textarea')
        textArea.value = caption
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackErr) {
        console.error('Failed to copy text:', fallbackErr)
      }
    }
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={`Obituary for ${repo.name}`}>
      <div className="modal-card">
        <div className="modal-head">
          <h2>The obituary</h2>
          <button className="link-btn" onClick={onClose}>
            Close
          </button>
        </div>
        {url ? (
          <img src={url} alt={`Obituary card for ${repo.name}`} />
        ) : (
          <div className="loading" style={{ position: 'relative', height: 240 }}>
            <span>Preparing the card</span>
          </div>
        )}
        <div className="modal-actions">
          {url && (
            <>
              <a className="btn btn-primary" href={url} download={`obituary-${repo.name}.png`}>
                Download the card
              </a>
              <button 
                className="btn btn-secondary" 
                onClick={handleCopyCaption}
                disabled={copied}
              >
                {copied ? 'Copied' : 'Copy caption'}
              </button>
            </>
          )}
          <button className="btn btn-ghost" onClick={onClose}>
            Back to the graveyard
          </button>
        </div>
      </div>
    </div>
  )
}
