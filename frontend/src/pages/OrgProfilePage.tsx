import { MOCK_ORG_PROFILE } from '../mock/fixtures'

export function OrgProfilePage() {
  const o = MOCK_ORG_PROFILE

  return (
    <div className="zr-page">
      <header className="zr-page-header">
        <div>
          <div className="zr-page-title">Organization profile</div>
          <div className="zr-page-sub">DPDP and contact details synced with incident notifications</div>
        </div>
        <div className="zr-page-actions">
          <span className="zr-sync-note">Read-only demo</span>
          <button type="button" className="btn btn-primary btn-sm">
            Save changes
          </button>
        </div>
      </header>

      <div className="zr-fields-col card card-sm">
        <div className="card-title" style={{ marginBottom: '20px' }}>
          Legal & accountability
        </div>
        <div className="zr-labeled-field">
          <label htmlFor="org-legal">Legal entity name</label>
          <input id="org-legal" readOnly defaultValue={o.legalName} />
        </div>
        <div className="zr-labeled-field">
          <label htmlFor="org-dba">Operating unit</label>
          <input id="org-dba" readOnly defaultValue={o.tradingAs} />
        </div>
        <div className="zr-labeled-field">
          <label htmlFor="org-sector">Industry</label>
          <input id="org-sector" readOnly defaultValue={o.industry} />
        </div>
        <div className="zr-labeled-field">
          <label htmlFor="org-zone">Timezone</label>
          <input id="org-zone" readOnly defaultValue={o.timezone} />
        </div>
      </div>

      <div className="zr-fields-col card card-sm" style={{ marginTop: '20px' }}>
        <div className="card-title" style={{ marginBottom: '20px' }}>
          Data protection
        </div>
        <div className="zr-labeled-field">
          <label htmlFor="org-dpo">DPDP liaison / nominee</label>
          <input id="org-dpo" readOnly defaultValue={o.dpdpNominee} />
        </div>
        <div className="zr-labeled-field">
          <label htmlFor="org-region">Primary data region</label>
          <input id="org-region" readOnly defaultValue={o.dataRegion} />
        </div>
        <div className="zr-labeled-field">
          <label htmlFor="org-retention">Evidence retention (days)</label>
          <input id="org-retention" readOnly defaultValue={o.retentionEvidenceDays} />
        </div>
      </div>

      <div className="zr-fields-col card card-sm" style={{ marginTop: '20px' }}>
        <div className="card-title" style={{ marginBottom: '20px' }}>
          Operations
        </div>
        <div className="zr-labeled-field">
          <label htmlFor="org-socmail">SOC contact</label>
          <input id="org-socmail" readOnly defaultValue={o.supportEmail} />
        </div>
      </div>
    </div>
  )
}
