import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import {
  INITIAL_INCIDENTS,
  INITIAL_SYSTEMS,
  INITIAL_ALERTS,
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

interface ZeroRespondContextType {
  incidents: Incident[]
  systems: SystemItem[]
  alerts: AlertItem[]
  rules: RuleItem[]
  auditLog: AuditItem[]
  reportHistory: ReportHistoryItem[]
  settings: SettingsData
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
  wazuhUrl: 'https://wazuh-manager.local:55000',
  wazuhVersion: '4.7',
  wazuhUser: 'zerorespond',
  wazuhPass: 'demo-password',
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

  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem('zr_alerts')
    return saved ? JSON.parse(saved) : INITIAL_ALERTS
  })

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
  }, [showNotif])

  const addReportHistory = useCallback((item: ReportHistoryItem) => {
    setReportHistory(prev => [item, ...prev])
  }, [])

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
