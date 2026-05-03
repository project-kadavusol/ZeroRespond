import type { EvidenceItem } from '../../mock/fixtures'

export function EvidenceList({ items }: { items: EvidenceItem[] }) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="text-sm font-semibold text-zinc-200">Evidence</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Files linked to this case. With a live server, uploads would appear here
        automatically.
      </p>
      <ul className="mt-4 divide-y divide-zinc-800 rounded-md border border-zinc-800">
        {items.map((f) => (
          <li
            key={f.filename}
            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
          >
            <span className="font-mono text-zinc-200">{f.filename}</span>
            <span className="text-zinc-500">
              {f.sizeKb} KB · {f.addedAt}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
