import { NavLink, Outlet, useLocation, Link } from 'react-router-dom'

function navItemClass(active: boolean) {
  return ['nav-item', active ? 'active' : ''].filter(Boolean).join(' ')
}

/** Breadcrumb tail label (paths without a dedicated sidebar item collapse to contextual labels). */
function breadcrumbSegments(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard'
  if (pathname === '/incidents') return 'Incidents'
  if (pathname.startsWith('/incidents/')) return 'Case detail'
  if (pathname === '/alerts') return 'Live Alerts'
  if (pathname === '/metrics') return 'Metrics'
  if (pathname === '/playbooks') return 'Playbooks'
  return 'Dashboard'
}

export function MainLayout() {
  const { pathname } = useLocation()
  const tail = breadcrumbSegments(pathname)

  return (
    <div className="zr-app">
      <header className="zr-topbar">
        <div className="topbar-left">
          <Link to="/dashboard" className="logo-area" aria-label="ZeroRespond home">
            <img className="logo-mark" src="/logo_icon.png" alt="" width={28} height={28} />
            <span className="logo-txt">
              Zero<span>Respond</span>
            </span>
          </Link>
          <span className="topbar-breadcrumb">
            <span className="topbar-breadcrumb-muted">ZeroRespond</span>
            &nbsp;/&nbsp;{tail}
          </span>
        </div>
        <div className="topbar-right">
          <Link to="/alerts" className="topbar-badge">
            <span className="dot" aria-hidden />
            3 Live Alerts
          </Link>
          <div className="topbar-org">
            Org: <strong>KCT IT Dept</strong>
          </div>
          <div className="avatar" title="Admin">
            A
          </div>
        </div>
      </header>

      <div className="zr-layout">
        <nav className="zr-sidebar" aria-label="Primary">
          <div className="sidebar-section">
            <div className="sidebar-label">Core</div>
            <NavLink to="/dashboard" end className={({ isActive }) => navItemClass(isActive)}>
              <span className="ni-icon" aria-hidden>
                📊
              </span>
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/incidents" className={({ isActive }) => navItemClass(isActive)}>
              <span className="ni-icon" aria-hidden>
                🗂️
              </span>
              <span>Incidents</span>
              <span className="ni-badge amber">2</span>
            </NavLink>
            <NavLink to="/alerts" className={({ isActive }) => navItemClass(isActive)}>
              <span className="ni-icon" aria-hidden>
                ⚡
              </span>
              <span>Live Alerts</span>
              <span className="ni-badge">3</span>
            </NavLink>
            <NavLink to="/metrics" className={({ isActive }) => navItemClass(isActive)}>
              <span className="ni-icon" aria-hidden>
                📈
              </span>
              <span>Metrics</span>
            </NavLink>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Tools</div>
            <NavLink to="/playbooks" className={({ isActive }) => navItemClass(isActive)}>
              <span className="ni-icon" aria-hidden>
                📖
              </span>
              <span>Playbooks</span>
              <span className="ni-badge green">5</span>
            </NavLink>
            <span className="nav-item nav-item-disabled">
              <span className="ni-icon" aria-hidden>
                📁
              </span>
              <span>Evidence</span>
            </span>
            <span className="nav-item nav-item-disabled">
              <span className="ni-icon" aria-hidden>
                📄
              </span>
              <span>Reports</span>
            </span>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Settings</div>
            <span className="nav-item nav-item-disabled">
              <span className="ni-icon" aria-hidden>
                🏢
              </span>
              <span>Org Profile</span>
            </span>
            <span className="nav-item nav-item-disabled">
              <span className="ni-icon" aria-hidden>
                ⚙️
              </span>
              <span>Settings</span>
            </span>
          </div>

          <div className="sidebar-bottom">
            <div className="status-chip">
              <div>
                <span className="sc-dot" aria-hidden />
                <span className="sc-txt">Wazuh Active</span>
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--muted)',
                  marginTop: '4px',
                  fontFamily: 'var(--mono)',
                }}
              >
                50+ rules · 4 agents
              </div>
            </div>
          </div>
        </nav>

        <main id="zr-main-scroll" className="zr-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
