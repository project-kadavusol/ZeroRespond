type IncidentToolbarProps = {
  onNewCase?: () => void
}

export function IncidentToolbar({ onNewCase }: IncidentToolbarProps) {
  return (
    <div className="zr-toolbar">
      <div className="zr-search">
        <label htmlFor="inc-search">Search</label>
        <input
          id="inc-search"
          type="search"
          placeholder="Case ID or assignee"
          readOnly
          aria-readonly="true"
          title="Connects to search when your backend is wired"
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        {onNewCase ? (
          <button type="button" className="btn btn-primary" onClick={onNewCase}>
            + New case
          </button>
        ) : null}
        <button type="button" className="btn btn-ghost btn-sm" disabled title="Coming with live data">
          Severity
        </button>
        <button type="button" className="btn btn-ghost btn-sm" disabled title="Coming with live data">
          Status
        </button>
      </div>
    </div>
  )
}
