import { LiveAlertCard } from '../components/alerts/LiveAlertCard'
import { MOCK_LIVE_ALERTS } from '../mock/fixtures'

export function AlertsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-white md:text-2xl">
          Live alert feed
        </h1>
        <p className="mt-1 max-w-prose text-sm text-zinc-400">
          Simulated Wazuh-style queue — WebSocket push + connection pill ships in
          Sprint&nbsp;3. Each card borrows layout from the project&apos;s stress-proof
          guidance.
        </p>
      </header>
      <ul className="space-y-4">
        {MOCK_LIVE_ALERTS.map((a) => (
          <LiveAlertCard key={a.id} alert={a} />
        ))}
      </ul>
    </div>
  )
}
