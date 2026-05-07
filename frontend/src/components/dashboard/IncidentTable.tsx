import { Link } from 'react-router-dom'
import { SeverityBadge } from '../SeverityBadge'
import type { IncidentRow } from '../../mock/fixtures'
import {
  incidentStatusBadgeClass,
  pseudoMttdMinutes,
} from '../../lib/incidentDisplay'

type IncidentTableProps = {
  rows: IncidentRow[]
}

export function IncidentTable({ rows }: IncidentTableProps) {
  return (
    <div className="tbl-wrap">
        <table className="zr-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Severity</th>
              <th>Status</th>
              <th>MTTD</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="td-id">
                  <Link to={`/incidents/${encodeURIComponent(row.id)}`}>{row.id}</Link>
                </td>
                <td>
                  <div className="td-title">{row.attackType}</div>
                  <div className="td-sub">{row.assignee} · {row.opened}</div>
                </td>
                <td>
                  <SeverityBadge severity={row.severity} />
                </td>
                <td>
                  <span className={incidentStatusBadgeClass(row.status)}>{row.status}</span>
                </td>
                <td style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>
                  {pseudoMttdMinutes(row.id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  )
}
