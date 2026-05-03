import { type FormEvent, useEffect, useId, useState } from 'react'
import type { Severity } from '../SeverityBadge'

type NewCaseModalProps = {
  open: boolean
  onClose: () => void
}

const SEVERITY_OPTIONS: { value: Severity; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export function NewCaseModal({ open, onClose }: NewCaseModalProps) {
  const titleId = useId()
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState<Severity>('medium')
  const [summary, setSummary] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Placeholder until case API exists
    console.info('[ZeroRespond] New case (demo)', {
      title: title.trim(),
      severity,
      summary: summary.trim(),
    })
    setTitle('')
    setSeverity('medium')
    setSummary('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl shadow-black/50"
      >
        <h2
          id={titleId}
          className="text-lg font-semibold text-white"
        >
          New case
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Create a case in three fields. This preview logs to the console only.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="new-case-title"
              className="block text-xs font-medium uppercase tracking-wide text-zinc-500"
            >
              Title
            </label>
            <input
              id="new-case-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Suspected ransomware on file server"
              className="mt-1.5 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-teal-500/0 transition placeholder:text-zinc-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/30"
            />
          </div>
          <div>
            <label
              htmlFor="new-case-severity"
              className="block text-xs font-medium uppercase tracking-wide text-zinc-500"
            >
              Severity
            </label>
            <select
              id="new-case-severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="mt-1.5 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/30"
            >
              {SEVERITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="new-case-summary"
              className="block text-xs font-medium uppercase tracking-wide text-zinc-500"
            >
              Summary
            </label>
            <textarea
              id="new-case-summary"
              required
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What happened, who is affected, and what you know so far."
              className="mt-1.5 w-full resize-y rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/30"
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
            >
              Create case
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
