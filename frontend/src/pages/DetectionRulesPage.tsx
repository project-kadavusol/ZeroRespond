import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useZeroRespond } from '../context/ZeroRespondContext'
import {
  ArrowLeft,
  Info,
  Plus,
  Pencil,
  X,
  KeyRound,
  ArrowUp,
  Folder,
  Lock,
} from 'lucide-react'

export function DetectionRulesPage() {
  const navigate = useNavigate()
  const { rules, toggleRule, deleteRule } = useZeroRespond()
  const [filter, setFilter] = useState('all')

  const typeInfo: Record<string, { lbl: string; cls: string; icon: ReactNode }> = {
    bf: { lbl: 'Brute Force', cls: 'bf', icon: <KeyRound size={12} /> },
    pe: { lbl: 'Privilege Escalation', cls: 'pe', icon: <ArrowUp size={12} /> },
    fim: { lbl: 'File Integrity', cls: 'fim', icon: <Folder size={12} /> },
    ra: { lbl: 'Ransomware', cls: 'ra', icon: <Lock size={12} /> },
  }

  const filteredRules = filter === 'all' ? rules : rules.filter(r => r.type === filter)

  const counts = {
    all: rules.length,
    bf: rules.filter(r => r.type === 'bf').length,
    pe: rules.filter(r => r.type === 'pe').length,
    fim: rules.filter(r => r.type === 'fim').length,
    ra: rules.filter(r => r.type === 'ra').length,
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete rule ${id} — "${name}"?`)) {
      deleteRule(id)
    }
  }

  return (
    <div id="view-rules" className="view" style={{ display: 'block' }}>
      <button className="back-btn" onClick={() => navigate('/settings')}>
        <ArrowLeft size={14} /> Back to Settings
      </button>

      <div className="page-hd">
        <h1>Detection Rules</h1>
        <p>These rules define the attack patterns monitored by the system. When a log matches a rule, a warning is created.</p>
      </div>

      <div className="info-banner">
        <Info size={16} style={{ display: 'inline-block', marginRight: '6px' }} />
        In the full deployment, these rules sync automatically with your <strong>Wazuh detection engine</strong>. Edit the Wazuh XML directly to control exactly what each rule detects.
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div className="attack-type-tabs">
          <div
            className={`at-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({counts.all})
          </div>
          <div
            className={`at-tab bf ${filter === 'bf' ? 'active' : ''}`}
            onClick={() => setFilter('bf')}
          >
            <KeyRound size={13} style={{ display: 'inline-block', marginRight: '4px' }} />
            Brute Force ({counts.bf})
          </div>
          <div
            className={`at-tab pe ${filter === 'pe' ? 'active' : ''}`}
            onClick={() => setFilter('pe')}
          >
            <ArrowUp size={13} style={{ display: 'inline-block', marginRight: '4px' }} />
            Privilege Escalation ({counts.pe})
          </div>
          <div
            className={`at-tab fim ${filter === 'fim' ? 'active' : ''}`}
            onClick={() => setFilter('fim')}
          >
            <Folder size={13} style={{ display: 'inline-block', marginRight: '4px' }} />
            File Integrity ({counts.fim})
          </div>
          <div
            className={`at-tab ra ${filter === 'ra' ? 'active' : ''}`}
            onClick={() => setFilter('ra')}
          >
            <Lock size={13} style={{ display: 'inline-block', marginRight: '4px' }} />
            Ransomware ({counts.ra})
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/rules/editor')}>
          <Plus size={14} /> Add New Rule
        </button>
      </div>

      <div className="card">
        <div className="rules-table-wrap">
          <table id="rules-table">
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Rule Name</th>
                <th>Attack Type</th>
                <th>Severity</th>
                <th>What It Detects</th>
                <th>Log Source</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="rules-tbody">
              {filteredRules.length > 0 ? (
                filteredRules.map(r => {
                  const ti = typeInfo[r.type] || { lbl: r.type, cls: 'bf', icon: null }

                  return (
                    <tr key={r.id}>
                      <td>
                        <code
                          style={{
                            fontFamily: 'var(--font-code)',
                            fontSize: '12px',
                            background: 'var(--bg-base)',
                            padding: '2px 7px',
                            borderRadius: '4px',
                          }}
                        >
                          {r.id}
                        </code>
                      </td>
                      <td>
                        <strong style={{ fontSize: '13.5px' }}>{r.name}</strong>
                      </td>
                      <td>
                        <span className={`rule-row-type ${r.type}`}>
                          {ti.icon} {ti.lbl}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${r.sev}`}>
                          <span className="bdot" />
                          {r.sev.charAt(0).toUpperCase() + r.sev.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className="rule-condition">{r.condition}</span>
                      </td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-3)' }}>{r.source}</td>
                      <td>
                        <label
                          className="rule-toggle"
                          title={r.active ? 'Active — click to disable' : 'Inactive — click to enable'}
                        >
                          <input
                            type="checkbox"
                            checked={r.active}
                            onChange={e => toggleRule(r.id, e.target.checked)}
                          />
                          <span className="rule-toggle-slider" />
                        </label>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/rules/editor?id=${r.id}`)}
                          style={{ padding: '4px 8px' }}
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(r.id, r.name)}
                          style={{ padding: '4px 8px', marginLeft: '4px' }}
                        >
                          <X size={12} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                    No rules found for this filter.
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
