"""
Database seeder for ZeroRespond.
Populates master Playbooks, actionable Linux & Windows command steps,
initial reference incidents (IR-08, IR-07, IR-06, IR-05), and KCT Org Profile.
"""

from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session

try:
    from app.models import (
        Playbook, PlaybookStep, Case, CaseStep,
        EvidenceItem, TimelineEvent, OrgProfile
    )
except (ImportError, ModuleNotFoundError):
    from .models import (
        Playbook, PlaybookStep, Case, CaseStep,
        EvidenceItem, TimelineEvent, OrgProfile
    )

logger = logging.getLogger("zerorespond.seed")


# ── Master Playbooks ─────────────────────────────────────────────────────────

MASTER_PLAYBOOKS = [
    {
        "id": "ransomware",
        "name": "Ransomware Containment & Recovery SOP",
        "mitre_tag": "T1486 (Data Encrypted for Impact), T1071 (C2)",
        "iso_phase": "ISO 27035: Phase 3 (Containment) & Phase 4 (Eradication)",
        "desc": "Emergency isolation, malware process termination, volatile memory/log preservation, C2 blocking, clean restoration, and statutory DPDP Act §8(6) reporting.",
        "steps": [
            {
                "step_order": 1,
                "title": "Host Network Isolation",
                "phase": "Containment",
                "plain": "Immediately sever all inbound and outbound network communication to halt active encryption and lateral spread across the subnet. Keep the machine powered on so volatile memory evidence is preserved.",
                "linux_cmd": "sudo iptables -I INPUT 1 ! -i lo -j DROP && sudo iptables -I OUTPUT 1 ! -o lo -j DROP",
                "windows_cmd": "netsh advfirewall set allprofiles firewallpolicy blockinbound,blockoutbound",
                "expected_outcome": "Target machine drops all network connectivity. Active lateral infection across SMB/RDP is halted.",
                "is_blocking": True
            },
            {
                "step_order": 2,
                "title": "Identify Malicious Process & Connections",
                "phase": "Identification",
                "plain": "Scan active processes and socket listeners to locate the suspicious ransomware executable, associated PID, and command-and-control (C2) destination IP.",
                "linux_cmd": "ps aux --sort=-%cpu | head -20\nss -tulpn",
                "windows_cmd": "Get-Process | Sort-Object CPU -Descending | Select -First 20\nnetstat -ano",
                "expected_outcome": "Ransomware executable name, PID, and remote connection endpoints are identified and noted.",
                "is_blocking": True
            },
            {
                "step_order": 3,
                "title": "Preserve Volatile Memory & Forensic Logs",
                "phase": "Evidence",
                "plain": "Capture volatile system logs, active process listings, and network state before altering system state. Ensure SHA-256 integrity hash is computed.",
                "linux_cmd": "cp /var/log/syslog /tmp/syslog_dump.txt\ndmesg > /tmp/kernel_dmesg.txt\nsha256sum /tmp/syslog_dump.txt",
                "windows_cmd": "Get-EventLog -LogName Security -Newest 500 | Export-Csv -Path C:\\evid.csv\nipconfig /all > C:\\net.txt",
                "expected_outcome": "Forensic files are securely dumped to /tmp or C:\\, hashed, and attached to the incident evidence locker.",
                "is_blocking": False
            },
            {
                "step_order": 4,
                "title": "Terminate Malicious Ransomware Process",
                "phase": "Eradication",
                "plain": "Force-kill the identified ransomware process to stop active encryption of student, customer, and system files.",
                "linux_cmd": "sudo kill -9 [SUSPECT_PID]",
                "windows_cmd": "Stop-Process -Id [SUSPECT_PID] -Force",
                "expected_outcome": "The suspicious PID terminates; CPU usage returns to baseline, and disk write activity stops.",
                "is_blocking": True
            },
            {
                "step_order": 5,
                "title": "Block Malicious C2 on Host & Perimeter",
                "phase": "Containment",
                "plain": "Block identified command-and-control or extraction IP addresses at host level and upstream gateway to prevent secondary payload staging.",
                "linux_cmd": "sudo ip route add blackhole [C2_IP]/32",
                "windows_cmd": "route add [C2_IP] mask 255.255.255.255 0.0.0.0 -p",
                "expected_outcome": "Host firewall rejects all future outbound handshakes to the attacker IP.",
                "is_blocking": False
            },
            {
                "step_order": 6,
                "title": "Restore Clean Data from Offline Backup",
                "phase": "Recovery",
                "plain": "Verify malware eradication, re-image or clean operating system partitions, and restore encrypted file structures from verified immutable offline snapshots.",
                "linux_cmd": "sudo systemctl status clamav-daemon\nrsync -avz --dry-run /backup/clean/ /data/restored/",
                "windows_cmd": "wbadmin get versions -backupTarget:D:\nStart-MpScan -ScanType FullScan",
                "expected_outcome": "File assets restored cleanly without malware artifacts. System returns to operational status.",
                "is_blocking": False
            }
        ]
    },
    {
        "id": "bruteforce",
        "name": "Credential Access / Brute Force SOP",
        "mitre_tag": "T1110 (Brute Force), T1078 (Valid Accounts)",
        "iso_phase": "ISO 27035: Phase 3 (Containment) & Phase 5 (Hardening)",
        "desc": "Firewall source blocking, targeted account locking, session termination, authentication log review, and credential rotation.",
        "steps": [
            {
                "step_order": 1,
                "title": "Block Attacker Source IP at Firewall",
                "phase": "Containment",
                "plain": "Immediately drop all incoming traffic from the external attacker IP address attempting repeated authentications.",
                "linux_cmd": "sudo iptables -I INPUT 1 -s [ATTACKER_IP] -j DROP",
                "windows_cmd": "netsh advfirewall firewall add rule name=\"Block Attacker\" dir=in action=block remoteip=[ATTACKER_IP]",
                "expected_outcome": "Inbound connection attempts from attacker IP are dropped immediately.",
                "is_blocking": True
            },
            {
                "step_order": 2,
                "title": "Lock Targeted User Accounts",
                "phase": "Containment",
                "plain": "Temporarily lock the targeted username to prevent unauthorized access if the attacker guessed credentials.",
                "linux_cmd": "sudo passwd -l [TARGET_USER]",
                "windows_cmd": "Disable-LocalUser -Name \"[TARGET_USER]\"",
                "expected_outcome": "Targeted user account is locked against further login attempts.",
                "is_blocking": True
            },
            {
                "step_order": 3,
                "title": "Terminate Active Sessions & Purge Tokens",
                "phase": "Eradication",
                "plain": "Force-kill all active SSH, RDP, and interactive sessions for the targeted account.",
                "linux_cmd": "sudo pkill -u [TARGET_USER]",
                "windows_cmd": "quser; logoff [SESSION_ID]",
                "expected_outcome": "All active sessions for the targeted user are severed.",
                "is_blocking": False
            },
            {
                "step_order": 4,
                "title": "Review Authentication Logs for Success",
                "phase": "Analysis",
                "plain": "Inspect audit logs to determine if any login attempts succeeded before the block was implemented.",
                "linux_cmd": "grep 'Accepted' /var/log/auth.log | grep '[ATTACKER_IP]'",
                "windows_cmd": "Get-WinEvent -FilterHashtable @{LogName='Security';Id=4624} -MaxEvents 50",
                "expected_outcome": "Confirmation that no unauthorized logon succeeded (or escalation if breach confirmed).",
                "is_blocking": False
            },
            {
                "step_order": 5,
                "title": "Force Password Rotation & Enable MFA",
                "phase": "Hardening",
                "plain": "Reset the user's password, unlock the account with a temporary complex credential, and enforce MFA.",
                "linux_cmd": "sudo passwd -u [TARGET_USER]; sudo chage -d 0 [TARGET_USER]",
                "windows_cmd": "Enable-LocalUser -Name \"[TARGET_USER]\"; Set-LocalUser -Name \"[TARGET_USER]\" -Password $NewPwd",
                "expected_outcome": "Account secured with new credentials and forced password change on next login.",
                "is_blocking": False
            }
        ]
    },
    {
        "id": "privilege",
        "name": "Privilege Escalation Containment SOP",
        "mitre_tag": "T1068 (Exploitation for Privilege Escalation), T1548 (Abuse Elevation Control)",
        "iso_phase": "ISO 27035: Phase 3 (Containment) & Phase 4 (Eradication)",
        "desc": "Kill unauthorized admin sessions, demote accounts, audit sudoers and scheduled tasks, and invalidate active tokens.",
        "steps": [
            {
                "step_order": 1,
                "title": "Terminate Active Unauthorized Admin Session",
                "phase": "Containment",
                "plain": "Immediately terminate the active session executing unauthorized privileged commands.",
                "linux_cmd": "sudo pkill -9 -u [TARGET_USER]",
                "windows_cmd": "Stop-Process -Id [SUSPECT_PID] -Force",
                "expected_outcome": "Rogue administrative session terminated instantly.",
                "is_blocking": True
            },
            {
                "step_order": 2,
                "title": "Demote or Lock Compromised Account",
                "phase": "Containment",
                "plain": "Remove the account from privileged groups (sudo/wheel/Administrators) and lock it.",
                "linux_cmd": "sudo deluser [TARGET_USER] sudo; sudo passwd -l [TARGET_USER]",
                "windows_cmd": "Remove-LocalGroupMember -Group \"Administrators\" -Member \"[TARGET_USER]\"; Disable-LocalUser -Name \"[TARGET_USER]\"",
                "expected_outcome": "Account stripped of administrative privileges.",
                "is_blocking": True
            },
            {
                "step_order": 3,
                "title": "Audit Sudoers & SUID Binaries",
                "phase": "Analysis",
                "plain": "Search for newly added sudoers rules, modified SUID binaries, or persistence hooks.",
                "linux_cmd": "cat /etc/sudoers.d/*; find / -perm -4000 -type f 2>/dev/null",
                "windows_cmd": "Get-ScheduledTask | Where-Object {$_.Date -gt (Get-Date).AddDays(-1)}",
                "expected_outcome": "Unapproved persistence mechanisms cataloged for removal.",
                "is_blocking": False
            },
            {
                "step_order": 4,
                "title": "Purge Kerberos / Auth Tokens",
                "phase": "Eradication",
                "plain": "Purge active token caches and revoke administrative session cookies.",
                "linux_cmd": "kdestroy -A",
                "windows_cmd": "klist purge",
                "expected_outcome": "Cached Kerberos tickets invalidated across all endpoints.",
                "is_blocking": False
            },
            {
                "step_order": 5,
                "title": "Document Timeline & Generate Report",
                "phase": "Reporting",
                "plain": "Log all discovery and eradication steps into the incident timeline and prepare statutory DPDP notification.",
                "linux_cmd": "echo 'PrivEsc incident contained' >> /var/log/ir_actions.log",
                "windows_cmd": "Write-EventLog -LogName Application -Source \"ZeroRespond\" -EventID 100 -EntryType Information -Message \"PrivEsc contained\"",
                "expected_outcome": "Immutable audit trail preserved for post-incident review.",
                "is_blocking": False
            }
        ]
    },
    {
        "id": "fileintegrity",
        "name": "File Integrity Monitoring (FIM) SOP",
        "mitre_tag": "T1565 (Data Manipulation), T1070 (Indicator Removal)",
        "iso_phase": "ISO 27035: Phase 2 (Analysis) & Phase 5 (Recovery)",
        "desc": "Identify changed critical files, verify cryptographic checksums, restore approved configurations, and re-baseline FIM.",
        "steps": [
            {
                "step_order": 1,
                "title": "Identify Modified Critical Files",
                "phase": "Identification",
                "plain": "Locate the altered files identified by Wazuh syscheck and compare timestamps with expected deployment windows.",
                "linux_cmd": "ls -l [MODIFIED_FILE]; sha256sum [MODIFIED_FILE]",
                "windows_cmd": "Get-FileHash -Path [MODIFIED_FILE] -Algorithm SHA256",
                "expected_outcome": "Cryptographic hash of modified file recorded for forensic comparison.",
                "is_blocking": True
            },
            {
                "step_order": 2,
                "title": "Verify Binary Against Known-Good Package",
                "phase": "Analysis",
                "plain": "Check if the file belongs to an OS package and whether its hash matches the vendor repository.",
                "linux_cmd": "dpkg -V $(dpkg -S [MODIFIED_FILE] | cut -d: -f1) 2>/dev/null",
                "windows_cmd": "sfc /verifyfile=[MODIFIED_FILE]",
                "expected_outcome": "Confirmation whether modification was authorized package upgrade or malicious tampering.",
                "is_blocking": False
            },
            {
                "step_order": 3,
                "title": "Restore File from Trusted Source",
                "phase": "Recovery",
                "plain": "Replace the altered file with a clean verified copy from version control or backup.",
                "linux_cmd": "sudo cp /backup/clean/[MODIFIED_FILE] [MODIFIED_FILE]",
                "windows_cmd": "Copy-Item -Path \"D:\\backup\\[MODIFIED_FILE]\" -Destination \"[MODIFIED_FILE]\" -Force",
                "expected_outcome": "Target file restored to approved configuration.",
                "is_blocking": True
            },
            {
                "step_order": 4,
                "title": "Set File Immutable & Lock Permissions",
                "phase": "Hardening",
                "plain": "Set strict read-only permissions and filesystem immutability to prevent further tampering.",
                "linux_cmd": "sudo chmod 644 [MODIFIED_FILE]; sudo chattr +i [MODIFIED_FILE]",
                "windows_cmd": "icacls \"[MODIFIED_FILE]\" /inheritance:r /grant:r \"SYSTEM:(R)\"",
                "expected_outcome": "File locked against unauthorized writes even by root/admin.",
                "is_blocking": False
            },
            {
                "step_order": 5,
                "title": "Re-baseline Wazuh FIM Database",
                "phase": "Reporting",
                "plain": "Trigger a fresh integrity scan so Wazuh acknowledges the approved restored hash.",
                "linux_cmd": "sudo /var/ossec/bin/wazuh-control restart",
                "windows_cmd": "Restart-Service -Name \"wazuh-agent\"",
                "expected_outcome": "FIM alert clears, and baseline integrity database is synchronized.",
                "is_blocking": False
            }
        ]
    }
]


# ── Initial Reference Cases ──────────────────────────────────────────────────

INITIAL_CASES = [
    {
        "id": "IR-08",
        "type": "Ransomware",
        "sev": "critical",
        "sev_lbl": "Urgent",
        "title": "Ransomware encryption activity on KCTLAB-WIN01",
        "desc": "Files on KCTLAB-WIN01 are being encrypted by ransomware. Rapid containment isolated the system within 2 minutes.",
        "computer": "KCTLAB-WIN01",
        "source_ip": "192.168.10.45",
        "attacker_ip": "185.220.101.5",
        "suspect_pid": "4892",
        "target_user": "faculty_admin",
        "modified_file": "C:\\Finance\\Q3_Report.xlsx.encrypted",
        "c2_ip": "185.220.101.5",
        "assigned_to": "Naveen Kumar",
        "status": "in-progress",
        "status_lbl": "In Progress",
        "cur_step": 3,
        "pb": "ransomware",
        "data_categories": "Student Records, Staff PII",
        "persons": 850,
        "opened_time": "02:13",
        "opened_full": "08 Sep 2026, 02:13 IST",
        "detected_at": datetime.utcnow() - timedelta(hours=3, minutes=15),
        "breach_est_at": datetime.utcnow() - timedelta(hours=3, minutes=45),
        "timeline": [
            {"t": "02:13", "a": "Ransomware detection received from Wazuh and case opened", "type": "done", "user": "System"},
            {"t": "02:15", "a": "Affected computer disconnected from the network via netsh", "type": "done", "user": "Naveen Kumar"},
            {"t": "02:17", "a": "Suspicious process identified for analysis (PID 4892)", "type": "done", "user": "Naveen Kumar"},
            {"t": "02:19", "a": "Preserving evidence and analysing ransomware activity", "type": "active", "user": "Naveen Kumar"}
        ],
        "evidence": [
            {
                "name": "screenshot_desktop.png",
                "size": "1.4 MB",
                "sha256": "9f83acde9234bcf1038e89ad01b44ec92e92c421b8f88722a44be495f82c4710",
                "category": "Screenshot",
                "attestation": "Section 65B IT Act verified"
            },
            {
                "name": "netstat_output.txt",
                "size": "48 KB",
                "sha256": "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
                "category": "Network Capture",
                "attestation": "Volatile network socket snapshot"
            }
        ]
    },
    {
        "id": "IR-07",
        "type": "Brute Force",
        "sev": "high",
        "sev_lbl": "High",
        "title": "SSH Credential Brute Force on srv-web-01",
        "desc": "500 failed login attempts were detected on srv-web-01 from a single external IP in 8 minutes.",
        "computer": "srv-web-01",
        "source_ip": "10.0.1.20",
        "attacker_ip": "198.51.100.77",
        "suspect_pid": None,
        "target_user": "admin",
        "modified_file": None,
        "c2_ip": None,
        "assigned_to": "Ragul",
        "status": "in-progress",
        "status_lbl": "In Progress",
        "cur_step": 4,
        "pb": "bruteforce",
        "data_categories": "Auth Credentials",
        "persons": 240,
        "opened_time": "01:47",
        "opened_full": "08 Sep 2026, 01:47 IST",
        "detected_at": datetime.utcnow() - timedelta(hours=4),
        "breach_est_at": datetime.utcnow() - timedelta(hours=4, minutes=15),
        "timeline": [
            {"t": "01:47", "a": "Brute force detection received and case opened", "type": "done", "user": "System"},
            {"t": "01:49", "a": "Attacker source blocked at firewall (198.51.100.77)", "type": "done", "user": "Ragul"},
            {"t": "01:52", "a": "Targeted accounts locked", "type": "done", "user": "Ragul"},
            {"t": "01:55", "a": "Authentication logs reviewed", "type": "done", "user": "Ragul"},
            {"t": "02:00", "a": "Monitoring for repeated attempts", "type": "active", "user": "Ragul"}
        ],
        "evidence": [
            {
                "name": "auth_logs_01.txt",
                "size": "320 KB",
                "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "category": "Log File",
                "attestation": "Wazuh auth.log extract"
            }
        ]
    },
    {
        "id": "IR-06",
        "type": "Privilege Escalation",
        "sev": "high",
        "sev_lbl": "High",
        "title": "Unauthorized Sudo Elevation on srv-infra-01",
        "desc": "A standard student user executed an unexpected administrative command on the infrastructure server.",
        "computer": "srv-infra-01",
        "source_ip": "10.0.2.14",
        "attacker_ip": "10.0.2.14",
        "suspect_pid": "9124",
        "target_user": "guest_student",
        "modified_file": "/etc/sudoers.d/backdoor",
        "c2_ip": None,
        "assigned_to": "Prethiv Raj",
        "status": "contained",
        "status_lbl": "Contained",
        "cur_step": 3,
        "pb": "privilege",
        "data_categories": "Auth Credentials, System / Network Configuration",
        "persons": 1,
        "opened_time": "23:11",
        "opened_full": "07 Sep 2026, 23:11 IST",
        "detected_at": datetime.utcnow() - timedelta(hours=6),
        "breach_est_at": datetime.utcnow() - timedelta(hours=6, minutes=10),
        "contained_at": datetime.utcnow() - timedelta(hours=5, minutes=45),
        "timeline": [
            {"t": "23:11", "a": "Privilege escalation alert received and case opened", "type": "done", "user": "System"},
            {"t": "23:14", "a": "Rogue administrative session terminated", "type": "done", "user": "Prethiv Raj"},
            {"t": "23:18", "a": "Account disabled and sudoers entry purged", "type": "done", "user": "Prethiv Raj"}
        ],
        "evidence": [
            {
                "name": "sudoers_diff.txt",
                "size": "12 KB",
                "sha256": "f4c98722a44be495f82c47109f83acde9234bcf1038e89ad01b44ec92e92c421",
                "category": "Log File",
                "attestation": "Forensic diff of /etc/sudoers.d"
            }
        ]
    },
    {
        "id": "IR-05",
        "type": "File Integrity Monitoring",
        "sev": "medium",
        "sev_lbl": "Medium",
        "title": "System Password File Modification (/etc/shadow)",
        "desc": "Critical password database was altered outside of approved maintenance windows.",
        "computer": "fs-student-01",
        "source_ip": "10.0.3.5",
        "attacker_ip": None,
        "suspect_pid": None,
        "target_user": "root",
        "modified_file": "/etc/shadow",
        "c2_ip": None,
        "assigned_to": "Kavin",
        "status": "resolved",
        "status_lbl": "Resolved",
        "cur_step": 6,
        "pb": "fileintegrity",
        "data_categories": "Auth Credentials",
        "persons": 450,
        "opened_time": "20:33",
        "opened_full": "07 Sep 2026, 20:33 IST",
        "detected_at": datetime.utcnow() - timedelta(hours=12),
        "breach_est_at": datetime.utcnow() - timedelta(hours=12, minutes=5),
        "contained_at": datetime.utcnow() - timedelta(hours=11, minutes=30),
        "resolved_at": datetime.utcnow() - timedelta(hours=10),
        "timeline": [
            {"t": "20:33", "a": "File integrity detection received and case opened", "type": "done", "user": "System"},
            {"t": "20:35", "a": "Changed files identified (/etc/shadow)", "type": "done", "user": "Kavin"},
            {"t": "20:45", "a": "System restored to approved configuration", "type": "done", "user": "Kavin"},
            {"t": "21:00", "a": "Integrity re-baselined and case closed", "type": "done", "user": "Kavin"}
        ],
        "evidence": [
            {
                "name": "file_change_report.txt",
                "size": "18 KB",
                "sha256": "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
                "category": "Log File",
                "attestation": "Wazuh FIM syscheck diff"
            }
        ]
    }
]


# ── Seeder Logic ─────────────────────────────────────────────────────────────

def seed_database(db: Session):
    """
    Idempotent database seeding.
    Populates playbooks, reference cases, and organization profile if not present.
    """
    # 1. Org Profile
    if not db.query(OrgProfile).first():
        logger.info("Seeding default Data Fiduciary OrgProfile (KCT)...")
        org = OrgProfile(
            id=1,
            org_name="Kumaraguru College of Technology",
            org_type="Higher Education",
            city="Coimbatore",
            state="Tamil Nadu",
            registration_id="EDU-TN-CBE-2026-0042",
            address="Athipalayam Road, Chinnavedampatti, Coimbatore, Tamil Nadu 641049",
            dpo_name="Dr. S. Ramachandran",
            dpo_title="Data Protection Officer & Head of IT",
            dpo_email="dpo@kct.ac.in",
            dpo_phone="+91 422 266 9401",
            it_head_name="Prethiv Raj",
            cert_in_contact="incident@cert-in.org.in"
        )
        db.add(org)
        db.commit()

    # 2. Master Playbooks
    for pb_data in MASTER_PLAYBOOKS:
        existing_pb = db.query(Playbook).filter(Playbook.id == pb_data["id"]).first()
        if not existing_pb:
            logger.info(f"Seeding master Playbook: {pb_data['name']}")
            pb = Playbook(
                id=pb_data["id"],
                name=pb_data["name"],
                mitre_tag=pb_data["mitre_tag"],
                iso_phase=pb_data["iso_phase"],
                desc=pb_data["desc"]
            )
            db.add(pb)
            db.commit()

            for step_data in pb_data["steps"]:
                p_step = PlaybookStep(
                    playbook_id=pb.id,
                    step_order=step_data["step_order"],
                    title=step_data["title"],
                    phase=step_data["phase"],
                    plain=step_data["plain"],
                    linux_cmd=step_data["linux_cmd"],
                    windows_cmd=step_data["windows_cmd"],
                    expected_outcome=step_data["expected_outcome"],
                    is_blocking=step_data["is_blocking"]
                )
                db.add(p_step)
            db.commit()

    # 3. Initial Reference Cases
    for case_data in INITIAL_CASES:
        existing_case = db.query(Case).filter(Case.id == case_data["id"]).first()
        if not existing_case:
            logger.info(f"Seeding reference Incident Case: {case_data['id']} ({case_data['title']})")
            c = Case(
                id=case_data["id"],
                type=case_data["type"],
                sev=case_data["sev"],
                sev_lbl=case_data["sev_lbl"],
                title=case_data["title"],
                desc=case_data["desc"],
                computer=case_data["computer"],
                source_ip=case_data.get("source_ip"),
                attacker_ip=case_data.get("attacker_ip"),
                suspect_pid=case_data.get("suspect_pid"),
                target_user=case_data.get("target_user"),
                modified_file=case_data.get("modified_file"),
                c2_ip=case_data.get("c2_ip"),
                assigned_to=case_data["assigned_to"],
                status=case_data["status"],
                status_lbl=case_data["status_lbl"],
                cur_step=case_data["cur_step"],
                pb=case_data["pb"],
                data_categories=case_data["data_categories"],
                persons=case_data["persons"],
                opened_time=case_data.get("opened_time"),
                opened_full=case_data.get("opened_full"),
                detected_at=case_data.get("detected_at"),
                breach_est_at=case_data.get("breach_est_at"),
                contained_at=case_data.get("contained_at"),
                resolved_at=case_data.get("resolved_at")
            )
            db.add(c)
            db.commit()

            # Clone master playbook steps into CaseStep
            master_pb = db.query(Playbook).filter(Playbook.id == case_data["pb"]).first()
            if master_pb and master_pb.steps:
                for idx, m_step in enumerate(master_pb.steps):
                    # Mark steps prior to cur_step as completed
                    is_done = (idx + 1) < case_data["cur_step"]
                    cs = CaseStep(
                        case_id=c.id,
                        step_order=m_step.step_order,
                        title=m_step.title,
                        phase=m_step.phase,
                        plain=m_step.plain,
                        linux_cmd=m_step.linux_cmd,
                        windows_cmd=m_step.windows_cmd,
                        expected_outcome=m_step.expected_outcome,
                        is_completed=is_done,
                        completed_at=datetime.utcnow() if is_done else None,
                        completed_by=case_data["assigned_to"] if is_done else None,
                        notes=f"Step {idx+1} verified during initial triage." if is_done else None
                    )
                    db.add(cs)
                db.commit()

            # Add timeline events
            for t_item in case_data.get("timeline", []):
                t_ev = TimelineEvent(
                    case_id=c.id,
                    t=t_item["t"],
                    a=t_item["a"],
                    type=t_item.get("type", "done"),
                    user=t_item.get("user", case_data["assigned_to"])
                )
                db.add(t_ev)
            db.commit()

            # Add evidence items
            for ev_item in case_data.get("evidence", []):
                e_it = EvidenceItem(
                    case_id=c.id,
                    name=ev_item["name"],
                    size=ev_item.get("size", "10 KB"),
                    sha256=ev_item["sha256"],
                    category=ev_item.get("category", "Forensic Artifact"),
                    attestation=ev_item.get("attestation", "Recorded during triage")
                )
                db.add(e_it)
            db.commit()

    logger.info("Database seeding check complete.")
