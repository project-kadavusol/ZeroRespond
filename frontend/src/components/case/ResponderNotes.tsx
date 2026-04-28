import { useState } from 'react'

export function ResponderNotes() {
  const [text, setText] = useState(
    'Containment in progress — finance share offline. Escalated to NetOps for upstream ACL.\n',
  )

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="text-sm font-semibold text-zinc-200">Responder notes</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Local draft only in Sprint 1 — persist with case API in Sprint 2.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="mt-3 w-full resize-y rounded-md border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-200 outline-none ring-teal-500/0 transition-shadow focus:ring-2 focus:ring-teal-500/40"
        spellCheck
        aria-label="Responder notes"
      />
    </section>
  )
}
