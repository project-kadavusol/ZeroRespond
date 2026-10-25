from sqlalchemy import (
    Column, Integer, String, DateTime, Text, ForeignKey
)
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(String, index=True)
    severity = Column(Integer)                # from Wazuh 'level'
    description = Column(Text)
    mitre_id = Column(String)
    agent = Column(String, index=True)
    agent_ip = Column(String)
    source_ip = Column(String, index=True)
    target_user = Column(String)
    threat_type = Column(String, index=True)
    alert_time = Column(DateTime, index=True)  # real DateTime, not String
    alert_hash = Column(String, unique=True, index=True)  # idempotency
    status = Column(String, default="open")    # open | in_progress | resolved
    created_at = Column(DateTime, default=datetime.utcnow)

    steps = relationship(
        "CaseStep", back_populates="case",
        cascade="all, delete-orphan", order_by="CaseStep.step_order"
    )


class Playbook(Base):
    __tablename__ = "playbooks"

    id = Column(Integer, primary_key=True, index=True)
    threat_type = Column(String, unique=True, index=True)
    title = Column(String)

    steps = relationship(
        "PlaybookStep", back_populates="playbook",
        cascade="all, delete-orphan", order_by="PlaybookStep.step_order"
    )


class PlaybookStep(Base):
    __tablename__ = "playbook_steps"

    id = Column(Integer, primary_key=True, index=True)
    playbook_id = Column(Integer, ForeignKey("playbooks.id", ondelete="CASCADE"))
    step_order = Column(Integer)
    title = Column(String)
    instruction = Column(Text)

    playbook = relationship("Playbook", back_populates="steps")


class CaseStep(Base):
    __tablename__ = "case_steps"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"))
    step_order = Column(Integer)
    title = Column(String)
    instruction = Column(Text)
    is_completed = Column(Integer, default=0)   # 0 = False, 1 = True
    notes = Column(Text, nullable=True)

    case = relationship("Case", back_populates="steps")
