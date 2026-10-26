"""
SQLAlchemy ORM models for ZeroRespond.
Covers Incident Cases, Actionable Playbooks, Cloned Steps, Evidence Locker,
Wazuh Ingested Alerts, Timeline Events, and DPDP Org Profile.
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Boolean, BigInteger
)
from sqlalchemy.orm import relationship

from .database import Base


class Case(Base):
    """
    Incident Case Record.
    Tracks the full lifecycle of a security incident from detection through
    containment, evidence gathering, resolution, and statutory DPDP/CERT-In filing.
    """
    __tablename__ = "cases"

    id = Column(String(32), primary_key=True, index=True)  # e.g., 'IR-08'
    type = Column(String(64), index=True)                  # e.g., 'Ransomware'
    sev = Column(String(16), default="medium")             # critical | high | medium | low
    sev_lbl = Column(String(32), default="Medium")         # Urgent | High | Medium | Low
    title = Column(String(255), nullable=False)
    desc = Column(Text, default="")
    computer = Column(String(128), index=True)             # e.g., 'KCTLAB-WIN01'
    source_ip = Column(String(64), nullable=True)          # Victim host internal IP
    attacker_ip = Column(String(64), nullable=True)        # External attacker IP
    suspect_pid = Column(String(32), nullable=True)        # Identified malware PID
    target_user = Column(String(128), nullable=True)       # Targeted/compromised username
    modified_file = Column(String(512), nullable=True)     # Compromised / encrypted file path
    c2_ip = Column(String(64), nullable=True)              # Command and Control destination IP
    assigned_to = Column(String(128), default="Naveen Kumar")
    
    # Status progression: open -> investigating -> in-progress -> contained -> resolved -> false-positive
    status = Column(String(32), default="open", index=True)
    status_lbl = Column(String(32), default="Open")
    cur_step = Column(Integer, default=1)
    pb = Column(String(64), default="ransomware")          # playbook identifier key

    # DPDP Act 2023 Statutory Fields
    data_categories = Column(Text, default="Student Records, Staff Information")
    persons = Column(Integer, default=0)                   # Number of data principals impacted

    # Timestamps
    opened_time = Column(String(32), nullable=True)        # e.g. '02:13'
    opened_full = Column(String(64), nullable=True)        # e.g. '08 Sep 2026, 02:13 IST'
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    breach_est_at = Column(DateTime, nullable=True)
    contained_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Idempotency / Alert correlation
    alert_hash = Column(String(64), unique=True, index=True, nullable=True)

    # Relationships
    steps = relationship(
        "CaseStep",
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="CaseStep.step_order"
    )
    evidence = relationship(
        "EvidenceItem",
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="EvidenceItem.id.desc()"
    )
    timeline = relationship(
        "TimelineEvent",
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="TimelineEvent.id.asc()"
    )


class Playbook(Base):
    """
    Master Playbook Template.
    Standardized Incident Response Procedures aligned with NIST SP 800-61 and ISO 27035.
    """
    __tablename__ = "playbooks"

    id = Column(String(32), primary_key=True)              # 'ransomware', 'bruteforce', etc.
    name = Column(String(128), nullable=False)
    mitre_tag = Column(String(128), nullable=True)
    iso_phase = Column(String(128), nullable=True)
    desc = Column(Text, nullable=True)

    steps = relationship(
        "PlaybookStep",
        back_populates="playbook",
        cascade="all, delete-orphan",
        order_by="PlaybookStep.step_order"
    )


class PlaybookStep(Base):
    """
    Individual Step in a Master Playbook Template.
    Contains dual-platform (Linux & Windows) executable commands and expected outputs.
    """
    __tablename__ = "playbook_steps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    playbook_id = Column(String(32), ForeignKey("playbooks.id", ondelete="CASCADE"), index=True)
    step_order = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    phase = Column(String(64), default="Containment")     # Identification | Containment | Eradication | Recovery
    plain = Column(Text, nullable=False)                  # Plain English guide for non-security IT admin
    linux_cmd = Column(Text, nullable=False)              # Actionable bash command
    windows_cmd = Column(Text, nullable=False)            # Actionable PowerShell command
    expected_outcome = Column(Text, nullable=False)
    is_blocking = Column(Boolean, default=False)

    playbook = relationship("Playbook", back_populates="steps")


class CaseStep(Base):
    """
    Cloned Step for an Active Incident Case.
    Tracks step completion, ISO 27035 execution timestamp, and responder notes.
    """
    __tablename__ = "case_steps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String(32), ForeignKey("cases.id", ondelete="CASCADE"), index=True)
    step_order = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    phase = Column(String(64), default="Containment")
    plain = Column(Text, nullable=False)
    linux_cmd = Column(Text, nullable=False)
    windows_cmd = Column(Text, nullable=False)
    expected_outcome = Column(Text, nullable=False)
    
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    completed_by = Column(String(128), nullable=True)
    notes = Column(Text, nullable=True)

    case = relationship("Case", back_populates="steps")


class EvidenceItem(Base):
    """
    Forensic Evidence Artifact attached to an Incident Case.
    Satisfies ISO 27037 and Indian Evidence Act Section 65B requirements with SHA-256 integrity.
    """
    __tablename__ = "evidence_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String(32), ForeignKey("cases.id", ondelete="CASCADE"), index=True)
    name = Column(String(255), nullable=False)            # e.g., 'screenshot_desktop.png'
    size = Column(String(32), default="0 KB")             # Human readable e.g., '1.4 MB'
    size_bytes = Column(BigInteger, default=0)
    sha256 = Column(String(64), nullable=False)           # Cryptographic integrity digest
    file_path = Column(String(512), nullable=True)        # Location on disk (/app/data/evidence/...)
    category = Column(String(64), default="Forensic Artifact")
    attestation = Column(String(255), default="Chain of custody recorded")
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(String(128), default="System")

    case = relationship("Case", back_populates="evidence")


class TimelineEvent(Base):
    """
    Chronological Incident Log entry.
    Feeds directly into Section 4 (Actions Taken) of the statutory DPDP report.
    """
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String(32), ForeignKey("cases.id", ondelete="CASCADE"), index=True)
    t = Column(String(32), nullable=False)                # Short timestamp label e.g., '02:13'
    a = Column(Text, nullable=False)                      # Action description
    type = Column(String(16), default="done")             # done | active | pending
    user = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="timeline")


class Alert(Base):
    """
    Raw and Parsed Security Anomaly Alert ingested from Wazuh 4.7 SIEM / Module 1.
    """
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    rule_id = Column(String(64), index=True)
    level = Column(Integer, default=0)
    description = Column(Text, default="")
    mitre_id = Column(String(64), nullable=True)
    agent = Column(String(128), default="Unknown")
    agent_ip = Column(String(64), default="N/A")
    source_ip = Column(String(64), default="N/A")
    target_user = Column(String(128), default="N/A")
    threat_type = Column(String(64), default="Uncategorized Threat")
    time = Column(String(64), nullable=False)
    alert_hash = Column(String(64), unique=True, index=True)
    linked_case_id = Column(String(32), nullable=True)
    raw_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class OrgProfile(Base):
    """
    Data Fiduciary Profile.
    Pre-configured institutional parameters injected into every CERT-In & DPDP Section 8(6) report.
    """
    __tablename__ = "org_profile"

    id = Column(Integer, primary_key=True, default=1)
    org_name = Column(String(255), default="Kumaraguru College of Technology")
    org_type = Column(String(128), default="Higher Education")
    city = Column(String(128), default="Coimbatore")
    state = Column(String(128), default="Tamil Nadu")
    registration_id = Column(String(128), default="EDU-TN-CBE-2026-0042")
    address = Column(Text, default="Athipalayam Road, Chinnavedampatti, Coimbatore, Tamil Nadu 641049")
    dpo_name = Column(String(128), default="Dr. S. Ramachandran")
    dpo_title = Column(String(128), default="Data Protection Officer & Head of IT")
    dpo_email = Column(String(128), default="dpo@kct.ac.in")
    dpo_phone = Column(String(64), default="+91 422 266 9401")
    it_head_name = Column(String(128), default="Prethiv Raj")
    cert_in_contact = Column(String(128), default="incident@cert-in.org.in")
