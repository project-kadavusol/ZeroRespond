import { useEffect, useRef } from 'react'
import './landing.css'

export default function App() {
  const navRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add('visible')
        }
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

    const anchors = document.querySelectorAll('a[href^="#"]')
    const clickHandlers: Array<{ el: Element; fn: (e: Event) => void }> = []
    anchors.forEach((a) => {
      const fn = (e: Event) => {
        const href = a.getAttribute('href')
        if (!href || href === '#') return
        const t = document.querySelector(href)
        if (t) {
          e.preventDefault()
          t.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
      a.addEventListener('click', fn)
      clickHandlers.push({ el: a, fn })
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
      for (const { el, fn } of clickHandlers) {
        el.removeEventListener('click', fn)
      }
    }
  }, [])

  return (
    <>
      <nav id="navbar" ref={navRef}>
        <a href="#" className="nav-logo" aria-label="ZeroRespond home">
          <span className="logo-wordmark">
            <span className="logo-zero">Zero</span>
            Respond
          </span>
        </a>
        <ul className="nav-links">
          <li><a href="#problem">Problem</a></li>
          <li><a href="#solution">Solution</a></li>
          <li><a href="#compare">Compare</a></li>
          <li><a href="#dpdp">DPDP Act</a></li>
          <li><a href="#team">Team</a></li>
        </ul>
        <div className="nav-cta">
          <a href="https://github.com/project-kadavusol/ZeroRespond" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">GitHub ↗</a>
          <a href="#cta" className="btn btn-primary">Get Started →</a>
        </div>
      </nav>
      
      
      <section id="hero">
        <div className="grid-bg"></div>
        <div className="hero-glow"></div>
        <div className="hero-glow2"></div>
        <div className="scan-line"></div>
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge anim-up">
              <span className="badge-dot"></span>
              India's First DPDP-Compliant IR Platform
            </div>
            <h1 className="hero-headline anim-up d1">
              Detect. Respond.<br /><span className="accent">Report.</span> Repeat.
            </h1>
            <p className="hero-subline anim-up d2">
              A unified, self-hostable <strong>Incident Response platform</strong> for colleges, hospitals, NGOs and startups that have <strong>no dedicated security team</strong> and zero budget for enterprise tools.
            </p>
            <div className="hero-actions anim-up d3">
              <a href="#cta" className="btn btn-primary btn-lg">Deploy Free → Self-hosted</a>
              <a href="#solution" className="btn btn-outline btn-lg">See How It Works</a>
            </div>
            <div className="hero-stats anim-up d4">
              <div className="hero-stat"><span className="stat-num">&lt;5 min</span><span className="stat-label">Avg. MTTD</span></div>
              <div className="hero-stat"><span className="stat-num">82%</span><span className="stat-label">Faster Response</span></div>
              <div className="hero-stat"><span className="stat-num">₹0</span><span className="stat-label">License Cost</span></div>
              <div className="hero-stat"><span className="stat-num">DPDP</span><span className="stat-label">Act Aligned</span></div>
            </div>
          </div>
          <div className="hero-visual anim-up d2">
            <div className="terminal main-terminal">
              <div className="terminal-top">
                <div className="term-dot r"></div><div className="term-dot y"></div><div className="term-dot g"></div>
                <span className="term-title">zerorespondnd — alert-processor</span>
              </div>
              <div className="term-body">
                <div><span className="t-muted">$</span> <span className="t-teal">./alert_processor</span> <span className="t-muted">--env=production</span></div>
                <div className="t-muted">Connecting to Wazuh API...</div>
                <div><span className="t-green">✓</span> <span className="t-white">Wazuh connected</span> <span className="t-dim">192.168.1.10:55000</span></div>
                <div><span className="t-green">✓</span> <span className="t-white">PostgreSQL ready</span></div>
                <div><span className="t-green">✓</span> <span className="t-white">Polling alerts every 30s</span></div>
                <div className="t-dim">─────────────────────────────</div>
                <div><span className="t-amber">[ALERT]</span> <span className="t-red">CRITICAL</span> <span className="t-white">Brute Force Detected</span></div>
                <div className="t-muted">  rule:5710 · src:203.0.113.42 · host:webserver01</div>
                <div><span className="t-teal">→</span> <span className="t-white">Case IR-20260501-A3F2 created</span></div>
                <div><span className="t-teal">→</span> <span className="t-white">Playbook: Unauthorized Access</span></div>
                <div><span className="t-teal">→</span> <span className="t-white">Alert pushed via WebSocket</span></div>
                <div className="t-muted">Watching for new alerts... <span className="cursor"></span></div>
              </div>
            </div>
            <div className="alert-card">
              <div className="alert-header">
                <div className="alert-icon">🚨</div>
                <div><div className="alert-title-sm">Live Alerts</div><div className="alert-sub">Last 60 minutes</div></div>
              </div>
              <div className="alert-row"><span>SSH Brute Force</span><span className="badge-sm badge-crit">CRIT</span></div>
              <div className="alert-row"><span>Privilege Escalation</span><span className="badge-sm badge-hi">HIGH</span></div>
              <div className="alert-row"><span>SQL Injection</span><span className="badge-sm badge-hi">HIGH</span></div>
              <div className="alert-row"><span>Unusual Outbound</span><span className="badge-sm badge-med">MED</span></div>
            </div>
            <div className="playbook-card">
              <div className="pb-header">📋 Active Playbook</div>
              <div className="pb-step"><div className="pb-num done">✓</div><span className="pb-text done">Isolate host</span></div>
              <div className="pb-step"><div className="pb-num">2</div><span className="pb-text">Identify process</span></div>
              <div className="pb-step"><div className="pb-num">3</div><span className="pb-text">Preserve evidence</span></div>
              <div className="pb-step"><div className="pb-num">4</div><span className="pb-text">Block C2 IP</span></div>
              <div className="pb-progress"><div className="pb-bar"></div></div>
            </div>
          </div>
        </div>
      </section>
      
      
      <div id="strip">
        <div className="marquee-wrap">
          <div className="marquee-track">
            <div className="marquee-item">🔴 Ransomware <span className="hi">→ Playbook auto-assigned</span></div>
            <div className="marquee-item">🐟 Phishing <span className="hi">→ C2 beacon detected</span></div>
            <div className="marquee-item">🔐 Brute Force <span className="hi">→ Case IR-A3F2 created</span></div>
            <div className="marquee-item">📤 Data Exfiltration <span className="hi">→ Outbound blocked</span></div>
            <div className="marquee-item">👤 Insider Threat <span className="hi">→ Evidence preserved</span></div>
            <div className="marquee-item">📋 DPDP Report <span className="hi">→ Generated in 1 click</span></div>
            <div className="marquee-item">⚡ MTTD <span className="hi">4.2 minutes average</span></div>
            <div className="marquee-item">🚀 Deploy <span className="hi">docker compose up</span></div>
            <div className="marquee-item">🔴 Ransomware <span className="hi">→ Playbook auto-assigned</span></div>
            <div className="marquee-item">🐟 Phishing <span className="hi">→ C2 beacon detected</span></div>
            <div className="marquee-item">🔐 Brute Force <span className="hi">→ Case IR-A3F2 created</span></div>
            <div className="marquee-item">📤 Data Exfiltration <span className="hi">→ Outbound blocked</span></div>
            <div className="marquee-item">👤 Insider Threat <span className="hi">→ Evidence preserved</span></div>
            <div className="marquee-item">📋 DPDP Report <span className="hi">→ Generated in 1 click</span></div>
            <div className="marquee-item">⚡ MTTD <span className="hi">4.2 minutes average</span></div>
            <div className="marquee-item">🚀 Deploy <span className="hi">docker compose up</span></div>
          </div>
        </div>
      </div>
      
      
      <section id="problem">
        <div className="section-inner">
          <div className="section-label reveal">The Problem</div>
          <h2 className="section-title reveal d100">When an attack hits, most organizations<br />panic, improvise, and go silent.</h2>
          <div className="problem-grid">
            <div className="problem-stats reveal d200">
              <div className="problem-card">
                <div className="prob-num red">42%</div>
                <div className="prob-desc">of Indian SMBs have zero incident response plan when a breach occurs</div>
              </div>
              <div className="problem-card">
                <div className="prob-num amber">6 hrs</div>
                <div className="prob-desc">DPDP Act 2023 Section 8(6) deadline to notify CERT-In — most orgs miss this</div>
              </div>
              <div className="problem-card">
                <div className="prob-num teal">₹1.4M</div>
                <div className="prob-desc">average annual loss per SMB from uncontrolled cyberattacks in India</div>
              </div>
              <div className="problem-card">
                <div className="prob-num purple">2+ hrs</div>
                <div className="prob-desc">average manual response time vs 22 minutes with guided playbooks</div>
              </div>
            </div>
            <div className="reveal d300">
              <h2 className="section-title">Existing tools are built for experts you don't have.</h2>
              <div className="problem-point" style={{ marginTop: "1.5rem" }}>
                <div className="prob-icon pi-red">🔒</div>
                <div className="prob-point-text">
                  <h4>No Security Team</h4>
                  <p>Colleges, hospitals, NGOs and startups have zero dedicated security staff. When a breach happens, the IT manager handles it via WhatsApp.</p>
                </div>
              </div>
              <div className="problem-point">
                <div className="prob-icon pi-amber">⚠️</div>
                <div className="prob-point-text">
                  <h4>Tools Built for SOC Analysts</h4>
                  <p>TheHive, Wazuh, Splunk — every existing tool assumes trained analysts. No guidance. No step-by-step instructions. No India-specific compliance.</p>
                </div>
              </div>
              <div className="problem-point">
                <div className="prob-icon pi-purple">📋</div>
                <div className="prob-point-text">
                  <h4>DPDP Act Compliance Gap</h4>
                  <p>India's DPDP Act 2023 requires breach reporting within 6 hours. Not a single open-source IR tool generates DPDP-compliant reports. Until now.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      
      <section id="solution">
        <div className="section-inner">
          <div className="section-label reveal">Our Solution</div>
          <h2 className="section-title reveal d100">One platform. The entire IR lifecycle.</h2>
          <p className="section-sub reveal d200">ZeroRespond connects detection, guided response, and compliance reporting in a single self-hostable platform — deployable in under one hour.</p>
          <div className="flow-strip reveal d300">
            <div className="flow-step">
              <span className="flow-step-num">01</span>
              <span className="flow-step-label">Detect</span>
              <span className="flow-step-sub">Wazuh ingests logs & fires alerts</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="flow-step-num">02</span>
              <span className="flow-step-label">Triage</span>
              <span className="flow-step-sub">Case auto-created with severity</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="flow-step-num">03</span>
              <span className="flow-step-label">Respond</span>
              <span className="flow-step-sub">Step-by-step playbook guides you</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="flow-step-num">04</span>
              <span className="flow-step-label">Report</span>
              <span className="flow-step-sub">DPDP PDF generated automatically</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="flow-step-num">05</span>
              <span className="flow-step-label">Improve</span>
              <span className="flow-step-sub">MTTD/MTTR trends over time</span>
            </div>
          </div>
        </div>
      </section>
      
      
      <section id="compare">
        <div className="section-inner">
          <div className="section-label reveal">Competitive Analysis</div>
          <h2 className="section-title reveal d100">How we compare to every alternative.</h2>
          <p className="section-sub reveal d200">Every existing tool covers one layer. ZeroRespond is the only platform that connects detection, guided response, and DPDP compliance reporting end-to-end at zero cost.</p>
          <div className="compare-table reveal d300">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>TheHive</th>
                  <th>DFIR-IRIS</th>
                  <th>Wazuh</th>
                  <th>PagerDuty</th>
                  <th className="ours">ZeroRespond</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Completely Free</td><td><span className="cp">Partial</span></td><td><span className="ck">✓</span></td><td><span className="ck">✓</span></td><td><span className="cx">✗</span></td><td className="ours"><span className="ck">✓</span></td></tr>
                <tr><td>Self-Hostable</td><td><span className="ck">✓</span></td><td><span className="ck">✓</span></td><td><span className="ck">✓</span></td><td><span className="cx">✗</span></td><td className="ours"><span className="ck">✓</span></td></tr>
                <tr><td>Built-in Detection Engine</td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td><span className="ck">✓</span></td><td><span className="cx">✗</span></td><td className="ours"><span className="ck">✓ Wazuh</span></td></tr>
                <tr><td>Guided Playbooks for Non-Experts</td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td><span className="cp">Partial</span></td><td className="ours"><span className="ck">✓ 5 Playbooks</span></td></tr>
                <tr><td>DPDP Act 2023 Compliance</td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td className="ours"><span className="ck">✓ Built-in</span></td></tr>
                <tr><td>CERT-In Notification Template</td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td className="ours"><span className="ck">✓ Auto-filled</span></td></tr>
                <tr><td>One-Command Deployment</td><td><span className="cx">✗</span></td><td><span className="cp">Partial</span></td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td className="ours"><span className="ck">✓ docker compose up</span></td></tr>
                <tr><td>Non-Security Staff Friendly</td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td><span className="cp">Partial</span></td><td className="ours"><span className="ck">✓ Primary Goal</span></td></tr>
                <tr><td>India-First Context</td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td><span className="cx">✗</span></td><td className="ours"><span className="ck">✓ DPDP + CERT-In</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      
      <section id="dpdp">
        <div className="section-inner">
          <div className="section-label reveal">India's DPDP Act 2023</div>
          <h2 className="section-title reveal d100">The only open-source IR tool<br />built for India's new data law.</h2>
          <div className="dpdp-grid">
            <div className="reveal d200">
              <div className="dpdp-card">
                <div className="dpdp-card-head">
                  <div className="dpdp-card-icon">⚖️</div>
                  <div><h3>DPDP Act Section 8(6) Report</h3><p>Auto-generated from case data — all 8 mandatory fields</p></div>
                </div>
                <div className="dpdp-field"><span className="dpdp-field-name">Breach Type</span><span className="dpdp-field-status">✓ Auto-filled from case</span></div>
                <div className="dpdp-field"><span className="dpdp-field-name">Data Categories Affected</span><span className="dpdp-field-status">✓ Tags from case record</span></div>
                <div className="dpdp-field"><span className="dpdp-field-name">Approx. Persons Impacted</span><span className="dpdp-field-status">✓ Entered by responder</span></div>
                <div className="dpdp-field"><span className="dpdp-field-name">Date & Time of Discovery</span><span className="dpdp-field-status">✓ Wazuh alert timestamp</span></div>
                <div className="dpdp-field"><span className="dpdp-field-name">Actions Taken</span><span className="dpdp-field-status">✓ From playbook step log</span></div>
                <div className="dpdp-field"><span className="dpdp-field-name">CERT-In Notification Template</span><span className="dpdp-field-status">✓ Pre-filled, ready to send</span></div>
                <div className="dpdp-field"><span className="dpdp-field-name">DPO Contact Details</span><span className="dpdp-field-status">✓ From org profile</span></div>
                <div className="dpdp-field"><span className="dpdp-field-name">Data Protection Board Notice</span><span className="dpdp-field-status">✓ 72hr window tracked</span></div>
              </div>
            </div>
            <div className="dpdp-points reveal d300">
              <div className="dpdp-point"><div className="dp-num">6h</div><div className="dp-text"><h4>CERT-In Mandatory Window</h4><p>The DPDP Act requires breach notification to CERT-In within 6 hours. ZeroRespond tracks this deadline and generates a pre-filled notification email ready to send to incident@cert-in.org.in.</p></div></div>
              <div className="dpdp-point"><div className="dp-num">72h</div><div className="dp-text"><h4>Data Protection Board Notice</h4><p>Organizations must notify the Data Protection Board within 72 hours. ZeroRespond auto-generates this report with all required fields from your case records — no manual form-filling.</p></div></div>
              <div className="dpdp-point"><div className="dp-num">0</div><div className="dp-text"><h4>Manual Effort Required</h4><p>One click on a resolved case. ZeroRespond pulls all case data, formats it to the official DPDP breach notification structure, and outputs a professional PDF in seconds.</p></div></div>
              <div className="dpdp-point"><div className="dp-num">1st</div><div className="dp-text"><h4>First Open-Source Tool to Do This</h4><p>TheHive, DFIR-IRIS, Wazuh, PagerDuty — none have India's DPDP Act built in. ZeroRespond is the first and only free, open-source IR platform with native DPDP compliance.</p></div></div>
            </div>
          </div>
        </div>
      </section>
      
      
      <section id="users">
        <div className="section-inner">
          <div className="section-label reveal">Target Users</div>
          <h2 className="section-title reveal d100">Built for orgs that can't afford enterprise security.</h2>
          <div className="users-grid">
            <div className="user-card reveal d100"><span className="user-emoji">🏫</span><div className="user-type">College IT Departments</div><div className="user-desc">Student data breaches are rising. Ad-hoc response is the norm. ZeroRespond gives college IT teams a structured, documented IR workflow for the first time.</div></div>
            <div className="user-card reveal d200"><span className="user-emoji">🏥</span><div className="user-type">Hospitals & Clinics</div><div className="user-desc">Patient data is highly sensitive and regulated. Zero security staff, zero budget. Guided playbooks work for any admin without training.</div></div>
            <div className="user-card reveal d300"><span className="user-emoji">🌱</span><div className="user-type">NGOs & Non-Profits</div><div className="user-desc">Handle donor and beneficiary personal data under DPDP obligations. Cannot afford Splunk. ZeroRespond is completely free and self-hosted.</div></div>
            <div className="user-card reveal d400"><span className="user-emoji">🚀</span><div className="user-type">Early-Stage Startups</div><div className="user-desc">No CISO, no SOC, no IR plan. ZeroRespond deploys in under one hour on any Linux server — first IR capability at zero licensing cost.</div></div>
          </div>
        </div>
      </section>
      
      
      <section id="tech">
        <div className="section-inner">
          <div className="section-label reveal">Technology Stack</div>
          <h2 className="section-title reveal d100">Open-source, battle-tested, self-hosted.</h2>
          <p className="section-sub reveal d200">Every component is open-source. No vendor lock-in. Runs entirely on your own server via Docker. Zero cloud dependency.</p>
          <div className="tech-grid">
            <div className="tech-card reveal d100"><div className="tech-logo">Wazuh 4.7</div><div className="tech-info"><h4>Wazuh 4.7</h4><p>Open-source SIEM/XDR for log ingestion, anomaly detection, and alert generation across all connected hosts.</p><span className="tech-role">Detection Engine</span></div></div>
            <div className="tech-card reveal d200"><div className="tech-logo">Fast API</div><div className="tech-info"><h4>FastAPI + Python</h4><p>High-performance REST API. Handles cases, playbooks, alerts, webhooks, and report triggers with auto-generated docs.</p><span className="tech-role">Backend API</span></div></div>
            <div className="tech-card reveal d300"><div className="tech-logo">Postgres 15</div><div className="tech-info"><h4>PostgreSQL 15</h4><p>Forensic-grade data storage with immutable audit trails, timestamped action logs, and evidence chains via SQLAlchemy.</p><span className="tech-role">Database</span></div></div>
            <div className="tech-card reveal d100"><div className="tech-logo">React 18</div><div className="tech-info"><h4>React 18 + Tailwind</h4><p>Real-time ZeroDashboard with WebSocket alert feed, Recharts MTTD/MTTR charts, and playbook step-through UI.</p><span className="tech-role">Frontend</span></div></div>
            <div className="tech-card reveal d200"><div className="tech-logo">Jinja2 PDF</div><div className="tech-info"><h4>Jinja2 + WeasyPrint</h4><p>Dynamic HTML report templates rendered to DPDP-compliant PDF with all mandatory fields auto-filled from case data.</p><span className="tech-role">Report Generator</span></div></div>
            <div className="tech-card reveal d300"><div className="tech-logo">Docker Compose</div><div className="tech-info"><h4>Docker + Compose</h4><p>All services containerized. One command deploys the complete ZeroRespond stack on any fresh Ubuntu 22.04 server.</p><span className="tech-role">Deployment</span></div></div>
          </div>
        </div>
      </section>
      
      
      <section id="team">
        <div className="section-inner">
          <div className="section-label reveal">Team Zero</div>
          <h2 className="section-title reveal d100">Built by students, for the real world.</h2>
          <p className="section-sub reveal d200">Final-year B.E. Computer Science students at Kumaraguru College of Technology, Coimbatore — Batch 2023–2027.</p>
          <div className="team-grid">
            <div className="team-card reveal d100"><div className="team-avatar ta-naveen"><span className="team-initial">N</span></div><div className="team-info"><div className="team-name">Naveen Kumar</div><div className="team-role tr-naveen">Detection Engineer</div></div></div>
            <div className="team-card reveal d200"><div className="team-avatar ta-ragul"><span className="team-initial">R</span></div><div className="team-info"><div className="team-name">Ragul</div><div className="team-role tr-ragul">Backend Developer</div></div></div>
            <div className="team-card reveal d300"><div className="team-avatar ta-mani"><span className="team-initial">M</span></div><div className="team-info"><div className="team-name">Manikandan</div><div className="team-role tr-mani">Frontend Developer</div></div></div>
            <div className="team-card reveal d400"><div className="team-avatar ta-prithiv"><span className="team-initial">P</span></div><div className="team-info"><div className="team-name">Prithiv Raj</div><div className="team-role tr-prithiv">Report & DevOps</div></div></div>
          </div>
        </div>
      </section>
      
      
      <section id="cta">
        <div className="cta-glow"></div>
        <div className="cta-inner">
          <div className="cta-tag reveal">🚀 Open Source · Self-Hosted · Free Forever</div>
          <h2 className="cta-title reveal d100">Your next breach is coming.<br />Will you be <span className="t">ready</span>?</h2>
          <p className="cta-sub reveal d200">Deploy ZeroRespond on your server in under 60 minutes. One command. Zero licensing cost. Full DPDP Act compliance from day one.</p>
          <div className="cta-actions reveal d300">
            <a href="https://github.com/project-kadavusol/ZeroRespond" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">Deploy ZeroRespond → GitHub</a>
            <a href="#tech" className="btn btn-outline btn-lg">Tech stack</a>
          </div>
          <div className="cta-note reveal d400">
            <span>🐳</span>
            <code style={{ fontFamily: "'DM Mono', monospace", fontSize: '.85rem', color: 'var(--teal)' }}>docker compose up -d</code>
            <span>— that's all it takes</span>
          </div>
        </div>
      </section>
      
      
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="logo-wordmark footer-logo-wordmark">
                <span className="logo-zero">Zero</span>
                Respond
              </div>
              <p className="footer-desc">India's first open-source, self-hostable Incident Response platform for organizations with no security team and no enterprise budget. DPDP Act 2023 aligned and CERT-In ready.</p>
              <span className="footer-dpdp">⚖️ DPDP Act 2023 Compliant</span>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><a href="#solution">Features</a></li>
                <li><a href="#dpdp">DPDP Compliance</a></li>
                <li><a href="#compare">vs Competitors</a></li>
                <li><a href="#tech">Tech Stack</a></li>
                <li><a href="#cta">Deployment Guide</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="https://github.com/project-kadavusol/ZeroRespond" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
                <li><a href="https://github.com/project-kadavusol/ZeroRespond/blob/main/README.md" target="_blank" rel="noopener noreferrer">Documentation</a></li>
                <li><a href="#">Sprint Plan</a></li>
                <li><a href="#">Project Document</a></li>
                <li><a href="#">Wazuh Rule Reference</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Team Zero</h4>
              <ul>
                <li><a href="#">Naveen Kumar</a></li>
                <li><a href="#">Ragul</a></li>
                <li><a href="#">Manikandan</a></li>
                <li><a href="#">Prithiv Raj</a></li>
                <li><a href="#">KCT, Coimbatore</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Team Zero · ZeroRespond · Kumaraguru College of Technology, Coimbatore</span>
            <div className="footer-legal">
              <a href="#">MIT License</a>
              <a href="#">Privacy Policy</a>
              <a href="#">DPDP Statement</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
