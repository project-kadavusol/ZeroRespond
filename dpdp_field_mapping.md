# DPDP Act 2023 - Incident Report Field Mapping

This document maps the legal requirements of India's Digital Personal Data Protection Act, 2023 (Section 8) and CERT-In's 6-hour reporting mandate to the fields we need in our ZeroRespond database.

**ATTN Ragul & Kavin:** Please ensure your database schema and frontend forms capture these exact data points so the PDF report generator (Module 4) can pull them accurately.

| DPDP/CERT-In Required Field | Legal Requirement | How ZeroRespond Captures It (Action Item) |
| :--- | :--- | :--- |
| **Breach Type** | Nature of the incident (Ransomware, privilage escalation etc.) | Dropdown field in Case Manager UI (`breach_type`) |
| **Data Categories** | What types of personal data were compromised | Multi-select tags (PII, Financial, Health, Credentials) |
| **Persons Affected** | Approximate number of data principals affected | Integer field in Case Manager (`persons_affected`) |
| **Discovery Time** | Date and time of detecting the breach (IST) | Auto-captured from Wazuh alert timestamp (`detected_at`) |
| **Breach Time (est.)** | Estimated date and time the breach began | Analyst-entered datetime field in Case Manager (`breach_est_at`) |
| **Actions Taken** | Containment and remediation steps executed | Auto-populated from completed Playbook steps with timestamps |
| **CERT-In Notification** | Mandatory 6-hour window reporting format | Prithiv will generate a pre-filled template block in the PDF |
| **DPO Contact** | Data Protection Officer name and contact details | One-time org profile setup during deployment (`dpo_name`, `dpo_email`) |
