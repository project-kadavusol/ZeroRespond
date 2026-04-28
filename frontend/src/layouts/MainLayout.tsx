import { NavLink, Outlet, useLocation } from 'react-router-dom'

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-zinc-800 text-white'
      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
  ].join(' ')
}

function titleFor(pathname: string) {
  if (pathname.startsWith('/incidents/')) return 'Case workspace'
  if (pathname === '/dashboard') return 'Incident list'
  if (pathname === '/alerts') return 'Live alert feed'
  if (pathname === '/metrics') return 'Operational metrics'
  return 'ZeroDashboard'
}

export function MainLayout() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="flex w-52 shrink-0 flex-col border-r border-zinc-800 p-3 md:w-56 md:p-4">
        <div className="mb-5 md:mb-6">
          <div className="font-semibold tracking-tight">
            <span className="text-teal-400">Zero</span>
            Respond
          </div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
            ZeroDashboard UI
          </div>
        </div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          Navigate
        </p>
        <nav className="flex flex-col gap-0.5" aria-label="Primary">
          <NavLink to="/dashboard" className={navClass} end>
            Incidents
          </NavLink>
          <NavLink to="/alerts" className={navClass}>
            Alert feed
          </NavLink>
          <NavLink to="/metrics" className={navClass}>
            Metrics
          </NavLink>
        </nav>
        <div className="mt-auto pt-8 text-[10px] leading-snug text-zinc-600">
          Sprint&nbsp;1 static mock&nbsp;mode — no APIs or WebSockets.
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                {titleFor(pathname)}
              </p>
              <p className="text-xs text-zinc-400">
                Self-hosted incident response cockpit (layout mock · Module&nbsp;5)
              </p>
            </div>
            <span
              className="rounded-full border border-amber-800/70 bg-amber-950/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-100"
              title="Green when WebSocket/API healthy in Sprint 3"
            >
              Offline · fixtures
            </span>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6 lg:px-10 lg:pb-10 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
