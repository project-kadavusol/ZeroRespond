import { NavLink, Outlet } from 'react-router-dom'

function navClassName({ isActive }: { isActive: boolean }) {
  return [
    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-zinc-800 text-white'
      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
  ].join(' ')
}

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="flex w-56 flex-col border-r border-zinc-800 p-4">
        <div className="mb-6 font-semibold tracking-tight">
          <span className="text-teal-400">Zero</span>Dashboard
        </div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
          IR command center
        </p>
        <nav className="flex flex-col gap-1">
          <NavLink to="/dashboard" className={navClassName} end>
            Incidents
          </NavLink>
          <NavLink to="/alerts" className={navClassName}>
            Alert feed
          </NavLink>
          <NavLink to="/metrics" className={navClassName}>
            Metrics
          </NavLink>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
