import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useZeroRespond } from '../context/ZeroRespondContext'
import {
  Plus,
  Laptop,
  Lock,
  KeyRound,
  ArrowUp,
  Folder,
  TriangleAlert,
} from 'lucide-react'

export function IncidentsPage() {
  const navigate = useNavigate()
  const { incidents, openModal, setCurrentCaseId } = useZeroRespond()

  const [tab, setTab] = useState<'all' | 'active' | 'resolved'>('all')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const handleOpenCase = (id: string) => {
    setCurrentCaseId(id)
    navigate(`/incidents/${id}`)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Ransomware':
        return <Lock size={14} style={{ display: 'inline-block', marginRight: '5px' }} />
      case 'Brute Force':
        return <KeyRound size={14} style={{ display: 'inline-block', marginRight: '5px' }} />
      case 'Privilege Escalation':
        return <ArrowUp size={14} style={{ display: 'inline-block', marginRight: '5px' }} />
      case 'File Integrity':
        return <Folder size={14} style={{ display: 'inline-block', marginRight: '5px' }} />
      default:
        return <TriangleAlert size={14} style={{ display: 'inline-block', marginRight: '5px' }} />
    }
  }

  const filteredIncidents = incidents.filter(i => {
    if (tab === 'active' && (i.status === 'resolved' || i.status === 'false-positive')) return false
    if (tab === 'resolved' && i.status !== 'resolved') return false
    if (typeFilter && i.type !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        i.id.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q) ||
        i.computer.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div id="view-incidents" className="view" style={{ display: 'block' }}>
      <div className="page-hd">
        <h1>Incident Cases</h1>
        <p>Manage incidents from detection through investigation, containment, and resolution.</p>
      </div>

      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: 0,
          }}
        >
          <div className="inc-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
            <div
              className={`inc-tab ${tab === 'all' ? 'active' : ''}`}
              onClick={() => setTab('all')}
            >
              All
            </div>
            <div
              className={`inc-tab ${tab === 'active' ? 'active' : ''}`}
              onClick={() => setTab('active')}
            >
              Active
            </div>
            <div
              className={`inc-tab ${tab === 'resolved' ? 'active' : ''}`}
              onClick={() => setTab('resolved')}
            >
              Resolved
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="finput"
              type="text"
              id="inc-search"
              placeholder="Search cases..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '180px' }}
            />

            <select
              className="fselect"
              id="inc-filter-type"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">All types</option>
              <option value="Ransomware">Ransomware</option>
              <option value="Brute Force">Brute Force</option>
              <option value="Privilege Escalation">Privilege Escalation</option>
              <option value="File Integrity">File Integrity</option>
            </select>

            <button className="btn btn-primary btn-sm" onClick={() => openModal('newIncident')}>
              <Plus size={14} /> Report New Incident
            </button>
          </div>
        </div>

        <div className="divider" style={{ margin: '14px -20px' }} />

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Case</th>
                <th>Severity</th>
                <th>Incident</th>
                <th>System</th>
                <th>Opened</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="inc-tbl">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map(i => {
                  const total = 7
                  const pct = Math.round((i.curStep / total) * 100)

                  return (
                    <tr
                      key={i.id}
                      onClick={() => handleOpenCase(i.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <strong style={{ fontFamily: 'var(--font-brand)' }}>{i.id}</strong>
                      </td>
                      <td>
                        <span className={`badge ${i.sev}`}>
                          <span className="bdot" />
                          {i.sevLbl}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {getTypeIcon(i.type)} {i.type}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: '13px',
                          fontFamily: 'var(--font-brand)',
                          cursor: 'pointer',
                          color: 'var(--accent)',
                        }}
                        onClick={e => {
                          e.stopPropagation()
                          navigate('/monitored')
                        }}
                        title="View in Monitored Systems"
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Laptop size={13} /> {i.computer}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-3)',
                          fontFamily: 'var(--font-brand)',
                        }}
                      >
                        {i.openedTime}
                      </td>
                      <td style={{ minWidth: '120px' }}>
                        <div className="progress-text">
                          {i.curStep}/{total} steps done
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            i.status === 'resolved'
                              ? 'resolved'
                              : i.sev === 'critical'
                              ? 'critical'
                              : 'medium'
                          }`}
                        >
                          {i.statusLbl}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}
                  >
                    No incidents match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
