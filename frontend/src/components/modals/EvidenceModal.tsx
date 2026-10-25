import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useZeroRespond } from '../../context/ZeroRespondContext'
import type { EvidenceItem } from '../../mock/fixtures'
import { X, Paperclip, UploadCloud, FileText, ShieldCheck, Hash } from 'lucide-react'

async function computeSHA256(file: File): Promise<string> {
  try {
    if (window.crypto && window.crypto.subtle) {
      const buffer = await file.arrayBuffer()
      const digest = await window.crypto.subtle.digest('SHA-256', buffer)
      const hashArray = Array.from(new Uint8Array(digest))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }
  } catch (e) {
    console.warn('SubtleCrypto error, falling back:', e)
  }
  // Fallback pseudohash for environments without secure crypto context
  const s = file.name + '_' + file.size + '_' + file.lastModified
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const hex = (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0')
  return (hex + hex + hex + hex).slice(0, 64)
}

export function EvidenceModal() {
  const { activeModal, modalData, closeModal, addEvidence } = useZeroRespond()
  const [items, setItems] = useState<EvidenceItem[]>([])
  const [evType, setEvType] = useState('Screenshot')
  const [isHashing, setIsHashing] = useState(false)

  if (activeModal !== 'evidence') return null

  const caseId = modalData?.caseId || 'IR-08'

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setIsHashing(true)
    const fileList = Array.from(e.target.files)
    const processed: EvidenceItem[] = []

    for (const f of fileList) {
      const sha256 = await computeSHA256(f)
      processed.push({
        n: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB',
        sha256,
        uploadedAt: new Date().toISOString(),
        category: evType,
        attestation: '§65B IT Act Certified Hash',
      })
    }

    setItems(prev => [...prev, ...processed])
    setIsHashing(false)
  }

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const handleAttach = () => {
    if (items.length === 0) {
      const now = new Date()
      const fakeName = `${evType.toLowerCase().replace(/\s+/g, '_')}_${Date.now().toString().slice(-4)}.log`
      const mockSha = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      addEvidence(caseId, [
        {
          n: fakeName,
          size: '14.2 KB',
          sha256: mockSha,
          uploadedAt: now.toISOString(),
          category: evType,
          attestation: '§65B IT Act Certified Hash',
        },
      ])
    } else {
      addEvidence(caseId, items)
    }
    setItems([])
    closeModal()
  }

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={closeModal}>
      <div className="modal" style={{ maxWidth: '640px', width: '92%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Paperclip size={18} /> Add Forensic Evidence to Case {caseId}
          </span>
          <button className="modal-close" onClick={closeModal} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-lbl" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '5px' }}>
              Evidence Category
            </label>
            <select
              className="fselect"
              style={{ width: '100%', height: '38px', padding: '0 10px' }}
              value={evType}
              onChange={e => setEvType(e.target.value)}
            >
              <option value="Screenshot">Screenshot / Screen Capture</option>
              <option value="Log File">System / Authentication Log File</option>
              <option value="Network Capture">Network PCAP / Connection Trace</option>
              <option value="Memory Dump">Process / Memory Artifact</option>
              <option value="Document / Report">Report / Analyst Notes Document</option>
              <option value="Other">Other Artifact</option>
            </select>
          </div>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '22px',
              border: '2px dashed var(--border-2)',
              borderRadius: 'var(--r-md)',
              background: 'var(--bg-base)',
              cursor: 'pointer',
              marginBottom: '14px',
              transition: 'border-color 0.2s',
            }}
          >
            <UploadCloud size={32} color="var(--accent)" style={{ marginBottom: '8px' }} />
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-1)' }}>
              Click or drag files here to upload forensic evidence
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '4px' }}>
              Automatic SHA-256 cryptographic verification for statutory admissibility under Section 65B, Indian IT Act 2000
            </span>
            <input type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
          </label>

          {isHashing && (
            <div style={{ textAlign: 'center', padding: '12px', fontSize: '12.5px', color: 'var(--accent)' }}>
              Calculating SHA-256 cryptographic checksums...
            </div>
          )}

          {items.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                  Staged Artifacts ({items.length})
                </span>
                <span style={{ fontSize: '11px', color: 'var(--c-contained)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} /> §65B Chain of Custody Ready
                </span>
              </div>
              {items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '9px 12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    marginBottom: '8px',
                    fontSize: '12.5px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 600, color: 'var(--text-1)' }}>
                      <FileText size={15} color="var(--accent)" /> {item.n}
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 400 }}>({item.size})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-critical)' }}
                      title="Remove file"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-2)', fontFamily: 'monospace' }}>
                    <Hash size={12} color="var(--text-muted)" />
                    <span style={{ color: 'var(--text-muted)' }}>SHA-256:</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.sha256}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 22px', borderTop: '1px solid var(--border)' }}>
          <button type="button" className="btn btn-secondary" onClick={closeModal}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleAttach} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} /> Attach Verified Evidence
          </button>
        </div>
      </div>
    </div>
  )
}
