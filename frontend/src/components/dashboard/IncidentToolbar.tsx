type IncidentToolbarProps = {
  onNewCase?: () => void
}

export function IncidentToolbar({ onNewCase }: IncidentToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-2">
        <span className="text-xs uppercase tracking-wide text-zinc-500">
          Search
        </span>
        <input
          type="search"
          placeholder="Case ID or assignee"
          readOnly
          className="min-w-0 flex-1 cursor-not-allowed bg-transparent text-sm text-zinc-500 outline-none placeholder:text-zinc-600"
          aria-readonly="true"
          title="Connects to search when your backend is wired"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {onNewCase ? (
          <button
            type="button"
            onClick={onNewCase}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
          >
            New case
          </button>
        ) : null}
        <button
          type="button"
          disabled
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-500"
          title="Severity filter — coming with live data"
        >
          Severity
        </button>
        <button
          type="button"
          disabled
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-500"
          title="Status filter — coming with live data"
        >
          Status
        </button>
      </div>
    </div>
  )
}
