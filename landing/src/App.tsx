import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './landing.css'

const REPO_ROOT = 'https://github.com/project-kadavusol/ZeroRespond'
const README_URL = `${REPO_ROOT}/blob/main/README.md`

const DEPLOY_COMMAND =
  'git clone https://github.com/project-kadavusol/ZeroRespond.git && cd ZeroRespond && cp .env.example .env && docker compose up -d'

type TermLineSpec = { text: string; cls?: string; newline?: boolean }

const TERM_LINES: TermLineSpec[] = [
  { text: '[02:47:03] ', cls: 't-time', newline: true },
  { text: 'WAZUH  ', cls: 't-detect' },
  { text: 'Bulk file rename detected — 847 files in 12s', cls: '' },
  { text: '', newline: true },
  { text: '[02:47:04] ', cls: 't-time', newline: true },
  { text: 'ALERT  ', cls: 't-alert' },
  { text: 'Rule 92200 — Possible Ransomware Activity ', cls: '' },
  { text: 'CRITICAL', cls: 'term-badge tbg-red' },
  { text: '', newline: true },
  { text: '[02:47:05] ', cls: 't-time', newline: true },
  { text: 'CASE   ', cls: 't-case' },
  { text: '#IR-2024-001 auto-created · Playbook assigned', cls: '' },
  { text: '', newline: true },
  { text: 'PLAYBOOK ', cls: 't-play', newline: true },
  { text: 'Ransomware Response — 6 steps loaded', cls: '' },
  { text: '', newline: true },
  { text: '  ├ Step 1 → Isolate host', cls: 't-cmd', newline: true },
  { text: '  │  $ iptables -I INPUT -j DROP', cls: 't-cmd', newline: true },
  { text: '  ├ Step 2 → Kill process PID 3847', cls: 't-cmd', newline: true },
  { text: '  ├ Step 3 → Block C2 IP 185.220.x.x', cls: 't-cmd', newline: true },
  { text: '  └ Steps 4–6 complete ✓', cls: 't-done', newline: true },
  { text: '', newline: true },
  { text: 'REPORT  ', cls: 't-report', newline: true },
  { text: 'Generating DPDP Section 8(6) PDF...', cls: '' },
  { text: '', newline: true },
  { text: 'METRIC  ', cls: 't-metric', newline: true },
  { text: 'MTTD: 4.2 min · MTTR: 22 min · FP: 12%', cls: '' },
  { text: '', newline: true },
  { text: '✓ Case resolved · Report ready · ', cls: 't-done', newline: true },
  { text: '82% faster than manual response', cls: 't-done', newline: true },
]

function buildLineGroups(lines: TermLineSpec[]) {
  const lineGroups: TermLineSpec[][] = []
  let cg: TermLineSpec[] = []
  for (const l of lines) {
    cg.push(l)
    if (l.newline) {
      lineGroups.push([...cg])
      cg = []
    }
  }
  if (cg.length) lineGroups.push(cg)
  return lineGroups
}

function TerminalAnimation() {
  const lineGroups = useMemo(() => buildLineGroups(TERM_LINES), [])
  const cycleMs = lineGroups.length * 280 + 3000
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setCycle((c) => c + 1), cycleMs)
    return () => window.clearInterval(id)
  }, [cycleMs])

  return (
    <div className="term-body" key={cycle}>
      {lineGroups.map((group, gi) => (
        <div key={gi} className="term-row term-row-inner" style={{ animationDelay: `${gi * 0.08}s` }}>
          {group.map((item, ii) => {
            if (!item.text && !item.cls) return null
            return (
              <span key={ii} className={item.cls || undefined}>
                {item.text}
              </span>
            )
          })}
        </div>
      ))}
      <span className="cursor" aria-hidden />
    </div>
  )
}

export default function App() {
  const navRef = useRef<HTMLElement | null>(null)
  const [copyLabel, setCopyLabel] = useState('Copy')

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(DEPLOY_COMMAND)
    } catch {
      return
    }
    setCopyLabel('Copied!')
    window.setTimeout(() => setCopyLabel('Copy'), 2000)
  }, [])

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 50)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add('visible')
        }
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el))

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
      observer.disconnect()
      for (const { el, fn } of clickHandlers) {
        el.removeEventListener('click', fn)
      }
    }
  }, [])

  return (
    <>
      <nav id="navbar" ref={navRef}>
        <a
          className="nav-logo"
          href="#top"
          aria-label="ZeroRespond home"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <div className="logo-mark">ZR</div>
          <span className="logo-text">
            Zero<span>Respond</span>
          </span>
        </a>
        <ul className="nav-links">
          <li>
            <a href="#problem">Problem</a>
          </li>
          <li>
            <a href="#solution">Solution</a>
          </li>
          <li>
            <a href="#modules">Modules</a>
          </li>
          <li>
            <a href="#dpdp">DPDP</a>
          </li>
          <li>
            <a href="#deploy">Deploy</a>
          </li>
        </ul>
        <div className="nav-cta">
          <a
            href={REPO_ROOT}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            GitHub
          </a>
          <a href="#deploy" className="btn-primary">
            Get Started →
          </a>
        </div>
      </nav>

      <div id="top" />

      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-glow1" />
          <div className="hero-glow2" />
        </div>

        <div className="hero-left">
          <div className="hero-badge">● v1.0 — Self-Hostable · Free · India-First</div>
          <h1 className="hero-title">
            INCIDENT
            <br />
            RESPONSE
            <br />
            <span className="accent">FOR EVERYONE</span>
          </h1>
          <p className="hero-sub">
            When a cyberattack hits —{' '}
            <strong>most Indian organizations panic, go dark, and lose everything.</strong>
            <br />
            ZeroRespond gives them a structured, DPDP-compliant path through any incident. No
            security team needed.
          </p>
          <div className="hero-ctas">
            <a href="#deploy" className="btn-hero btn-hero-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Deploy with Docker
            </a>
            <a href="#solution" className="btn-hero btn-hero-secondary">
              See How It Works
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="val">4.2 min</span>
              <span className="lbl">Mean Time to Detect</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <span className="val">82%</span>
              <span className="lbl">Faster Response</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <span className="val">50+</span>
              <span className="lbl">Rules Validated</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <span className="val">₹0</span>
              <span className="lbl">Licensing Cost</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="terminal" id="terminal">
            <div className="term-header">
              <div className="term-dots">
                <div className="term-dot td1" />
                <div className="term-dot td2" />
                <div className="term-dot td3" />
              </div>
              <span className="term-title">zerorespond — live incident: #IR-2024-001</span>
            </div>
            <TerminalAnimation />
          </div>
        </div>
      </section>

      <div className="trust-bar">
        <div className="trust-inner">
          <div className="trust-badge">🎓 Kumaraguru College of Technology</div>
          <div className="trust-div" />
          <div className="trust-item">
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            DPDP Act 2023 · Section 8(6) Mapped
          </div>
          <div className="trust-div" />
          <div className="trust-item">
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
            ISO 27035 Aligned IR Workflow
          </div>
          <div className="trust-div" />
          <div className="trust-item">
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Tested on 50+ Simulated Alerts
          </div>
          <div className="trust-div" />
          <div className="trust-item">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2c2.09 0 4.02.713 5.565 1.898L5.898 17.565A7.952 7.952 0 014 12c0-4.411 3.589-8 8-8zm0 16a7.97 7.97 0 01-5.565-2.102L18.102 6.435A7.97 7.97 0 0120 12c0 4.411-3.589 8-8 8z" />
            </svg>
            CERT-In 6-Hour Notification SLA
          </div>
        </div>
      </div>

      <div className="metrics-band">
        <div className="metrics-grid fade-up">
          <div className="metric-item">
            <div className="metric-val mv-green">4.2 min</div>
            <div className="metric-lbl">Mean Time to Detect</div>
            <div className="metric-sub">avg across 50 simulated alerts</div>
          </div>
          <div className="metric-item">
            <div className="metric-val mv-blue">22 min</div>
            <div className="metric-lbl">Mean Time to Respond</div>
            <div className="metric-sub">with playbook guidance</div>
          </div>
          <div className="metric-item">
            <div className="metric-val mv-amber">82%</div>
            <div className="metric-lbl">Faster than Manual</div>
            <div className="metric-sub">22 min vs 2 hrs without tool</div>
          </div>
          <div className="metric-item">
            <div className="metric-val mv-purple">12%</div>
            <div className="metric-lbl">False Positive Rate</div>
            <div className="metric-sub">after Wazuh tuning (default 28%)</div>
          </div>
        </div>
      </div>

      <section className="problem" id="problem">
        <div className="section-label">The Problem</div>
        <div className="section-title fade-up">
          Most organizations have
          <br />
          zero plan when attacked
        </div>
        <div className="section-sub fade-up delay-1">
          They panic. Go dark. Lose data. Face legal exposure.
          <br />
          And it keeps happening — because nothing changes after.
        </div>

        <div className="problem-grid">
          <div className="problem-cards">
            <div className="prob-card fade-up">
              <div className="prob-icon pi-red">🚫</div>
              <div className="prob-text">
                <h4>No Security Team</h4>
                <p>
                  Colleges, hospitals, NGOs, and startups have zero dedicated security staff.
                  When attacked, there is no one who knows what to do.
                </p>
              </div>
            </div>
            <div className="prob-card fade-up delay-1">
              <div className="prob-icon pi-amber">📵</div>
              <div className="prob-text">
                <h4>No Incident Plan</h4>
                <p>
                  Response is ad-hoc — usually a panicked WhatsApp group. No documentation. No
                  structure. No way to know what was compromised.
                </p>
              </div>
            </div>
            <div className="prob-card fade-up delay-2">
              <div className="prob-icon pi-purple">⚖️</div>
              <div className="prob-text">
                <h4>DPDP Act 2023 Exposure</h4>
                <p>
                  India now mandates breach notification within 6 hours. Most organizations don&apos;t
                  know this — and have zero infrastructure to comply.
                </p>
              </div>
            </div>
            <div className="prob-card fade-up delay-3">
              <div className="prob-icon pi-blue">👁️‍🗨️</div>
              <div className="prob-text">
                <h4>No Visibility After Attack</h4>
                <p>
                  No timeline of what happened. No forensic evidence. No metrics. No way to prevent
                  it happening again next month.
                </p>
              </div>
            </div>
          </div>

          <div className="problem-right fade-up delay-1">
            <blockquote>
              &quot;When a cyberattack hits — they panic, go dark, and{' '}
              <em>lose everything</em>.&quot;
            </blockquote>
            <div className="crisis-stat">
              <div className="cs-num">63M+</div>
              <div className="cs-txt">
                Small and medium businesses in India — most with zero incident response capability
              </div>
              <div className="cs-src">// DPDP Act 2023 applies to all of them</div>
            </div>
            <div
              className="crisis-stat"
              style={{
                background: 'rgba(255,179,0,.05)',
                borderColor: 'rgba(255,179,0,.2)',
              }}
            >
              <div className="cs-num" style={{ color: 'var(--amber)' }}>
                ₹50K+
              </div>
              <div className="cs-txt">
                Splunk costs $50,000+/year. CrowdStrike. IBM QRadar. Completely inaccessible to
                SMBs, colleges, and NGOs.
              </div>
              <div className="cs-src">// ZeroRespond costs ₹0 and runs on your own server</div>
            </div>
          </div>
        </div>
      </section>

      <section id="solution">
        <div className="section-label">The Solution</div>
        <div className="section-title fade-up">
          Detect. Respond.
          <br />
          Report.{' '}
          <span style={{ color: 'var(--accent)' }}>Repeat.</span>
        </div>
        <div className="section-sub fade-up delay-1">
          ZeroRespond is the only tool that connects all three layers of incident response in one
          self-hostable, zero-cost platform — purpose-built for India.
        </div>

        <div className="solution-flow fade-up delay-2">
          <div className="flow-step">
            <div className="fs-num">01 // DETECT</div>
            <div className="fs-icon fi-green">🔍</div>
            <div className="fs-title">Threat Detection</div>
            <div className="fs-sub">
              Wazuh-powered log ingestion from Windows, Linux, firewalls, and web servers. Anomaly
              detection with 50+ custom rules.
            </div>
          </div>
          <div className="flow-step">
            <div className="fs-num">02 // RESPOND</div>
            <div className="fs-icon fi-blue">⚡</div>
            <div className="fs-title">Guided Response</div>
            <div className="fs-sub">
              Step-by-step actionable playbooks — real commands, not generic advice. Non-security
              staff can handle incidents with confidence.
            </div>
          </div>
          <div className="flow-step">
            <div className="fs-num">03 // REPORT</div>
            <div className="fs-icon fi-amber">📋</div>
            <div className="fs-title">DPDP Report</div>
            <div className="fs-sub">
              Auto-generated PDF with all DPDP Act Section 8(6) fields: breach timeline, data
              categories, CERT-In notification template.
            </div>
          </div>
          <div className="flow-step">
            <div className="fs-num">04 // TRACK</div>
            <div className="fs-icon fi-purple">📊</div>
            <div className="fs-title">Metrics Dashboard</div>
            <div className="fs-sub">
              MTTD, MTTR, false positive rates, incident heatmaps. Show your organization&apos;s real
              security posture over time.
            </div>
          </div>
        </div>

        <div className="solution-moat fade-up">
          <p>
            The combination of <strong>Detect → Guided Respond → DPDP-Compliant Report</strong> in one
            zero-cost self-hostable tool for Indian SMBs —{' '}
            <strong>this combination does not exist anywhere else.</strong>
          </p>
        </div>
      </section>

      <section className="modules" id="modules">
        <div className="section-label">Platform Modules</div>
        <div className="section-title fade-up">
          5 modules.
          <br />
          One complete workflow.
        </div>

        <div className="modules-grid">
          <div className="mod-card fade-up">
            <div className="mod-num">M1 // DETECTION</div>
            <div className="mod-icon">🕵️</div>
            <div className="mod-title">Threat Detection Feed</div>
            <div className="mod-desc">
              Real-time log ingestion from Windows Event Logs, Linux syslogs, firewall logs, and web
              server logs. Powered by Wazuh 4.7 with 50+ custom correlation rules covering ransomware,
              brute force, C2 beacons, data exfiltration, and web attacks.
            </div>
            <span className="mod-usp">MTTD: 4.2 min avg</span>
          </div>
          <div className="mod-card fade-up delay-1">
            <div className="mod-num">M2 // CASES</div>
            <div className="mod-icon">📁</div>
            <div className="mod-title">Incident Case Manager</div>
            <div className="mod-desc">
              Structured workspace per incident. Log findings, assign tasks, upload evidence files,
              track timeline, mark resolution status. Auto-created when Wazuh fires a critical alert
              — no manual trigger needed.
            </div>
            <span className="mod-usp">Auto-created on alert</span>
          </div>
          <div className="mod-card fade-up delay-2">
            <div className="mod-num">M3 // PLAYBOOKS ⭐</div>
            <div className="mod-icon">📖</div>
            <div className="mod-title">Playbook Engine</div>
            <div className="mod-desc">
              Command-level step-by-step playbooks for Ransomware, Phishing, Unauthorized Access,
              Data Exfiltration, and Insider Threats. Each step shows Linux + Windows commands, goal,
              and blocking flag. The core differentiator — non-experts can respond correctly.
            </div>
            <span className="mod-usp">5 attack types covered</span>
          </div>
          <div className="mod-card fade-up delay-1">
            <div className="mod-num">M4 // REPORTS</div>
            <div className="mod-icon">📄</div>
            <div className="mod-title">Incident Report Generator</div>
            <div className="mod-desc">
              Auto-generates DPDP Act 2023 compliant PDF reports with all 8 mandatory fields: breach
              type, data categories, affected persons, timeline, actions taken, and pre-filled
              CERT-In notification template with 6-hour SLA tracking.
            </div>
            <span className="mod-usp">DPDP S.8(6) native</span>
          </div>
          <div className="mod-card fade-up delay-2">
            <div className="mod-num">M5 // DASHBOARD</div>
            <div className="mod-icon">📊</div>
            <div className="mod-title">ZeroDashboard</div>
            <div className="mod-desc">
              Central visibility into your security posture. Live alert feed, incident heatmap by
              day/hour, MTTD and MTTR trend lines, incident counts by type, sprint progress and team
              hours. Shows management what they need without a SOC background.
            </div>
            <span className="mod-usp">MTTD · MTTR · Heatmap</span>
          </div>
        </div>
      </section>

      <section id="compare">
        <div className="section-label">vs. Existing Tools</div>
        <div className="section-title fade-up">
          Why not just use
          <br />
          Wazuh or TheHive?
        </div>
        <div className="section-sub fade-up delay-1">
          Each existing tool solves one layer. ZeroRespond stitches the entire workflow together — at
          zero cost, with India-first design.
        </div>

        <div className="fade-up delay-2" style={{ overflowX: 'auto', marginTop: '60px' }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Detection</th>
                <th>Guided Playbooks</th>
                <th>Case Manager</th>
                <th>DPDP Reports</th>
                <th>Self-Hostable</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="our-row">
                <td>
                  <div className="tool-name" style={{ color: 'var(--accent)' }}>
                    ZeroRespond
                  </div>
                  <div className="tool-sub">// Team Zero</div>
                </td>
                <td>
                  <span className="chk-yes">✓</span>
                </td>
                <td>
                  <span className="chk-yes">✓</span>
                </td>
                <td>
                  <span className="chk-yes">✓</span>
                </td>
                <td>
                  <span className="chk-yes">✓</span>
                </td>
                <td>
                  <span className="chk-yes">✓</span>
                </td>
                <td>
                  <span className="price-chip pc-free">₹0 Free</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="tool-name">Wazuh</div>
                  <div className="tool-sub">// Detection only</div>
                </td>
                <td>
                  <span className="chk-yes">✓</span>
                </td>
                <td>
                  <span className="chk-no">✗</span>
                </td>
                <td>
                  <span className="chk-no">✗</span>
                </td>
                <td>
                  <span className="chk-no">✗</span>
                </td>
                <td>
                  <span className="chk-yes">✓</span>
                </td>
                <td>
                  <span className="price-chip pc-free">Free</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="tool-name">TheHive</div>
                  <div className="tool-sub">// Case management</div>
                </td>
                <td>
                  <span className="chk-no">✗</span>
                </td>
                <td>
                  <span className="chk-no">✗</span>
                </td>
                <td>
                  <span className="chk-yes">✓</span>
                </td>
                <td>
                  <span className="chk-no">✗</span>
                </td>
                <td>
                  <span className="chk-yes">✓</span>
                </td>
                <td>
                  <span className="price-chip pc-free">Free</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="tool-name">DFIR-IRIS</div>
                  <div className="tool-sub">// Enterprise forensics</div>
                </td>
                <td>
                  <span className="chk-no">✗</span>
                </td>
                <td>
                  <span className="chk-part">~</span>
                </td>
                <td>
                  <span className="chk-yes">✓</span>
                </td>
                <td>
                  <span className="chk-no">✗</span>
                </td>
                <td>
                  <span className="chk-yes">✓</span>
                </td>
                <td>
                  <span className="price-chip pc-free">Free</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="tool-name">Splunk</div>
                  <div className="tool-sub">// Enterprise SIEM</div>
                </td>
                <td>
                  <span className="chk-yes">✓</span>
                </td>
                <td>
                  <span className="chk-part">~</span>
                </td>
                <td>
                  <span className="chk-part">~</span>
                </td>
                <td>
                  <span className="chk-no">✗</span>
                </td>
                <td>
                  <span className="chk-part">~</span>
                </td>
                <td>
                  <span className="price-chip pc-high">$50K+/yr</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="dpdp" id="dpdp">
        <div className="section-label">Compliance</div>
        <div className="section-title fade-up">
          DPDP Act 2023 —
          <br />
          <span style={{ color: 'var(--purple)' }}>Built in, not bolted on.</span>
        </div>
        <div className="section-sub fade-up delay-1">
          India&apos;s Digital Personal Data Protection Act 2023 Section 8(6) mandates organizations
          notify CERT-In and affected individuals of a data breach. ZeroRespond auto-generates the
          exact required format.
        </div>

        <div className="dpdp-inner">
          <div className="fade-up delay-1">
            <div className="dpdp-law" style={{ marginBottom: '20px' }}>
              <div className="law-title">DPDP ACT 2023 — SECTION 8(6)</div>
              <blockquote>
                &quot;A Data Fiduciary shall notify the Board and each affected Data Principal of a
                personal data breach in such form and manner and within such period as may be
                prescribed.&quot;
              </blockquote>
              <div className="law-ref">
                // notification window: 6 hours from discovery · to: incident@cert-in.org.in
              </div>
            </div>
            <div className="dpdp-sla">
              <div className="sla-num">6h</div>
              <div className="sla-txt">
                <h4>CERT-In Notification SLA</h4>
                <p>
                  ZeroRespond tracks time-from-detection and shows a green / red badge.
                  Auto-generates pre-filled notification form.
                </p>
              </div>
            </div>
          </div>

          <div className="fade-up delay-2">
            <p
              style={{
                fontSize: '13px',
                color: 'var(--muted)',
                fontFamily: 'var(--font-mono)',
                marginBottom: '16px',
              }}
            >
              // 8 fields ZeroRespond auto-fills in every report
            </p>
            <div className="dpdp-fields">
              <div className="dpdp-field">
                <span className="df-num">01</span>
                <span className="df-name">Breach Type</span>
                <span className="df-how">dropdown → db</span>
              </div>
              <div className="dpdp-field">
                <span className="df-num">02</span>
                <span className="df-name">Data Categories Affected</span>
                <span className="df-how">tags in case</span>
              </div>
              <div className="dpdp-field">
                <span className="df-num">03</span>
                <span className="df-name">Approx. Persons Affected</span>
                <span className="df-how">number field</span>
              </div>
              <div className="dpdp-field">
                <span className="df-num">04</span>
                <span className="df-name">Date &amp; Time of Discovery</span>
                <span className="df-how">wazuh timestamp</span>
              </div>
              <div className="dpdp-field">
                <span className="df-num">05</span>
                <span className="df-name">Date &amp; Time of Breach (est.)</span>
                <span className="df-how">analyst entry</span>
              </div>
              <div className="dpdp-field">
                <span className="df-num">06</span>
                <span className="df-name">Actions Taken</span>
                <span className="df-how">from playbook steps</span>
              </div>
              <div className="dpdp-field">
                <span className="df-num">07</span>
                <span className="df-name">CERT-In Notification</span>
                <span className="df-how">pre-filled template</span>
              </div>
              <div className="dpdp-field">
                <span className="df-num">08</span>
                <span className="df-name">DPO Contact Details</span>
                <span className="df-how">org profile → auto</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how">
        <div className="section-label">How It Works</div>
        <div className="section-title fade-up">
          From zero to incident
          <br />
          response in 3 steps
        </div>

        <div className="how-grid">
          <div className="how-step fade-up">
            <div className="hs-icon">🐳</div>
            <div className="hs-title">1. Deploy with Docker</div>
            <div className="hs-desc">
              Clone the repo, copy .env.example to .env, run docker compose up -d. All services
              start: backend, frontend, PostgreSQL, Wazuh connection. No manual setup.
            </div>
            <div className="hs-tag">// 1 command · works on any Linux server</div>
          </div>
          <div className="how-step fade-up delay-1">
            <div className="hs-icon">🔗</div>
            <div className="hs-title">2. Connect Your Systems</div>
            <div className="hs-desc">
              Install Wazuh agents on your servers (5-minute process). ZeroRespond starts receiving
              logs and firing detection rules immediately. No configuration required for basic usage.
            </div>
            <div className="hs-tag">// Windows + Linux + firewalls + web logs</div>
          </div>
          <div className="how-step fade-up delay-2">
            <div className="hs-icon">🛡️</div>
            <div className="hs-title">3. Respond to Incidents</div>
            <div className="hs-desc">
              When an attack is detected, ZeroRespond opens a case, assigns the correct playbook, and
              walks your team through each step. Then auto-generates the DPDP report.
            </div>
            <div className="hs-tag">// detect → case → playbook → PDF report</div>
          </div>
        </div>
      </section>

      <section className="deploy" id="deploy">
        <div className="deploy-inner fade-up">
          <div className="section-label" style={{ textAlign: 'center' }}>
            Get Started
          </div>
          <h2
            className="section-title"
            style={{
              fontSize: 'clamp(40px,5vw,68px)',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            Your first line of
            <br />
            cyber defence.
            <br />
            <span style={{ color: 'var(--accent)' }}>Starts today.</span>
          </h2>
          <p
            className="section-sub"
            style={{
              textAlign: 'center',
              margin: '0 auto 40px',
              maxWidth: 'none',
            }}
          >
            Self-hosted. Open source. Zero licensing cost. DPDP-compliant out of the box.
            <br />
            Built for organizations that can&apos;t afford enterprise tools.
          </p>

          <div className="deploy-cmd">
            <code id="deployCmd">{DEPLOY_COMMAND}</code>
            <button type="button" className="copy-btn" onClick={handleCopy}>
              {copyLabel}
            </button>
          </div>

          <div className="deploy-badges">
            <div className="dbadge">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Open Source
            </div>
            <div className="dbadge">🐳 Docker Ready</div>
            <div className="dbadge">🇮🇳 India-First</div>
            <div className="dbadge">⚡ DPDP Compliant</div>
            <div className="dbadge">🔒 Self-Hosted</div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a href={README_URL} className="btn-hero btn-hero-primary" target="_blank" rel="noopener noreferrer">
              🐳 Docker Deploy Guide
            </a>
            <a href={README_URL} className="btn-hero btn-hero-secondary" target="_blank" rel="noopener noreferrer">
              📖 Documentation
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <a
              className="nav-logo"
              href="#top"
              style={{ textDecoration: 'none' }}
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <div className="logo-mark">ZR</div>
              <span className="logo-text" style={{ fontSize: '20px' }}>
                Zero<span>Respond</span>
              </span>
            </a>
            <p>
              Incident Response for every organization. Open source, self-hosted, DPDP-compliant —
              built by Team Zero at Kumaraguru College of Technology.
            </p>
          </div>
          <div className="footer-col">
            <h5>Platform</h5>
            <a href="#modules">Detection Feed</a>
            <a href="#modules">Case Manager</a>
            <a href="#modules">Playbook Engine</a>
            <a href="#modules">Report Generator</a>
            <a href="#modules">ZeroDashboard</a>
          </div>
          <div className="footer-col">
            <h5>Docs</h5>
            <a href={README_URL} target="_blank" rel="noopener noreferrer">
              Quick Start
            </a>
            <a href={README_URL} target="_blank" rel="noopener noreferrer">
              Docker Setup
            </a>
            <a href={README_URL} target="_blank" rel="noopener noreferrer">
              API Reference
            </a>
            <a href="#dpdp">DPDP Compliance</a>
            <a href={README_URL} target="_blank" rel="noopener noreferrer">
              Playbook Guide
            </a>
          </div>
          <div className="footer-col">
            <h5>Team Zero</h5>
            <a href={REPO_ROOT} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={README_URL} target="_blank" rel="noopener noreferrer">
              Sprint Plan
            </a>
            <a href={README_URL} target="_blank" rel="noopener noreferrer">
              Architecture
            </a>
            <a href={REPO_ROOT} target="_blank" rel="noopener noreferrer">
              Contact
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © 2026 Team Zero · Kumaraguru College of Technology · Batch 2023–2027 ·{' '}
            <a href="https://zerorespond.netlify.app" target="_blank" rel="noopener noreferrer">
              zerorespond.netlify.app
            </a>
          </p>
          <div className="footer-tags">
            <span className="ftag">Wazuh 4.7</span>
            <span className="ftag">FastAPI</span>
            <span className="ftag">React 18</span>
            <span className="ftag">PostgreSQL</span>
            <span className="ftag">Docker</span>
            <span className="ftag">ISO 27035</span>
          </div>
        </div>
      </footer>
    </>
  )
}
