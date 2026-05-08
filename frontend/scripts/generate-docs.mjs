/**
 * generate-docs.mjs
 *
 * Generates frontend/FRONTEND_DOCS.docx — Manikandan's Module 5 documentation.
 * Run manually:  node frontend/scripts/generate-docs.mjs
 * Runs automatically via the `postbuild` npm script and the pre-commit git hook.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  UnderlineType,
} from 'docx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'FRONTEND_DOCS.docx')

// ── Helpers ────────────────────────────────────────────────────────────────

const ACCENT = '00C49F'
const DARK = '0F1320'
const MUTED = '8895B3'

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({ text, bold: true, color: '00E5B0', size: 32 })],
  })
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, color: '3B7CFF', size: 26 })],
  })
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 60 },
    children: [new TextRun({ text, bold: true, size: 22 })],
  })
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 20, color: opts.muted ? MUTED : undefined, ...opts })],
  })
}

function mono(text) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    shading: { type: ShadingType.SOLID, color: 'F4F4F4' },
    indent: { left: 360 },
    children: [new TextRun({ text, font: 'Courier New', size: 18, color: '333333' })],
  })
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 20 })],
  })
}

function separator() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: { bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 6 } },
    children: [],
  })
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    tableHeader: isHeader,
    children: cells.map(
      (text) =>
        new TableCell({
          shading: isHeader ? { type: ShadingType.SOLID, color: '0F1320' } : undefined,
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: String(text),
                  bold: isHeader,
                  color: isHeader ? 'E8EEFF' : '111111',
                  size: 18,
                }),
              ],
            }),
          ],
        })
    ),
  })
}

function simpleTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableRow(headers, true),
      ...rows.map((r) => tableRow(r)),
    ],
  })
}

// ── Document content ───────────────────────────────────────────────────────

const now = new Date().toLocaleString('en-IN', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'Asia/Kolkata',
})

const doc = new Document({
  creator: 'Manikandan — Team Zero',
  title: 'ZeroRespond Frontend Documentation — Module 5',
  description: 'Technical documentation for ZeroDashboard and the landing page.',
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 20 } },
    },
  },
  sections: [
    {
      properties: {},
      children: [
        // ── Title ──────────────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 200 },
          children: [
            new TextRun({ text: 'ZeroRespond', bold: true, size: 52, color: '00E5B0' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 80 },
          children: [
            new TextRun({ text: 'Module 5 — Frontend Documentation', bold: true, size: 32 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 60 },
          children: [
            new TextRun({ text: 'ZeroDashboard & Landing Page', size: 24, color: MUTED }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 60 },
          children: [
            new TextRun({ text: `Manikandan · Team Zero · Kumaraguru College of Technology`, size: 20, color: MUTED }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 300 },
          children: [
            new TextRun({ text: `Generated: ${now}`, size: 18, italics: true, color: MUTED }),
          ],
        }),

        separator(),

        // ── 1. Overview ────────────────────────────────────────────────────
        h1('1. Overview'),
        p('Module 5 is the central real-time UI for ZeroRespond. It consists of two independently deployable React applications:'),
        bullet('ZeroDashboard (frontend/) — the operational security dashboard used by incident responders'),
        bullet('Landing Page (landing/) — the public-facing marketing and documentation site'),
        p('Both are built with React 19 + Vite 6, share the same design language (dark theme, teal accent), and are managed as npm workspaces under the repository root.'),

        separator(),

        // ── 2. Tech Stack ─────────────────────────────────────────────────
        h1('2. Technology Stack'),
        simpleTable(
          ['Technology', 'Version', 'Usage'],
          [
            ['React', '19.2.x', 'UI framework — both apps'],
            ['Vite', '6.3.7', 'Dev server and production bundler'],
            ['TypeScript', '~6.0.x', 'Type safety across all source files'],
            ['Tailwind CSS v4', '4.2.x', 'Utility classes (dashboard only)'],
            ['react-router-dom', '7.x', 'Client-side routing (dashboard only)'],
            ['Recharts', '3.x', 'Line, bar, pie, and heatmap charts (dashboard)'],
            ['ESLint', '10.x', 'Code quality enforcement'],
            ['Docker + nginx', 'latest', 'Production container for both apps'],
          ]
        ),

        separator(),

        // ── 3. ZeroDashboard ──────────────────────────────────────────────
        h1('3. ZeroDashboard (frontend/)'),

        h2('3.1 Architecture'),
        p('Single-page application served from frontend/dist by nginx in production. In development, Vite provides HMR at http://127.0.0.1:5173.'),
        p('Entry: frontend/src/main.tsx → BrowserRouter → App.tsx route table → MainLayout shell → page components.'),
        p('All styles are in frontend/src/zerorespond-ui.css (scoped under .zr-app) plus Tailwind utilities via frontend/src/index.css.'),

        h2('3.2 Routes & Pages'),
        simpleTable(
          ['Route', 'Component', 'Description'],
          [
            ['/dashboard', 'DashboardPage', 'KPI cards, incident table, live alert feed, MTTD chart, category bar, alert heatmap'],
            ['/incidents', 'IncidentsPage', 'Full incident list with toolbar, filters, search, and new case modal'],
            ['/incidents/:id', 'IncidentDetailPage', 'Alert summary, incident phase strip, timeline, playbook step-through, evidence, notes'],
            ['/alerts', 'AlertsPage', 'Full live Wazuh alert feed (mock in demo; WebSocket in production)'],
            ['/metrics', 'MetricsPage', 'MTTD/MTTR line charts, incidents per month bar, severity donut, 35-day activity heatmap'],
            ['/playbooks', 'PlaybooksPage', '5 attack-type playbook cards with severity, steps, and average response time'],
            ['/evidence', 'EvidencePage', 'Evidence vault with filename, case link, SHA-256 hash, and kind tags'],
            ['/reports', 'ReportsPage', 'DPDP and executive report library with PDF download'],
            ['/org-profile', 'OrgProfilePage', 'Organization legal name, DPDP liaison, data region, evidence retention'],
            ['/settings', 'SettingsPage', 'Wazuh integration status, Slack webhook, notification rules, API key management'],
          ]
        ),

        h2('3.3 Components'),
        simpleTable(
          ['Component', 'Location', 'Purpose'],
          [
            ['MainLayout', 'layouts/MainLayout.tsx', 'Fixed topbar (logo, breadcrumb, alerts badge, org name, avatar) + sidebar nav + <Outlet />'],
            ['SeverityBadge', 'components/SeverityBadge.tsx', 'Critical / High / Medium / Low coloured chip'],
            ['DashboardHeatmap', 'components/dashboard/DashboardHeatmap.tsx', 'GitHub-style 7-day × 24-hour alert density grid with hover tooltips and colour legend'],
            ['IncidentDensityHeatmap', 'components/metrics/IncidentDensityHeatmap.tsx', 'GitHub contribution-style 35-day calendar heatmap with day labels, week headers, tooltips, legend'],
            ['IncidentTable', 'components/dashboard/IncidentTable.tsx', 'Responsive table of incident rows with severity bars, attack type, status, assignee'],
            ['IncidentToolbar', 'components/dashboard/IncidentToolbar.tsx', 'Search input, severity filter chips, status filter for incidents page'],
            ['IncidentQueueCards', 'components/dashboard/IncidentQueueCards.tsx', 'Kanban-style card view of open incidents'],
            ['NewCaseModal', 'components/dashboard/NewCaseModal.tsx', 'Modal form to create a new incident case (title, severity, attack type, assignee)'],
            ['LiveAlertCard', 'components/alerts/LiveAlertCard.tsx', 'Single alert row with severity colour bar, rule name, host, and timestamp'],
            ['AlertSummaryCard', 'components/case/AlertSummaryCard.tsx', 'Plain-English summary of triggering alert in case detail'],
            ['IncidentPhaseStrip', 'components/case/IncidentPhaseStrip.tsx', 'Horizontal progress strip: Detected → Case opened → Playbook → Containment → Resolved'],
            ['CaseTimeline', 'components/case/CaseTimeline.tsx', 'Immutable timestamped event log for the incident'],
            ['PlaybookStepList', 'components/case/PlaybookStepList.tsx', 'Numbered step-through with Linux/Windows command tabs and Mark complete button'],
            ['EvidenceList', 'components/case/EvidenceList.tsx', 'Attached artefacts list (filename, size, added timestamp)'],
            ['ResponderNotes', 'components/case/ResponderNotes.tsx', 'Free-text notes textarea for the responder'],
          ]
        ),

        h2('3.4 Mock Data'),
        p('All fixture data lives in frontend/src/mock/fixtures.ts. In Sprint 1 the UI is fully fixture-driven. Sprints 2+ replace fixtures with real API calls.'),
        simpleTable(
          ['Export', 'Type', 'Used by'],
          [
            ['MOCK_INCIDENTS', 'IncidentRow[]', 'DashboardPage, IncidentsPage'],
            ['MOCK_LIVE_ALERTS', 'LiveAlertFixture[]', 'DashboardPage, AlertsPage'],
            ['MOCK_RANSOMWARE_PLAYBOOK', 'PlaybookStep[]', 'IncidentDetailPage'],
            ['MOCK_ALERT_SUMMARY', 'object', 'IncidentDetailPage'],
            ['MOCK_TIMELINE', 'TimelineEntry[]', 'IncidentDetailPage'],
            ['MOCK_EVIDENCE', 'EvidenceItem[]', 'IncidentDetailPage'],
            ['MOCK_EVIDENCE_VAULT', 'EvidenceVaultRow[]', 'EvidencePage'],
            ['MOCK_REPORTS_VAULT', 'ReportVaultRow[]', 'ReportsPage'],
            ['MOCK_ORG_PROFILE', 'object', 'OrgProfilePage'],
            ['MOCK_SETTINGS_INTEGRATIONS', 'object[]', 'SettingsPage'],
            ['MOCK_MTTD_DAYS / MOCK_MTTR_DAYS', 'ChartPoint[]', 'DashboardPage, MetricsPage'],
            ['MOCK_INCIDENTS_BY_MONTH', 'ChartPoint[]', 'MetricsPage'],
            ['MOCK_SEVERITY_MIX', 'PieSlice[]', 'MetricsPage'],
            ['MOCK_HEATMAP_WEEK_HOURS', 'Record<string, number[]>', 'DashboardHeatmap'],
            ['MOCK_HEATMAP_DAYS', '{ label, count }[]', 'IncidentDensityHeatmap'],
          ]
        ),

        h2('3.5 Design System'),
        p('All dashboard styles are scoped under .zr-app in frontend/src/zerorespond-ui.css. No external component library is used.'),
        simpleTable(
          ['CSS Variable', 'Value', 'Role'],
          [
            ['--accent', '#00e5b0', 'Primary CTA, success, active nav item, heatmap high'],
            ['--accent2', '#3b7cff', 'Secondary highlight, case ID links, info states'],
            ['--red', '#ff4555', 'Critical severity, danger'],
            ['--amber', '#ffb300', 'High severity, warning'],
            ['--purple', '#9b6dff', 'Playbook engine, informational'],
            ['--orange', '#ff7043', 'Medium-high severity'],
            ['--bg', '#07080f', 'Page background'],
            ['--bg2', '#0b0d18', 'Topbar, sidebar background'],
            ['--card', '#0f1320', 'Card / panel background'],
            ['--card2', '#131826', 'Hover and secondary card'],
            ['--border', '#1c2236', 'Default border'],
            ['--border2', '#252d47', 'Elevated border'],
            ['--txt', '#e8eeff', 'Primary text'],
            ['--muted', '#5c6b8a', 'Placeholder, secondary label'],
            ['--muted2', '#8895b3', 'Secondary text'],
            ['--mono', 'JetBrains Mono', 'Code, IDs, heatmap labels'],
          ]
        ),

        separator(),

        // ── 4. Landing Page ───────────────────────────────────────────────
        h1('4. Landing Page (landing/)'),

        h2('4.1 Architecture'),
        p('Single-page React app with zero external dependencies beyond React itself. All styles in landing/src/landing.css using CSS custom properties (same design tokens as the dashboard). Deployed to Netlify from landing/dist.'),
        p('Entry: landing/src/main.tsx → App.tsx (single default export with all sections).'),

        h2('4.2 Sections'),
        simpleTable(
          ['Section', 'id / class', 'Description'],
          [
            ['Navbar', '#navbar', 'Fixed top nav with blur backdrop, logo, section links, GitHub + Get Started buttons'],
            ['Hero', '.hero', 'Product pitch headline (Bebas Neue display font), animated live terminal session, hero stats (MTTD, speed, rules, cost)'],
            ['Trust bar', '.trust-bar', 'ISO 27035, DPDP §8(6), tested alert count, CERT-In SLA badges'],
            ['Metrics band', '.metrics-band', '4-cell grid: MTTD 4.2 min, MTTR 22 min, 82% faster, 12% FP rate'],
            ['Problem', '#problem', '4 problem cards + crisis statistics (63M+ SMBs, ₹50K+ enterprise cost)'],
            ['Solution', '#solution', 'Detect → Respond → Report → Track flow strip with hover effect'],
            ['Modules', '#modules', '5 module cards (M1–M5) in a 3-column grid with colour-coded top accent'],
            ['Comparison', '#compare', 'Feature matrix vs Wazuh, TheHive, DFIR-IRIS, Splunk'],
            ['DPDP', '#dpdp', 'Legal quote, SLA countdown widget, 8 auto-filled field list'],
            ['How it works', '#how', '3-step deploy guide (Docker, Connect, Respond)'],
            ['Deploy CTA', '#deploy', 'One-command Docker deploy with clipboard copy + badge row'],
            ['Footer', 'footer', 'Platform links, docs links, Team Zero member names + roles, copyright'],
          ]
        ),

        h2('4.3 Terminal Animation'),
        p('The hero right panel contains a fully animated CLI session (TerminalAnimation component) that loops every ~90 seconds. It demonstrates a real ZeroRespond incident response flow:'),
        bullet('SSH login → zerorespond status (shows all 3 services running)'),
        bullet('zerorespond case attach IR-2024-001 --follow'),
        bullet('Wazuh CRITICAL alert: rule 92011 / ransomware mass rename'),
        bullet('Auto case creation + playbook dispatch'),
        bullet('Step 1: isolate_host — iptables drop rules with confirmation'),
        bullet('Step 2: terminate_payload — lsof → ps → kill -KILL'),
        bullet('Step 3: blackhole_c2 — ip route add + verify'),
        bullet('Steps 4–6: evidence dump, hash manifest, SOC notification'),
        bullet('DPDP §8(6) PDF generation with all fields printed inline'),
        bullet('zerorespond metrics show --json with MTTD/MTTR/FP rate'),
        p('After 10 seconds of pause at the end, the animation restarts from the top.'),
        p('Timing is controlled by delayBeforeRow() which assigns different delays per line class (t-shell, t-detect, t-done, etc.). prefers-reduced-motion is respected — if set, all lines appear instantly.'),

        h2('4.4 Fonts'),
        p('Three Google Fonts loaded in landing/index.html:'),
        bullet('Bebas Neue — display / heading font (hero title, section titles, large numbers)'),
        bullet('Outfit — body copy (weights 300, 400, 500, 600, 700)'),
        bullet('JetBrains Mono — monospace (terminal, code, badges, labels)'),

        separator(),

        // ── 5. Sprint Progress ────────────────────────────────────────────
        h1('5. Sprint Progress'),
        simpleTable(
          ['Sprint', 'Focus', 'Status'],
          [
            ['Sprint 1', 'Tooling, layout, all 10 pages with fixture-driven UI, both heatmaps, full landing page', 'Complete'],
            ['Sprint 2', 'Wire incident list + detail to GET /cases API; severity badges; loading/error states', 'Planned'],
            ['Sprint 3', 'Playbook step completion API; live alert feed via WebSocket; reconnect logic', 'Planned'],
            ['Sprint 4', 'All charts from real data; responsive 768px+; empty/loading states; cross-browser smoke', 'Planned'],
          ]
        ),

        separator(),

        // ── 6. Running Locally ────────────────────────────────────────────
        h1('6. Running Locally'),

        h2('Prerequisites'),
        bullet('Node.js 20+ and npm 10+'),
        bullet('Git'),

        h2('Install'),
        mono('# From repo root (installs all workspaces)'),
        mono('npm install'),

        h2('Start dashboard'),
        mono('npm run dev'),
        mono('# Open http://127.0.0.1:5173'),

        h2('Start landing page'),
        mono('npm run dev:landing'),
        mono('# Open http://127.0.0.1:5174'),

        h2('Both simultaneously'),
        mono('npm run dev:all'),

        h2('Production build'),
        mono('npm run build          # dashboard + landing'),
        mono('npm run build:dashboard'),
        mono('npm run build:landing'),

        separator(),

        // ── 7. Docker ─────────────────────────────────────────────────────
        h1('7. Docker Deployment'),
        mono('# Dashboard only'),
        mono('docker compose up -d --build zerorespond-frontend'),
        mono(''),
        mono('# Landing only'),
        mono('docker compose up -d --build zerorespond-landing'),
        mono(''),
        mono('# Both'),
        mono('docker compose up -d --build zerorespond-frontend zerorespond-landing'),

        separator(),

        // ── 8. Auto-regeneration ──────────────────────────────────────────
        h1('8. Documentation Auto-regeneration'),
        p('This document is auto-generated by frontend/scripts/generate-docs.mjs using the docx npm package.'),
        p('It regenerates automatically on every git commit via .git/hooks/pre-commit. To regenerate manually:'),
        mono('node frontend/scripts/generate-docs.mjs'),
        p('The generated file is frontend/FRONTEND_DOCS.docx and is tracked in git.'),

        separator(),

        // ── Footer note ───────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 0 },
          children: [
            new TextRun({
              text: `ZeroRespond · Module 5 Documentation · Team Zero · KCT · ${new Date().getFullYear()}`,
              size: 16,
              color: MUTED,
              italics: true,
            }),
          ],
        }),
      ],
    },
  ],
})

// ── Write output ───────────────────────────────────────────────────────────
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf)
  console.log(`✓ FRONTEND_DOCS.docx written → ${path.relative(process.cwd(), OUT)}`)
})
