/** Sprint 1: non-functional toolbar — Sprint 2 connects filters + search. */

export function IncidentToolbar() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-2">
        <span className="text-xs uppercase tracking-wide text-zinc-500">
          Search (mock)
        </span>
        <input
          type="search"
          placeholder="Case ID / assignee …"
          readOnly
          className="min-w-0 flex-1 cursor-not-allowed bg-transparent text-sm text-zinc-500 outline-none placeholder:text-zinc-600"
          aria-readonly="true"
          title="Sprint 2: wired to backed search"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-500"
          title="Sprint 2: severity filter"
        >
          Severity
        </button>
        <button
          type="button"
          disabled
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-500"
          title="Sprint 2: status filter"
        >
          Status
        </button>
      </div>
    </div>
  )
}
