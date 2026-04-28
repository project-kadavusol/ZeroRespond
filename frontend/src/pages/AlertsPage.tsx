export function AlertsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-white">Live alert feed</h1>
        <p className="mt-1 text-sm text-zinc-400">
          WebSocket connection to{' '}
          <code className="rounded bg-zinc-900 px-1 py-0.5 text-zinc-300">
            zerorespond-api
          </code>{' '}
          will populate this feed (project Module 1 integration). Connection
          status + auto-reconnect in Sprint 3.
        </p>
      </header>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-500">
        No alerts yet — waiting for Alert Processor · Wazuh pipeline.
      </div>
    </div>
  )
}
