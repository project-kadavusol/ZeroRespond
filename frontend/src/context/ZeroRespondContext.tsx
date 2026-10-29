import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import {
  INITIAL_INCIDENTS,
  INITIAL_SYSTEMS,
  INITIAL_RULES,
  INITIAL_AUDIT_LOG,
  INITIAL_REPORT_HISTORY,
  PLAYBOOKS,
} from '../mock/fixtures'
import type {
  Incident,
  SystemItem,
  AlertItem,
  RuleItem,
  AuditItem,
  ReportHistoryItem,
  SettingsData,
  Severity,
  EvidenceItem,
} from '../mock/fixtures'

interface NotificationToast {
  id: string
  title: string
  body: string
  sev: string
}

export interface WazuhLiveStatus {
  connected: boolean
  status: 'connected' | 'disconnected' | 'auth_failed' | 'unreachable' | 'checking'
  url: string
  user: string
  latencyMs?: number
  error?: string | null
  manager?: {
    version?: string
    name?: string
    type?: string
    tz?: string
  } | null
  agentsSummary?: {
    total: number
    active: number
    disconnected: number
  }
  agents?: Array<{
    id: string
    name: string
    ip: string
    os: string
    status: string
    last_keep_alive?: string
  }>
  lastChecked?: string
}

export interface MetricsSummary {
  total_cases: number
  active_cases: number
  contained_cases: number
  resolved_cases: number
  mttd_minutes: number
  mttr_minutes: number
  severity_breakdown: Record<string, number>
  attack_type_breakdown: Record<string, number>
}

interface ZeroRespondContextType {
  incidents: Incident[]
  systems: SystemItem[]
  alerts: AlertItem[]
  rules: RuleItem[]
  auditLog: AuditItem[]
  reportHistory: ReportHistoryItem[]
  settings: SettingsData
  metrics: MetricsSummary | null
  stepNotes: Record<string, Record<number, string>>
  currentCaseId: string | null
  setCurrentCaseId: (id: string | null) => void
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
  notifs: NotificationToast[]
  showNotif: (title: string, body: string, sev?: string) => void
  dismissNotif: (id: string) => void
  activeModal: 'newIncident' | 'evidence' | 'addSystem' | 'detectionDetail' | null
  modalData: any
  openModal: (modal: 'newIncident' | 'evidence' | 'addSystem' | 'detectionDetail', data?: any) => void
  closeModal: () => void
  updateStatus: (id: string, status: Incident['status']) => void
  updateIncidentDetails: (id: string, updates: Partial<Incident>) => void
  completeStep: (id: string, stepIdx: number, executedCmd?: string) => void
  skipStep: (id: string, stepIdx: number) => void
  undoStep: (id: string, stepIdx: number) => void
  saveStepNote: (id: string, stepIdx: number, note: string) => void
  updatePersons: (id: string, count: number) => void
  createIncident: (data: {
    type: string
    computer: string
    desc: string
    sev: Severity
    attackerIp?: string
    sourceIp?: string
    breachEstAt?: string
    persons?: number
    dataCategoriesList?: string[]
  }) => string
  addEvidence: (caseId: string, files: EvidenceItem[]) => void
  addSystem: (sys: { host: string; type: SystemItem['type']; os: string; dept: string }) => void
  removeSystem: (host: string) => void
  dismissAlert: (alertId: string) => void
  clearAlerts: () => void
  toggleRule: (ruleId: string, active: boolean) => void
  deleteRule: (ruleId: string) => void
  saveRule: (rule: RuleItem) => void
  saveSettings: (newSettings: Partial<SettingsData>) => void
  addReportHistory: (item: ReportHistoryItem) => void
  addAudit: (action: string, ref: string, detail: string, user?: string) => void
  wazuhStatus: WazuhLiveStatus
  checkWazuhConnection: (custom?: { url?: string; user?: string; password?: string }) => Promise<WazuhLiveStatus>
}

const DEFAULT_SETTINGS: SettingsData = {
  orgName: 'Kumaraguru College of Technology',
  orgType: 'Educational Institution',
  city: 'Coimbatore',
  state: 'Tamil Nadu',
  dpoName: 'KCT IT Department',
  dpoEmail: 'it@kct.ac.in',
  dpoPhone: '+91 422 000 0000',
  certInEmail: 'incident@cert-in.org.in',
  dpdpId: 'DPDP-KCT-2026-A1',
  autoReport: 'Yes — prompt to generate',
  wazuhUrl: 'https://host.docker.internal:55000',
  wazuhVersion: '4.14',
  wazuhUser: 'wazuh-wui',
  wazuhPass: 'MyS3cr37P450r.*-',
}

const ZeroRespondContext = createContext<ZeroRespondContextType | undefined>(undefined)

export function ZeroRespondProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('zr_incidents')
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS
  })

  const [systems, setSystems] = useState<SystemItem[]>(() => {
    const saved = localStorage.getItem('zr_systems')
    return saved ? JSON.parse(saved) : INITIAL_SYSTEMS
  })

  const [alerts, setAlerts] = useState<AlertItem[]>([])

  const [rules, setRules] = useState<RuleItem[]>(() => {
    const saved = localStorage.getItem('zr_rules')
    return saved ? JSON.parse(saved) : INITIAL_RULES
  })

  const [auditLog, setAuditLog] = useState<AuditItem[]>(() => {
    const saved = localStorage.getItem('zr_audit')
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOG
  })

  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>(() => {
    const saved = localStorage.getItem('zr_reports')
    return saved ? JSON.parse(saved) : INITIAL_REPORT_HISTORY
  })

  const [settings, setSettingsState] = useState<SettingsData>(() => {
    const saved = localStorage.getItem('zr-settings')
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
  })

  const [metrics, setMetrics] = useState<MetricsSummary | null>(null)

  const [stepNotes, setStepNotes] = useState<Record<string, Record<number, string>>>({})
  const [currentCaseId, setCurrentCaseId] = useState<string | null>('IR-08')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('zerorespond_theme') as 'light' | 'dark') || 'light'
  })
  const [notifs, setNotifs] = useState<NotificationToast[]>([])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('zerorespond_theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const [activeModal, setActiveModal] = useState<'newIncident' | 'evidence' | 'addSystem' | 'detectionDetail' | null>(null)
  const [modalData, setModalData] = useState<any>(null)

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => {
      const next = !prev
      if (next) {
        document.body.classList.add('sb-collapsed')
      } else {
        document.body.classList.remove('sb-collapsed')
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (isSidebarCollapsed) {
      document.body.classList.add('sb-collapsed')
    } else {
      document.body.classList.remove('sb-collapsed')
    }
  }, [isSidebarCollapsed])

  useEffect(() => {
    localStorage.setItem('zr_incidents', JSON.stringify(incidents))
  }, [incidents])

  useEffect(() => {
    localStorage.setItem('zr_systems', JSON.stringify(systems))
  }, [systems])

  useEffect(() => {
    localStorage.setItem('zr_alerts', JSON.stringify(alerts))
  }, [alerts])

  const showNotif = useCallback((title: string, body: string, sev: string = 'low') => {
    const id = 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
    setNotifs(prev => [...prev, { id, title, body, sev }])
    setTimeout(() => {
      setNotifs(prev => prev.filter(n => n.id !== id))
    }, 8000)
  }, [])

  const dismissNotif = useCallback((id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id))
  }, [])

  const openModal = useCallback((modal: 'newIncident' | 'evidence' | 'addSystem' | 'detectionDetail', data?: any) => {
    setActiveModal(modal)
    setModalData(data || null)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
    setModalData(null)
  }, [])

  const addAudit = useCallback((action: string, ref: string, detail: string, user: string = 'System') => {
    const now = new Date()
    const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    const p = (n: number) => String(n).padStart(2, '0')
    const t = `${p(ist.getHours())}:${p(ist.getMinutes())}`
    setAuditLog(prev => [{ t, action, ref, detail, user }, ...prev])
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setSystems(prev =>
        prev.map(s => ({
          ...s,
          lastLog: s.lastLog >= 60 ? Math.floor(Math.random() * 5) + 1 : s.lastLog + Math.floor(Math.random() * 3) + 1,
        }))
      )
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const updateStatus = useCallback((id: string, status: Incident['status']) => {
    const labels: Record<string, string> = {
      open: 'Open',
      investigating: 'Investigating',
      'in-progress': 'In Progress',
      containing: 'Containing',
      contained: 'Contained',
      resolved: 'Resolved',
      'false-positive': 'False Positive',
    }
    const statusLbl = labels[status] || status
    const now = new Date()
    const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    const p = (n: number) => String(n).padStart(2, '0')
    const t = `${p(ist.getHours())}:${p(ist.getMinutes())}`

    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === id) {
          return {
            ...inc,
            status,
            statusLbl,
            timeline: [...inc.timeline, { t, a: `Case status changed to ${statusLbl}`, type: 'done' }],
          }
        }
        return inc
      })
    )
    addAudit('Case status changed', id, `Status set to ${statusLbl}`)
    showNotif('Status Updated', `Case ${id} marked as ${statusLbl}.`, 'low')

    // Persist to FastAPI backend
    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    fetch(`${apiBase}/api/v1/cases/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, status_lbl: statusLbl }),
    }).catch(err => console.warn('Failed to persist case status to backend:', err))
  }, [addAudit, showNotif])

  const updateIncidentDetails = useCallback((id: string, updates: Partial<Incident>) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === id) {
          return { ...inc, ...updates }
        }
        return inc
      })
    )
    addAudit('Case details updated', id, Object.keys(updates).join(', '))

    // Persist to FastAPI backend
    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    fetch(`${apiBase}/api/v1/cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attacker_ip: updates.attackerIp,
        suspect_pid: updates.suspectPid,
        target_user: updates.targetUser,
        modified_file: updates.modifiedFile,
        c2_ip: updates.c2Ip,
      }),
    }).catch(err => console.warn('Failed to persist case variables to backend:', err))
  }, [addAudit])

  const completeStep = useCallback((id: string, stepIdx: number, executedCmd?: string) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id !== id || stepIdx !== inc.curStep) return inc
        const pb = PLAYBOOKS[inc.pb]
        const step = pb ? pb.steps[stepIdx] : null
        const now = new Date()
        const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
        const p = (n: number) => String(n).padStart(2, '0')
        const t = `${p(ist.getHours())}:${p(ist.getMinutes())}`

        const nextStep = inc.curStep + 1
        const isComplete = pb && nextStep >= pb.steps.length
        const nextStatus = isComplete ? 'contained' : inc.status
        const nextStatusLbl = isComplete ? 'Contained' : inc.statusLbl
        const containedAt = isComplete ? now.toISOString() : inc.containedAt

        const actionText = `Step ${stepIdx + 1} completed — ${step?.title || ''}${
          executedCmd ? ` [Cmd: ${executedCmd.length > 55 ? executedCmd.slice(0, 55) + '...' : executedCmd}]` : ''
        }`

        const newTimeline = [
          ...inc.timeline,
          { t, a: actionText, type: 'done' as const },
        ]

        if (isComplete) {
          addAudit('Playbook completed', inc.id, 'All response steps completed; case moved to Contained.')
          showNotif('Incident Contained!', `${inc.id} is fully handled. Statutory 6-hour report ready to generate.`, 'low')
        } else {
          addAudit('Playbook step completed', inc.id, `Step ${stepIdx + 1}: ${step?.title || ''}`)
        }

        return {
          ...inc,
          curStep: nextStep,
          status: nextStatus,
          statusLbl: nextStatusLbl,
          containedAt,
          timeline: newTimeline,
        }
      })
    )

    // Persist to FastAPI backend (step_order is 1-indexed: stepIdx + 1)
    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    fetch(`${apiBase}/api/v1/cases/${id}/steps/${stepIdx + 1}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_completed: true,
        notes: executedCmd ? `Executed: ${executedCmd}` : 'Completed from UI playbook runner',
        completed_by: 'Naveen Kumar',
      }),
    }).catch(err => console.warn('Failed to persist step completion to backend:', err))
  }, [addAudit, showNotif])

  const skipStep = useCallback((id: string, stepIdx: number) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id !== id || stepIdx !== inc.curStep) return inc
        const pb = PLAYBOOKS[inc.pb]
        const step = pb ? pb.steps[stepIdx] : null
        const now = new Date()
        const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
        const p = (n: number) => String(n).padStart(2, '0')
        const t = `${p(ist.getHours())}:${p(ist.getMinutes())}`

        const nextStep = inc.curStep + 1
        const isComplete = pb && nextStep >= pb.steps.length
        const nextStatus = isComplete ? 'contained' : inc.status
        const nextStatusLbl = isComplete ? 'Contained' : inc.statusLbl

        const newTimeline = [
          ...inc.timeline,
          { t, a: `Step ${stepIdx + 1} marked as not applicable — ${step?.title || ''}`, type: 'done' as const },
        ]

        addAudit('Playbook step skipped (N/A)', inc.id, `Step ${stepIdx + 1}: ${step?.title || ''}`)

        return {
          ...inc,
          curStep: nextStep,
          status: nextStatus,
          statusLbl: nextStatusLbl,
          timeline: newTimeline,
        }
      })
    )
  }, [addAudit])

  const undoStep = useCallback((id: string, stepIdx: number) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id !== id || inc.curStep === 0) return inc
        const pb = PLAYBOOKS[inc.pb]
        const step = pb ? pb.steps[stepIdx] : null
        const nextTimeline = inc.timeline.slice(0, -1)
        addAudit('Playbook step undone', inc.id, `Step ${stepIdx + 1}: ${step?.title || ''}`)
        showNotif('Step Undone', `Step ${stepIdx + 1} marked as incomplete.`, 'medium')
        return {
          ...inc,
          curStep: Math.max(0, inc.curStep - 1),
          timeline: nextTimeline,
        }
      })
    )
  }, [addAudit, showNotif])

  const saveStepNote = useCallback((id: string, stepIdx: number, note: string) => {
    setStepNotes(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [stepIdx]: note,
      },
    }))
  }, [])

  const updatePersons = useCallback((id: string, count: number) => {
    setIncidents(prev =>
      prev.map(inc => (inc.id === id ? { ...inc, persons: Math.max(0, count) } : inc))
    )
    addAudit('People affected updated', id, `Set to ${count}`)
  }, [addAudit])

  const createIncident = useCallback((data: {
    type: string
    computer: string
    desc: string
    sev: Severity
    attackerIp?: string
    sourceIp?: string
    breachEstAt?: string
    persons?: number
    dataCategoriesList?: string[]
  }): string => {
    const now = new Date()
    const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    const p = (n: number) => String(n).padStart(2, '0')
    const timeStr = `${p(ist.getHours())}:${p(ist.getMinutes())}`
    const fullTime = `${ist.getDate()} Oct 2026, ${timeStr} IST`
    const newNum = String(Date.now()).slice(-2)
    const id = `IR-0${newNum}`

    const pbMap: Record<string, Incident['pb']> = {
      Ransomware: 'ransomware',
      'Brute Force': 'bruteforce',
      'Privilege Escalation': 'privilege',
      'File Integrity': 'fileintegrity',
    }

    const sevLabels: Record<string, string> = {
      critical: 'Urgent',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    }

    const categoriesStr = data.dataCategoriesList && data.dataCategoriesList.length > 0
      ? data.dataCategoriesList.join(', ')
      : 'To be determined'

    const newInc: Incident = {
      id,
      type: data.type,
      sev: data.sev,
      sevLbl: sevLabels[data.sev] || 'Medium',
      computer: data.computer,
      sourceIp: data.sourceIp || '',
      attackerIp: data.attackerIp || '',
      suspectPid: '',
      targetUser: '',
      modifiedFile: '',
      c2Ip: '',
      assignedTo: 'Naveen Kumar',
      openedTime: timeStr,
      openedFull: fullTime,
      detectedAt: now.toISOString(),
      breachEstAt: data.breachEstAt || now.toISOString(),
      status: 'investigating',
      statusLbl: 'Investigating',
      curStep: 0,
      pb: pbMap[data.type] || 'ransomware',
      dataCategories: categoriesStr,
      dataCategoriesList: data.dataCategoriesList || [],
      persons: data.persons || 0,
      desc: data.desc || `Manually reported ${data.type} incident on ${data.computer}.`,
      timeline: [{ t: timeStr, a: 'Incident manually reported and case opened', type: 'done' }],
      evidence: [],
    }

    setIncidents(prev => [newInc, ...prev])
    setCurrentCaseId(id)
    addAudit('Incident manually reported', id, `${data.type} on ${data.computer}`)
    showNotif('New Incident Opened', `${id} created — ${data.type} on ${data.computer}. Response guide ready.`, data.sev)

    // Persist case to FastAPI backend
    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    fetch(`${apiBase}/api/v1/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        title: data.desc || `${data.type} incident on ${data.computer}`,
        type: data.type,
        sev: data.sev,
        computer: data.computer,
        desc: data.desc || `Manually reported ${data.type} incident on ${data.computer}.`,
        attacker_ip: data.attackerIp || null,
        source_ip: data.sourceIp || null,
        assigned_to: 'Naveen Kumar',
        persons: data.persons || 0,
        data_categories: categoriesStr,
        pb: pbMap[data.type] || 'ransomware',
      }),
    }).catch(err => console.warn('Failed to persist new case to backend:', err))

    return id
  }, [addAudit, showNotif])

  const addEvidence = useCallback((caseId: string, files: EvidenceItem[]) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === caseId) {
          return { ...inc, evidence: [...inc.evidence, ...files] }
        }
        return inc
      })
    )
    addAudit('Evidence attached', caseId, `${files.length} file(s) hashed & attached (§65B Attested)`)
    showNotif('Evidence Attached', `${files.length} file(s) cryptographically hashed and added to case ${caseId}.`, 'low')

    // Persist to FastAPI backend via multipart/form-data
    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    files.forEach(f => {
      const formData = new FormData()
      const content = `Evidence file: ${f.n}\nSHA-256: ${f.sha256 || 'N/A'}\nAttestation: ${f.attestation || 'Section 65B IT Act verified'}\nUploadedAt: ${f.uploadedAt || new Date().toISOString()}`
      const blob = new Blob([content], { type: 'text/plain' })
      formData.append('file', blob, f.n)
      formData.append('category', f.category || 'Forensic Artifact')
      formData.append('attestation', f.attestation || 'Section 65B IT Act verified')
      formData.append('uploader', 'Naveen Kumar')

      fetch(`${apiBase}/api/v1/cases/${caseId}/evidence`, {
        method: 'POST',
        body: formData,
      }).catch(err => console.warn('Failed to upload evidence to backend:', err))
    })
  }, [addAudit, showNotif])

  const addSystem = useCallback((sys: { host: string; type: SystemItem['type']; os: string; dept: string }) => {
    const typeMap: Record<string, string> = {
      endpoint: 'Windows Endpoint',
      server: 'Linux Server',
      cloud: 'Cloud (AWS EC2)',
      fileserver: 'File Server',
      database: 'Database Server',
    }
    const newSys: SystemItem = {
      host: sys.host,
      type: sys.type,
      typeLbl: typeMap[sys.type] || sys.type,
      os: sys.os,
      dept: sys.dept || 'Not specified',
      status: 'online',
      lastLog: 5,
      alertsToday: 0,
      alertMax: '',
    }
    setSystems(prev => [newSys, ...prev])
    showNotif('System Added', `${sys.host} is now being monitored.`, 'low')
  }, [showNotif])

  const removeSystem = useCallback((host: string) => {
    setSystems(prev => prev.filter(s => s.host !== host))
    showNotif('System Removed', `${host} has been removed from monitoring.`, 'high')
  }, [showNotif])

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
    showNotif('Warning Dismissed', 'Warning removed from detection feed.', 'low')
  }, [showNotif])

  const clearAlerts = useCallback(() => {
    setAlerts([])
    showNotif('Feed Cleared', 'All warnings removed from detection feed.', 'low')
  }, [showNotif])

  const toggleRule = useCallback((ruleId: string, active: boolean) => {
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, active } : r))
    )
    showNotif(active ? 'Rule Enabled' : 'Rule Disabled', `Rule ${ruleId} is now ${active ? 'active' : 'inactive'}.`, active ? 'low' : 'high')
  }, [showNotif])

  const deleteRule = useCallback((ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId))
    showNotif('Rule Removed', `Rule ${ruleId} has been deleted.`, 'high')
  }, [showNotif])

  const saveRule = useCallback((newRule: RuleItem) => {
    setRules(prev => {
      const idx = prev.findIndex(r => r.id === newRule.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = newRule
        return updated
      }
      return [newRule, ...prev]
    })
    showNotif('Rule Saved', `Rule ${newRule.id} — "${newRule.name}" saved.`, 'low')
  }, [showNotif])

  const saveSettings = useCallback((newSettings: Partial<SettingsData>) => {
    setSettingsState(prev => {
      const next = { ...prev, ...newSettings }
      localStorage.setItem('zr-settings', JSON.stringify(next))
      return next
    })
    showNotif('Settings Saved', 'Organisation profile and settings updated successfully.', 'low')

    // Persist profile to backend
    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    fetch(`${apiBase}/api/v1/org-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_name: newSettings.orgName,
        org_type: newSettings.orgType,
        city: newSettings.city,
        state: newSettings.state,
        registration_id: newSettings.dpdpId,
        dpo_name: newSettings.dpoName,
        dpo_email: newSettings.dpoEmail,
        dpo_phone: newSettings.dpoPhone,
        cert_in_contact: newSettings.certInEmail,
      }),
    }).catch(err => console.warn('Failed to update org profile on backend:', err))
  }, [showNotif])

  const addReportHistory = useCallback((item: ReportHistoryItem) => {
    setReportHistory(prev => [item, ...prev])
  }, [])

  const [wazuhStatus, setWazuhStatus] = useState<WazuhLiveStatus>({
    connected: false,
    status: 'checking',
    url: settings.wazuhUrl,
    user: settings.wazuhUser,
    error: null,
  })

  const checkWazuhConnection = useCallback(
    async (custom?: { url?: string; user?: string; password?: string }): Promise<WazuhLiveStatus> => {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      try {
        const endpoint = custom ? `${apiBase}/api/v1/wazuh/test-connection` : `${apiBase}/api/v1/wazuh/status`
        const options: RequestInit = custom
          ? {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: custom.url,
                user: custom.user,
                password: custom.password,
              }),
            }
          : { method: 'GET' }

        const res = await fetch(endpoint, options)
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        const data = await res.json()
        const updated: WazuhLiveStatus = {
          connected: Boolean(data.connected),
          status: data.status || (data.connected ? 'connected' : 'disconnected'),
          url: data.url || (custom?.url || settings.wazuhUrl),
          user: data.user || (custom?.user || settings.wazuhUser),
          latencyMs: data.latency_ms,
          error: data.error,
          manager: data.manager,
          agentsSummary: data.agents_summary,
          agents: data.agents || [],
          lastChecked: new Date().toLocaleTimeString(),
        }
        setWazuhStatus(updated)

        if (data.agents && data.agents.length > 0) {
          const liveSystems: SystemItem[] = data.agents.map((ag: any) => {
            const isWin = ag.os?.toLowerCase().includes('windows')
            const isManager = ag.id === '000'
            const alertsCount = typeof ag.alerts_today === 'number' ? ag.alerts_today : 0
            const maxSeverity = ag.alert_max && ag.alert_max !== 'none' ? ag.alert_max : ''
            return {
              host: ag.name || `agent-${ag.id}`,
              type: (isManager ? 'server' : isWin ? 'endpoint' : 'server') as any,
              typeLbl: isManager ? 'SIEM Server' : isWin ? 'Workstation' : 'Linux Host',
              os: ag.os || 'Linux',
              dept: isManager ? 'SOC Infrastructure' : 'Core IT',
              status: (ag.status === 'active' ? 'online' : 'offline') as any,
              lastLog: ag.status === 'active' ? 2 : 120,
              alertsToday: alertsCount,
              alertMax: maxSeverity,
            }
          })
          setSystems(liveSystems)
        }

        // Fetch live alerts from backend to populate Detection Feed
        try {
          const alertRes = await fetch(`${apiBase}/api/v1/alerts?limit=50`)
          if (alertRes.ok) {
            const rawAlerts = await alertRes.json()
            if (Array.isArray(rawAlerts) && rawAlerts.length > 0) {
              const liveAlerts: AlertItem[] = rawAlerts.map((a: any) => {
                const descLower = (a.description || '').toLowerCase()
                let category: AlertItem['category'] = 'bf'
                if (descLower.includes('ransomware') || a.rule_id === '100001' || a.rule_id === '100005') {
                  category = 'ra'
                } else if (descLower.includes('privilege') || descLower.includes('sudo') || a.rule_id === '100003' || a.rule_id === '100007') {
                  category = 'pe'
                } else if (descLower.includes('integrity') || descLower.includes('syscheck') || a.rule_id === '100004') {
                  category = 'fim'
                } else {
                  category = 'bf'
                }

                let sev: Severity = 'medium'
                const lvl = typeof a.level === 'number' ? a.level : 10
                if (lvl >= 12) sev = 'critical'
                else if (lvl >= 8) sev = 'high'
                else if (lvl >= 4) sev = 'medium'
                else sev = 'low'

                let timeStr = 'Just now'
                if (a.time) {
                  try {
                    timeStr = new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  } catch {
                    timeStr = String(a.time).substring(11, 16)
                  }
                }

                const isRealAttackerIp = Boolean(
                  a.source_ip &&
                  a.source_ip !== '127.0.0.1' &&
                  a.source_ip !== 'localhost' &&
                  a.source_ip !== 'N/A' &&
                  a.source_ip !== a.agent_ip &&
                  a.source_ip !== '10.0.0.22'
                )
                const attackerSegment = isRealAttackerIp ? ` from ${a.source_ip}` : ''
                const targetSegment = a.target_user ? ` (Target: ${a.target_user})` : ''

                return {
                  id: String(a.id),
                  name: a.description || 'Wazuh Detection',
                  category,
                  sev,
                  desc: `${a.description || 'Wazuh Detection'}${attackerSegment}${targetSegment}`,
                  computer: a.agent || a.agent_ip || 'Endpoint',
                  ruleId: String(a.rule_id || ''),
                  time: timeStr,
                  linkedCase: a.linked_case_id || undefined,
                }
              })
              setAlerts(liveAlerts)
            }
          }
        } catch (e) {
          console.warn('Could not sync live alerts:', e)
        }

        // Fetch live incident cases from backend
        try {
          const casesRes = await fetch(`${apiBase}/api/v1/cases?limit=50`)
          if (casesRes.ok) {
            const rawCases = await casesRes.json()
            if (Array.isArray(rawCases) && rawCases.length > 0) {
              const liveCases: Incident[] = rawCases.map((c: any) => ({
                id: c.id,
                type: c.type || 'Cyber Incident',
                sev: (c.sev || 'high') as Severity,
                sevLbl: c.sev_lbl || c.sev || 'High',
                computer: c.computer || 'Unknown Host',
                sourceIp: c.source_ip,
                attackerIp: c.attacker_ip,
                suspectPid: c.suspect_pid,
                targetUser: c.target_user,
                modifiedFile: c.modified_file,
                c2Ip: c.c2_ip,
                assignedTo: c.assigned_to || 'SOC Team',
                openedTime: c.opened_time || '12:00',
                openedFull: c.opened_full || new Date().toLocaleString(),
                detectedAt: c.detected_at,
                breachEstAt: c.breach_est_at,
                containedAt: c.contained_at,
                resolvedAt: c.resolved_at,
                status: (c.status || 'open') as any,
                statusLbl: c.status_lbl || c.status || 'Open',
                curStep: typeof c.cur_step === 'number' ? c.cur_step : 0,
                pb: c.pb || 'bruteforce',
                dataCategories: c.data_categories || '',
                dataCategoriesList: c.data_categories ? c.data_categories.split(',').map((s: string) => s.trim()) : [],
                persons: typeof c.persons === 'number' ? c.persons : 0,
                desc: c.desc || '',
                timeline: Array.isArray(c.timeline) ? c.timeline.map((t: any) => ({
                  t: t.t || '12:00',
                  a: t.a || '',
                  type: (t.type || 'done') as any,
                  user: t.user
                })) : [],
                evidence: Array.isArray(c.evidence) ? c.evidence : []
              }))
              setIncidents(liveCases)
            }
          }
        } catch (e) {
          console.warn('Could not sync live cases:', e)
        }

        // Fetch real-time aggregated metrics summary
        try {
          const metRes = await fetch(`${apiBase}/api/v1/metrics/summary`)
          if (metRes.ok) {
            const metData = await metRes.json()
            setMetrics(metData)
          }
        } catch (e) {
          console.warn('Could not sync metrics summary:', e)
        }

        // Fetch registered organisation profile
        try {
          const orgRes = await fetch(`${apiBase}/api/v1/org-profile`)
          if (orgRes.ok) {
            const orgData = await orgRes.json()
            setSettingsState(prev => ({
              ...prev,
              orgName: orgData.org_name || prev.orgName,
              orgType: orgData.org_type || prev.orgType,
              city: orgData.city || prev.city,
              state: orgData.state || prev.state,
              dpoName: orgData.dpo_name || prev.dpoName,
              dpoEmail: orgData.dpo_email || prev.dpoEmail,
              dpoPhone: orgData.dpo_phone || prev.dpoPhone,
              certInEmail: orgData.cert_in_contact || prev.certInEmail,
              dpdpId: orgData.registration_id || prev.dpdpId,
            }))
          }
        } catch (e) {
          console.warn('Could not sync org profile:', e)
        }

        return updated
      } catch (err: any) {
        const failed: WazuhLiveStatus = {
          connected: false,
          status: 'unreachable',
          url: custom?.url || settings.wazuhUrl,
          user: custom?.user || settings.wazuhUser,
          error: err.message || 'Cannot reach ZeroRespond backend',
          lastChecked: new Date().toLocaleTimeString(),
        }
        setWazuhStatus(failed)
        return failed
      }
    },
    [settings.wazuhUrl, settings.wazuhUser]
  )

  useEffect(() => {
    checkWazuhConnection()
    const pollInterval = setInterval(() => {
      checkWazuhConnection()
    }, 5000)
    return () => clearInterval(pollInterval)
  }, [checkWazuhConnection])

  return (
    <ZeroRespondContext.Provider
      value={{
        incidents,
        systems,
        alerts,
        rules,
        auditLog,
        reportHistory,
        settings,
        metrics,
        stepNotes,
        currentCaseId,
        setCurrentCaseId,
        isSidebarCollapsed,
        toggleSidebar,
        theme,
        toggleTheme,
        notifs,
        showNotif,
        dismissNotif,
        activeModal,
        modalData,
        openModal,
        closeModal,
        updateStatus,
        updateIncidentDetails,
        completeStep,
        skipStep,
        undoStep,
        saveStepNote,
        updatePersons,
        createIncident,
        addEvidence,
        addSystem,
        removeSystem,
        dismissAlert,
        clearAlerts,
        toggleRule,
        deleteRule,
        saveRule,
        saveSettings,
        addReportHistory,
        addAudit,
        wazuhStatus,
        checkWazuhConnection,
      }}
    >
      {children}
    </ZeroRespondContext.Provider>
  )
}

export function useZeroRespond() {
  const context = useContext(ZeroRespondContext)
  if (!context) {
    throw new Error('useZeroRespond must be used within a ZeroRespondProvider')
  }
  return context
}
