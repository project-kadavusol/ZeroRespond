import { useState } from 'react'
import './landing.css'

const REPO_ROOT = 'https://github.com/project-kadavusol/ZeroRespond'
const DASHBOARD_URL = 'http://localhost:5173'
const DOCS_URL = 'http://localhost:8000/docs'

export default function App() {
  const [activeStep, setActiveStep] = useState(0)
  const [copiedCmd, setCopiedCmd] = useState(false)
  const [copiedDeploy, setCopiedDeploy] = useState(false)
  const [copiedDeployStep, setCopiedDeployStep] = useState<number | null>(null)
  const [platform, setPlatform] = useState<'linux' | 'windows'>('linux')
  const [activeTab, setActiveTab] = useState<'playbooks' | 'dpdp' | 'cases'>('playbooks')

  const playbookSteps = [
    {
      num: 1,
      name: 'Isolate Host Immediately',
      goal: 'Sever lateral communication before ransomware spreads across subnet',
      linux: 'sudo iptables -I INPUT 1 ! -i lo -j DROP && sudo iptables -I OUTPUT 1 ! -o lo -j DROP',
      windows: 'netsh advfirewall set allprofiles firewallpolicy blockinbound,blockoutbound',
      time: '< 2 minutes',
      status: 'Critical containment'
    },
    {
      num: 2,
      name: 'Terminate Encryptor Process',
      goal: 'Halt active disk encryption and dump memory artifacts for forensics',
      linux: 'sudo kill -9 4192 && sudo dd if=/dev/mem of=/data/evidence/mem_dump.raw bs=1M count=100',
      windows: 'Stop-Process -Id 4192 -Force; winpmem.exe -o C:\\evidence\\mem_dump.raw',
      time: '< 5 minutes',
      status: 'Eradication'
    },
    {
      num: 3,
      name: 'Block Attacker C2 Indicator',
      goal: 'Null-route attacker IP address at perimeter firewall and local routing table',
      linux: 'sudo ip route add blackhole 185.220.101.44/32',
      windows: 'route add 185.220.101.44 mask 255.255.255.255 0.0.0.0 -p',
      time: '< 10 minutes',
      status: 'Perimeter defense'
    },
    {
      num: 4,
      name: 'Generate Statutory DPDP Report',
      goal: 'Compile court-admissible A4 PDF dossier and 6-hour CERT-In filing notice',
      linux: 'POST /reports/generate/IR-08 -> Compiled WeasyPrint PDF + Plaintext CERT-In Email',
      windows: 'POST /reports/generate/IR-08 -> Compiled WeasyPrint PDF + Plaintext CERT-In Email',
      time: '< 15 minutes',
      status: 'Statutory compliance'
    }
  ]

  const curStep = playbookSteps[activeStep]
  const activeCommand = platform === 'linux' ? curStep.linux : curStep.windows

  const handleCopyCmd = () => {
    navigator.clipboard?.writeText(activeCommand)
    setCopiedCmd(true)
    setTimeout(() => setCopiedCmd(false), 2000)
  }

  const handleCopyDeploy = () => {
    navigator.clipboard?.writeText('git clone https://github.com/project-kadavusol/ZeroRespond.git && cd ZeroRespond && cp .env.example .env && docker compose up -d')
    setCopiedDeploy(true)
    setTimeout(() => setCopiedDeploy(false), 2000)
  }

  const handleCopyDeployStep = (stepNum: number, text: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedDeployStep(stepNum)
    setTimeout(() => setCopiedDeployStep(null), 2000)
  }

  return (
    <div className="landing-app">
      {/* ── Header ── */}
      <header className="navbar">
        <a href="#top" className="brand">
          <img src="/logo_icon.png" alt="ZeroRespond" className="brand-logo" />
          <span className="brand-name">Zero<span>Respond</span></span>
        </a>

        <nav className="nav-menu">
          <a href="#how-it-works">How It Works</a>
          <a href="#playbooks">Playbooks</a>
          <a href="#compliance">DPDP &amp; CERT-In</a>
          <a href="#compare">Why ZeroRespond</a>
          <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">API Docs</a>
          <a href={REPO_ROOT} target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>

        <div className="nav-actions">
          <a href={DASHBOARD_URL} className="btn-launch">
            Launch ZeroDashboard
            <span className="launch-arrow">→</span>
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero-section" id="top">
        <div className="hero-container">
          <div className="hero-content">
            <div className="status-pill">
              <span className="status-dot"></span>
              Open Source · DPDP Act 2023 Native · Self-Hosted
            </div>

            <h1 className="hero-heading">
              Incident Response for Teams with <span className="highlight">Zero SOC Staff</span>.
            </h1>

            <p className="hero-description">
              When a ransomware attack or data breach strikes, small colleges, hospitals, and SMBs cannot afford $50,000 enterprise SIEMs. ZeroRespond connects real-time threat detection, guided command-level playbooks, and automated DPDP compliance reports in a single, zero-cost platform.
            </p>

            <div className="hero-cta-group">
              <a href={DASHBOARD_URL} className="btn-primary-hero">
                Launch ZeroDashboard
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
              <a href="#deploy" className="btn-secondary-hero">
                Deploy with Docker
              </a>
            </div>

            <div className="deploy-pill" onClick={handleCopyDeploy} title="Click to copy docker command">
              <span className="pill-prompt">$</span>
              <code>docker compose up -d --build</code>
              <button className="pill-copy" type="button">
                {copiedDeploy ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Interactive Live Simulator */}
          <div className="hero-simulator">
            <div className="sim-card">
              <div className="sim-header">
                <div className="sim-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-amber"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="sim-title">
                  Case IR-08 · Ransomware Containment
                </div>
                <div className="sim-badge-critical">CRITICAL</div>
              </div>

              <div className="sim-meta-bar">
                <div className="meta-item">
                  <span className="meta-lbl">Host:</span>
                  <span className="meta-val">KCTLAB-WIN01</span>
                </div>
                <div className="meta-item">
                  <span className="meta-lbl">CERT-In 6h SLA:</span>
                  <span className="meta-val-timer">05h 41m left (Compliant)</span>
                </div>
              </div>

              {/* Stepper Tabs */}
              <div className="sim-stepper">
                {playbookSteps.map((st, i) => (
                  <button
                    key={st.num}
                    type="button"
                    className={`step-btn ${activeStep === i ? 'active' : ''} ${activeStep > i ? 'done' : ''}`}
                    onClick={() => setActiveStep(i)}
                  >
                    <span className="step-idx">{st.num}</span>
                    <span className="step-title-text">{st.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Active Step Box */}
              <div className="sim-body">
                <div className="step-info-row">
                  <div>
                    <h3 className="step-heading">Step {curStep.num}: {curStep.name}</h3>
                    <p className="step-sub">{curStep.goal}</p>
                  </div>
                  <div className="platform-toggle">
                    <button
                      type="button"
                      className={`plat-btn ${platform === 'linux' ? 'active' : ''}`}
                      onClick={() => setPlatform('linux')}
                    >
                      Linux
                    </button>
                    <button
                      type="button"
                      className={`plat-btn ${platform === 'windows' ? 'active' : ''}`}
                      onClick={() => setPlatform('windows')}
                    >
                      Windows
                    </button>
                  </div>
                </div>

                <div className="command-box">
                  <div className="command-label">
                    <span>{platform === 'linux' ? 'Bash Shell' : 'PowerShell (Admin)'}</span>
                    <button type="button" className="copy-btn" onClick={handleCopyCmd}>
                      {copiedCmd ? '✓ Copied' : 'Copy Command'}
                    </button>
                  </div>
                  <pre className="command-code"><code>{activeCommand}</code></pre>
                </div>

                <div className="sim-footer">
                  <span className="sim-phase">Phase: <strong>{curStep.status}</strong></span>
                  <div className="sim-controls">
                    {activeStep > 0 && (
                      <button type="button" className="sim-btn-prev" onClick={() => setActiveStep(activeStep - 1)}>
                        Back
                      </button>
                    )}
                    {activeStep < playbookSteps.length - 1 ? (
                      <button type="button" className="sim-btn-next" onClick={() => setActiveStep(activeStep + 1)}>
                        Mark Done &amp; Next Step →
                      </button>
                    ) : (
                      <a href={`${DASHBOARD_URL}/reports?caseId=IR-08`} className="sim-btn-report">
                        Download DPDP PDF Dossier →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Metrics ── */}
      <section className="metrics-strip">
        <div className="metrics-grid">
          <div className="metric-box">
            <div className="metric-val">4.2 min</div>
            <div className="metric-lbl">Mean Time to Detect (MTTD)</div>
            <div className="metric-context">Automated Wazuh 4.7 correlation across system events</div>
          </div>
          <div className="metric-box">
            <div className="metric-val">22 min</div>
            <div className="metric-lbl">Mean Time to Respond (MTTR)</div>
            <div className="metric-context">82% faster than 2+ hours manual ad-hoc response</div>
          </div>
          <div className="metric-box">
            <div className="metric-val">6 Hours</div>
            <div className="metric-lbl">Statutory CERT-In SLA</div>
            <div className="metric-context">Built-in emergency countdown timer &amp; email filing</div>
          </div>
          <div className="metric-box">
            <div className="metric-val">₹0 Cost</div>
            <div className="metric-lbl">Zero Licensing Budget</div>
            <div className="metric-context">100% self-hosted on your Linux server via Docker</div>
          </div>
        </div>
      </section>

      {/* ── 3-Step Lifecycle ── */}
      <section className="section" id="how-it-works">
        <div className="section-header">
          <div className="section-tag">THE INCIDENT LIFECYCLE</div>
          <h2 className="section-title">Detect. Respond. Report. Repeat.</h2>
          <p className="section-desc">
            Most organizations fail during cyber incidents because detection, containment, and regulatory reporting live in disconnected silos. ZeroRespond connects all three into a continuous, guided workflow.
          </p>
        </div>

        <div className="lifecycle-grid">
          <div className="lifecycle-card">
            <div className="lifecycle-num">01</div>
            <h3 className="lifecycle-title">Detect &amp; Normalize</h3>
            <p className="lifecycle-text">
              Wazuh SIEM continuously ingests Windows event logs, Linux syslogs, and firewall traffic. 50+ tuned correlation rules identify ransomware, brute-force, and unauthorized access — auto-creating cases with zero analyst triage required.
            </p>
            <div className="lifecycle-footer">
              <span className="badge-tag">Wazuh 4.7 SIEM</span>
              <span className="badge-tag">&lt; 15% False Positives</span>
            </div>
          </div>

          <div className="lifecycle-card highlight-card">
            <div className="lifecycle-num">02</div>
            <h3 className="lifecycle-title">Guided Playbooks</h3>
            <p className="lifecycle-text">
              A college IT admin dealing with ransomware at 2:00 AM does not need a 40-page textbook. ZeroRespond presents exact, runnable commands for host isolation, process killing, and IOC blocking with dynamic variable insertion.
            </p>
            <div className="lifecycle-footer">
              <span className="badge-tag">5 Attack Playbooks</span>
              <span className="badge-tag">Linux &amp; Windows</span>
            </div>
          </div>

          <div className="lifecycle-card">
            <div className="lifecycle-num">03</div>
            <h3 className="lifecycle-title">Statutory Reporting</h3>
            <p className="lifecycle-text">
              Once contained, ZeroRespond compiles a court-admissible A4 PDF dossier fulfilling India’s DPDP Act 2023 Section 8(6) mandatory fields, complete with MTTD/MTTR metrics, chronological audit trail, and pre-formatted CERT-In notification emails.
            </p>
            <div className="lifecycle-footer">
              <span className="badge-tag">DPDP Act §8(6)</span>
              <span className="badge-tag">WeasyPrint PDF</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Feature Showcase ── */}
      <section className="section bg-card" id="playbooks">
        <div className="section-header">
          <div className="section-tag">BUILT FOR REAL INCIDENTS</div>
          <h2 className="section-title">Everything Needed to Contain an Attack</h2>
          <p className="section-desc">
            Designed to be operated under stress by non-security IT managers, system administrators, and student engineers.
          </p>
        </div>

        <div className="showcase-nav">
          <button
            type="button"
            className={`showcase-tab ${activeTab === 'playbooks' ? 'active' : ''}`}
            onClick={() => setActiveTab('playbooks')}
          >
            Guided Attack Playbooks
          </button>
          <button
            type="button"
            className={`showcase-tab ${activeTab === 'dpdp' ? 'active' : ''}`}
            onClick={() => setActiveTab('dpdp')}
          >
            DPDP Act 2023 &amp; CERT-In Reporting
          </button>
          <button
            type="button"
            className={`showcase-tab ${activeTab === 'cases' ? 'active' : ''}`}
            onClick={() => setActiveTab('cases')}
          >
            Live Command Center
          </button>
        </div>

        <div className="showcase-panel">
          {activeTab === 'playbooks' && (
            <div className="showcase-grid">
              <div className="showcase-card">
                <div className="showcase-card-header">
                  <span className="badge-red">Ransomware</span>
                  <span className="case-ref">Playbook 01</span>
                </div>
                <h4>Mass Encryption &amp; C2 Traffic</h4>
                <p>Isolates compromised host via firewall within 2 minutes, kills active encryptor processes, identifies attacker C2 IP, and guides immutable backup restoration.</p>
                <div className="cmd-chip">sudo iptables -I INPUT -j DROP</div>
              </div>

              <div className="showcase-card">
                <div className="showcase-card-header">
                  <span className="badge-amber">Brute Force</span>
                  <span className="case-ref">Playbook 02</span>
                </div>
                <h4>SSH / RDP Credential Spray</h4>
                <p>Detects 500+ failed login spikes from single IP, applies fail2ban IP jail, locks compromised account credentials, and flushes active sessions.</p>
                <div className="cmd-chip">sudo fail2ban-client set sshd banip [IP]</div>
              </div>

              <div className="showcase-card">
                <div className="showcase-card-header">
                  <span className="badge-amber">Privilege Escalation</span>
                  <span className="case-ref">Playbook 03</span>
                </div>
                <h4>Unauthorized Sudo / Admin Access</h4>
                <p>Catches unexpected administrative escalations and rogue user additions. Audits active session trails and reverts unauthorized sudoers file modifications.</p>
                <div className="cmd-chip">sudo diff /etc/sudoers.d/ /backup/sudoers</div>
              </div>

              <div className="showcase-card">
                <div className="showcase-card-header">
                  <span className="badge-blue">File Integrity</span>
                  <span className="case-ref">Playbook 04</span>
                </div>
                <h4>FIM System File Tampering</h4>
                <p>Wazuh syscheck detects unauthorized hash modifications to core binaries and `/etc/shadow`. Verifies digital signatures and restores original file integrity.</p>
                <div className="cmd-chip">sha256sum -c /var/log/baseline.sha256</div>
              </div>
            </div>
          )}

          {activeTab === 'dpdp' && (
            <div className="compliance-showcase">
              <div className="compliance-left">
                <h3>India’s First Open-Source DPDP Compliance Engine</h3>
                <p>
                  Section 8(6) of the Digital Personal Data Protection Act 2023 requires data fiduciaries to intimate the Data Protection Board and affected individuals upon a personal data breach. CERT-In mandates reporting within 6 hours.
                </p>
                <ul className="compliance-features">
                  <li><strong>8 Mandatory Fields Mapped:</strong> Breach type, compromised data categories, affected individuals count, discovery timestamps, and remedial actions.</li>
                  <li><strong>Court-Admissible PDF:</strong> Clean A4 paged-media format with institutional watermark and dual attestation signatures (DPO + Incident Commander).</li>
                  <li><strong>Instant CERT-In Dispatch:</strong> Pre-filled notification ready to copy and send to <code>incident@cert-in.org.in</code>.</li>
                  <li><strong>Plain-Language Notice:</strong> Generates non-technical notices for students, faculty, or patients informing them of the breach and protective steps.</li>
                </ul>
              </div>
              <div className="compliance-preview">
                <div className="pdf-mockup">
                  <div className="pdf-doc-badge">OFFICIAL DPDP ACT SECTION 8(6) DOSSIER</div>
                  <h4>STATUTORY INCIDENT REPORT</h4>
                  <div className="pdf-table-mini">
                    <div className="p-row"><span>Organisation</span><strong>Kumaraguru College of Technology</strong></div>
                    <div className="p-row"><span>Incident ID</span><strong>IR-08 (Ransomware)</strong></div>
                    <div className="p-row"><span>Affected Data</span><strong>Student Records, Financial Information</strong></div>
                    <div className="p-row"><span>Data Principals</span><strong>~850 individuals</strong></div>
                    <div className="p-row"><span>CERT-In SLA</span><strong style={{ color: 'var(--accent)' }}>FILED TIMELY (01h 02m elapsed)</strong></div>
                    <div className="p-row"><span>Signatures</span><strong>DPO Dr. S. Ramachandran · Prithiv Raj</strong></div>
                  </div>
                  <a href={`${DASHBOARD_URL}/reports?caseId=IR-08`} className="btn-preview-mini">
                    View Live in ZeroDashboard →
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cases' && (
            <div className="cases-showcase">
              <div className="cases-preview-banner">
                <div className="cases-summary-bar">
                  <div className="c-box"><span>Active Incidents</span><strong>4 Cases</strong></div>
                  <div className="c-box"><span>Critical</span><strong style={{ color: 'var(--red)' }}>1 Active</strong></div>
                  <div className="c-box"><span>Monitored Systems</span><strong>12 Online</strong></div>
                  <div className="c-box"><span>Mean Time to Respond</span><strong>22 min</strong></div>
                </div>
                <div className="cases-table-view">
                  <div className="t-head">
                    <span>Case ID</span>
                    <span>Threat</span>
                    <span>Target Host</span>
                    <span>Severity</span>
                    <span>CERT-In Status</span>
                    <span>Action</span>
                  </div>
                  <div className="t-row">
                    <code>IR-08</code>
                    <span>Ransomware Outbreak</span>
                    <span>KCTLAB-WIN01</span>
                    <span className="badge-red">CRITICAL</span>
                    <span className="status-timer">05h 41m left</span>
                    <a href={`${DASHBOARD_URL}/incidents/IR-08`} className="row-link">Open Case →</a>
                  </div>
                  <div className="t-row">
                    <code>IR-07</code>
                    <span>SSH Brute Force</span>
                    <span>AUTH-SRV-01</span>
                    <span className="badge-amber">HIGH</span>
                    <span className="status-timer">Resolved</span>
                    <a href={`${DASHBOARD_URL}/incidents/IR-07`} className="row-link">Open Case →</a>
                  </div>
                  <div className="t-row">
                    <code>IR-06</code>
                    <span>Privilege Escalation</span>
                    <span>WEB-SRV-02</span>
                    <span className="badge-amber">HIGH</span>
                    <span className="status-timer">Resolved</span>
                    <a href={`${DASHBOARD_URL}/incidents/IR-06`} className="row-link">Open Case →</a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="section" id="compare">
        <div className="section-header">
          <div className="section-tag">WHY ZERORESPOND WINS</div>
          <h2 className="section-title">Built for the 99% of Organizations</h2>
          <p className="section-desc">
            How ZeroRespond compares against enterprise tools and generic open-source ticketing systems.
          </p>
        </div>

        <div className="table-wrapper">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Feature / Capability</th>
                <th className="highlight-col">ZeroRespond</th>
                <th>Enterprise SIEM (Splunk/QRadar)</th>
                <th>TheHive</th>
                <th>Fast IR (FIR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Licensing &amp; Software Cost</strong></td>
                <td className="highlight-col"><strong style={{ color: 'var(--accent)' }}>₹0 (Free &amp; Open Source)</strong></td>
                <td>$50,000+ / year</td>
                <td>Free</td>
                <td>Free</td>
              </tr>
              <tr>
                <td><strong>Target Operator</strong></td>
                <td className="highlight-col"><strong>Non-security IT admin or student</strong></td>
                <td>Dedicated SOC team (L1–L3)</td>
                <td>Trained security analyst</td>
                <td>IT Helpdesk</td>
              </tr>
              <tr>
                <td><strong>Attack Playbooks</strong></td>
                <td className="highlight-col"><strong>Actionable command-level steps</strong></td>
                <td>Generic advice or custom SOAR ($$$)</td>
                <td>Checklist only, no commands</td>
                <td>None (ticketing only)</td>
              </tr>
              <tr>
                <td><strong>Indian DPDP Act 2023 Native</strong></td>
                <td className="highlight-col"><strong style={{ color: 'var(--accent)' }}>Yes — Auto-generates §8(6) PDF</strong></td>
                <td>No</td>
                <td>No</td>
                <td>No</td>
              </tr>
              <tr>
                <td><strong>CERT-In 6-Hour SLA Countdown</strong></td>
                <td className="highlight-col"><strong style={{ color: 'var(--accent)' }}>Yes — Built-in timer &amp; email</strong></td>
                <td>No</td>
                <td>No</td>
                <td>No</td>
              </tr>
              <tr>
                <td><strong>Single-Command Deployment</strong></td>
                <td className="highlight-col"><strong>Yes (Docker Compose under 5 min)</strong></td>
                <td>Requires 3–6 months deployment</td>
                <td>Complex multi-service setup</td>
                <td>Manual Django install</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Deployment Section ── */}
      <section className="section bg-card" id="deploy">
        <div className="section-header">
          <div className="section-tag">GET STARTED IN MINUTES</div>
          <h2 className="section-title">Deploy on Any Linux or Windows Server</h2>
          <p className="section-desc">
            All services — PostgreSQL, FastAPI backend, React dashboard, and WeasyPrint — start with Docker Compose.
          </p>
        </div>

        <div className="deploy-steps-grid">
          <div className="deploy-step-card">
            <div className="deploy-step-top">
              <div className="step-num-badge">1</div>
              <button
                type="button"
                className="step-copy-btn"
                onClick={() => handleCopyDeployStep(1, 'git clone https://github.com/project-kadavusol/ZeroRespond.git && cd ZeroRespond')}
                title="Copy command"
              >
                {copiedDeployStep === 1 ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
            <h4>Clone the Repository</h4>
            <pre><code>{`git clone https://github.com/project-kadavusol/ZeroRespond.git\ncd ZeroRespond`}</code></pre>
          </div>

          <div className="deploy-step-card">
            <div className="deploy-step-top">
              <div className="step-num-badge">2</div>
              <button
                type="button"
                className="step-copy-btn"
                onClick={() => handleCopyDeployStep(2, 'cp .env.example .env')}
                title="Copy command"
              >
                {copiedDeployStep === 2 ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
            <h4>Set Environment</h4>
            <pre><code>{`cp .env.example .env\n# Edit credentials if needed`}</code></pre>
          </div>

          <div className="deploy-step-card">
            <div className="deploy-step-top">
              <div className="step-num-badge">3</div>
              <button
                type="button"
                className="step-copy-btn"
                onClick={() => handleCopyDeployStep(3, 'docker compose up -d --build')}
                title="Copy command"
              >
                {copiedDeployStep === 3 ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
            <h4>Launch Full Stack</h4>
            <pre><code>{`docker compose up -d --build\n# Open http://localhost:5173`}</code></pre>
          </div>
        </div>

        <div className="deploy-cta-banner">
          <div>
            <h3>Ready to see ZeroRespond in action?</h3>
            <p>Launch the interactive dashboard locally or inspect the API documentation.</p>
          </div>
          <div className="deploy-cta-buttons">
            <a href={DASHBOARD_URL} className="btn-primary-hero">Launch Dashboard →</a>
            <a href={DOCS_URL} className="btn-secondary-hero" target="_blank" rel="noopener noreferrer">Interactive API Docs</a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-left">
            <div className="brand">
              <img src="/logo_icon.png" alt="ZeroRespond" className="brand-logo" />
              <span className="brand-name">Zero<span>Respond</span></span>
            </div>
            <p className="footer-mission">
              Incident Response Platform for Under-Resourced Organizations.<br />
              Detect · Respond · Report · Repeat.
            </p>
            <div className="footer-team">
              <strong>Team Zero · Kumaraguru College of Technology (KCT), Coimbatore</strong><br />
              Naveen Kumar (Detection) · Ragul (Backend) · Kavin (Frontend) · Prithiv Raj (Compliance &amp; DevOps)
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h5>Product</h5>
              <a href={DASHBOARD_URL}>ZeroDashboard</a>
              <a href="#playbooks">Playbook Engine</a>
              <a href="#compliance">DPDP Section 8(6)</a>
              <a href="#compare">Comparison</a>
            </div>
            <div className="footer-col">
              <h5>Developers</h5>
              <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">FastAPI Swagger Docs</a>
              <a href={REPO_ROOT} target="_blank" rel="noopener noreferrer">GitHub Repository</a>
              <a href={`${REPO_ROOT}/blob/main/README.md`} target="_blank" rel="noopener noreferrer">Architecture Guide</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>Released under the MIT License · Open-source cybersecurity for Indian SMBs &amp; Institutions.</span>
          <span>Version 1.0 · April 2026</span>
        </div>
      </footer>
    </div>
  )
}
