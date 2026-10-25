import { useState } from 'react'
import type { FormEvent } from 'react'
import { useZeroRespond } from '../../context/ZeroRespondContext'
import type { SystemItem } from '../../mock/fixtures'
import { X, Monitor, Plus } from 'lucide-react'

export function AddSystemModal() {
  const { activeModal, closeModal, addSystem } = useZeroRespond()
  const [host, setHost] = useState('')
  const [type, setType] = useState<SystemItem['type']>('endpoint')
  const [os, setOs] = useState('Windows 11')
  const [dept, setDept] = useState('')

  if (activeModal !== 'addSystem') return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!host.trim()) {
      alert('Please enter a hostname or IP address.')
      return
    }
    addSystem({ host: host.trim(), type, os, dept: dept.trim() || 'General Infrastructure' })
    setHost('')
    setDept('')
    closeModal()
  }

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={closeModal}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={18} /> Add System to Monitoring
          </span>
          <button className="modal-close" onClick={closeModal} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-lbl" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '5px' }}>
                Hostname or IP Address
              </label>
              <input
                className="finput"
                style={{ width: '100%', height: '38px', padding: '0 10px' }}
                placeholder="e.g. srv-app-02 or 10.0.0.45"
                value={host}
                onChange={e => setHost(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-lbl" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '5px' }}>
                System Role / Type
              </label>
              <select
                className="fselect"
                style={{ width: '100%', height: '38px', padding: '0 10px' }}
                value={type}
                onChange={e => setType(e.target.value as SystemItem['type'])}
              >
                <option value="endpoint">Windows Endpoint</option>
                <option value="server">Linux Server</option>
                <option value="database">Database Server</option>
                <option value="fileserver">File Server</option>
                <option value="cloud">Cloud (AWS EC2)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-lbl" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '5px' }}>
                Operating System
              </label>
              <select
                className="fselect"
                style={{ width: '100%', height: '38px', padding: '0 10px' }}
                value={os}
                onChange={e => setOs(e.target.value)}
              >
                <option value="Windows 11">Windows 11</option>
                <option value="Windows 10">Windows 10</option>
                <option value="Ubuntu 22.04">Ubuntu 22.04 LTS</option>
                <option value="Ubuntu 20.04">Ubuntu 20.04 LTS</option>
                <option value="Debian 12">Debian 12</option>
                <option value="Red Hat Enterprise Linux 9">Red Hat Enterprise Linux 9</option>
                <option value="Amazon Linux 2">Amazon Linux 2</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-lbl" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '5px' }}>
                Department or Physical Location
              </label>
              <input
                className="finput"
                style={{ width: '100%', height: '38px', padding: '0 10px' }}
                placeholder="e.g. Computer Science Lab 2, Finance Office"
                value={dept}
                onChange={e => setDept(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 22px', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add System
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
