from sqlalchemy.orm import Session
from models import Playbook, PlaybookStep


PLAYBOOKS = [
    {
        "threat_type": "Credential Access",
        "title": "RDP Brute Force Response",
        "steps": [
            ("Block the source IP at the perimeter firewall.",
             "Add 192.168.244.128 to the deny list on the edge firewall "
             "and confirm no further SMB/RDP connections from it."),
            ("Disable / lock the targeted account.",
             "Temporarily disable the 'Administrator' account on win-agent1 "
             "and force all its active sessions to log off."),
            ("Force credential rotation.",
             "Reset the Administrator password, invalidate Kerberos tickets "
             "(klist purge), and review recent successful logons for lateral movement."),
            ("Escalate if successful logon detected.",
             "If Event ID 4624 (Logon Type 10) appears from 192.168.244.128, "
             "treat as a confirmed compromise and start IR procedures."),
        ],
    },
    {
        "threat_type": "Command and Control",
        "title": "Malware Drop / C2 Response",
        "steps": [
            ("Isolate the affected host.",
             "Quarantine win-agent1 from the network (EDR isolate or disable NIC)."),
            ("Hash and detonate the dropped file.",
             "Compute SHA256 of the dropped executable; submit to VirusTotal / sandbox."),
            ("Hunt for persistence.",
             "Check Run keys, scheduled tasks, and services for artefacts "
             "created within 10 minutes of the alert."),
        ],
    },
    {
        "threat_type": "Defense Evasion",
        "title": "Log Clearing Response",
        "steps": [
            ("Preserve forensic artefacts.",
             "Immediately back up Security.evtx and System.evtx from the host; "
             "forward them to the SIEM before they can be overwritten."),
            ("Identify the actor.",
             "Correlate Event ID 1102 (audit log cleared) with preceding 4624/4672 "
             "events to identify the account and source IP."),
            ("Contain and escalate.",
             "Disable the responsible account, isolate the host, and start IR."),
        ],
    },
    {
        "threat_type": "Uncategorized Threat",
        "title": "Generic Triage",
        "steps": [
            ("Verify the alert.",
             "Confirm the raw Wazuh alert and rule ID."),
            ("Scope the impact.",
             "Identify affected hosts/users/IPs and whether the activity succeeded."),
            ("Escalate or close.",
             "If benign, resolve with notes; otherwise escalate to IR."),
        ],
    },
]


def seed_playbooks(db: Session) -> None:
    if db.query(Playbook).count() > 0:
        return

    for pb in PLAYBOOKS:
        playbook = Playbook(threat_type=pb["threat_type"], title=pb["title"])
        db.add(playbook)
        db.flush()   # get playbook.id
        for i, (title, instruction) in enumerate(pb["steps"], start=1):
            db.add(PlaybookStep(
                playbook_id=playbook.id,
                step_order=i,
                title=title,
                instruction=instruction,
            ))
    db.commit()
