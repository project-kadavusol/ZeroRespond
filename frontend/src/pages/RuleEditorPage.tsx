import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useZeroRespond } from '../context/ZeroRespondContext'
import type { RuleItem, Severity } from '../mock/fixtures'
import {
  ArrowLeft,
  Save,
  Copy,
  Trash2,
  AlertTriangle,
  CircleCheck,
} from 'lucide-react'

export function RuleEditorPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { rules, saveRule } = useZeroRespond()

  const ruleId = searchParams.get('id')
  const existingRule = rules.find(r => r.id === ruleId)
  const isEdit = !!existingRule

  const defaultXml = existingRule
    ? `<group name="attack,suspicious">\n\n  <rule id="${existingRule.id}" level="${existingRule.sev === 'critical' ? 15 : existingRule.sev === 'high' ? 12 : 8}">\n    <decoded_as>${existingRule.source === 'SSH / Auth Log' ? 'sshd' : 'syslog'}</decoded_as>\n    <match>${existingRule.condition}</match>\n    <description>${existingRule.name}</description>\n  </rule>\n\n</group>`
    : `<group name="custom_rules">\n\n  <rule id="6001" level="10">\n    <decoded_as>syslog</decoded_as>\n    <match>unauthorized privilege escalation detected</match>\n    <description>Custom Detection Rule</description>\n  </rule>\n\n</group>`

  const [xmlInput, setXmlInput] = useState(defaultXml)
  const [statusMsg, setStatusMsg] = useState('Valid XML with a <rule> element — ready to save.')
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    if (!xmlInput.trim()) {
      setStatusMsg('Start typing or paste XML above.')
      setIsValid(false)
      return
    }
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(xmlInput, 'application/xml')
      if (doc.querySelector('parsererror')) {
        setStatusMsg('XML syntax error — check for unclosed tags or missing quotes.')
        setIsValid(false)
        return
      }
      const rule = doc.querySelector('rule')
      if (!rule) {
        setStatusMsg('No <rule> element found in the XML.')
        setIsValid(false)
        return
      }
      setStatusMsg('Valid XML with a <rule> element — ready to save.')
      setIsValid(true)
    } catch {
      setStatusMsg('Could not parse XML.')
      setIsValid(false)
    }
  }, [xmlInput])

  const handleCopy = () => {
    navigator.clipboard?.writeText(xmlInput)
  }

  const handleClear = () => {
    setXmlInput('')
  }

  const handleSave = () => {
    if (!isValid) return
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlInput, 'application/xml')
    const ruleEl = doc.querySelector('rule')
    const parsedId = ruleEl?.getAttribute('id') || ruleId || String(Date.now()).slice(-4)
    const level = parseInt(ruleEl?.getAttribute('level') || '5', 10)
    const desc = ruleEl?.querySelector('description')?.textContent?.trim() || 'Custom Rule'
    const match = ruleEl?.querySelector('match')?.textContent?.trim() || 'Custom match'

    const sev: Severity = level >= 13 ? 'critical' : level >= 9 ? 'high' : level >= 6 ? 'medium' : 'low'

    const updatedRule: RuleItem = {
      id: parsedId,
      name: desc,
      type: existingRule ? existingRule.type : 'bf',
      typeLbl: existingRule ? existingRule.typeLbl : 'Brute Force',
      sev,
      condition: match,
      source: 'Custom XML',
      active: true,
      rawXml: xmlInput,
    }

    saveRule(updatedRule)
    navigate('/rules')
  }

  return (
    <div id="view-rule-editor" className="view" style={{ display: 'block' }}>
      <button className="back-btn" onClick={() => navigate('/rules')}>
        <ArrowLeft size={14} /> Back to Detection Rules
      </button>

      <div className="re-header">
        <div>
          <div className="re-title">
            {isEdit ? `Edit Rule ${ruleId}` : 'Add New Detection Rule'}
          </div>
          <div className="re-subtitle">
            {isEdit ? 'Edit the Wazuh rule directly in XML.' : 'Write or paste a Wazuh XML rule below.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/rules')}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            id="re-save-btn"
            disabled={!isValid}
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={14} /> {isEdit ? 'Update Rule' : 'Save Rule'}
          </button>
        </div>
      </div>

      <div id="re-xml-mode" className="xml-editor-only">
        <div className="xml-editor-toolbar">
          <div>
            <div className="rule-editor-section-title" style={{ marginBottom: '3px' }}>
              Wazuh Rule XML
            </div>
            <div className="xml-editor-help">
              Paste or write valid Wazuh rule XML. Validated automatically as you type.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
              <Copy size={13} /> Copy
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleClear}>
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>

        <textarea
          id="re-xml-input"
          className="xml-editor-textarea"
          placeholder="Paste or write your Wazuh XML here..."
          value={xmlInput}
          onChange={e => setXmlInput(e.target.value)}
          spellCheck={false}
        />

        <div
          id="xml-parse-status"
          className="xml-parse-status"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {isValid ? (
            <CircleCheck size={14} color="var(--c-low)" />
          ) : (
            <AlertTriangle size={14} color="var(--c-critical)" />
          )}
          <span style={{ color: isValid ? 'var(--c-low)' : 'var(--c-critical)' }}>
            {statusMsg}
          </span>
        </div>
      </div>
    </div>
  )
}
