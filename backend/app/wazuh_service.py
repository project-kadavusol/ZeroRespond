"""
Wazuh SIEM Manager API Client and Diagnostic Service (Module 1 - Naveen Kumar).
Provides transparent connection testing, manager status reporting,
and active agent telemetry for ZeroRespond.
"""

import os
import time
import logging
from typing import Dict, Any, Optional, Tuple, List
import httpx

logger = logging.getLogger("zerorespond.wazuh")

DEFAULT_WAZUH_URL = os.getenv("WAZUH_API_URL", "https://wazuh.manager:55000")
DEFAULT_WAZUH_USER = os.getenv("WAZUH_API_USER", "wazuh-wui")
DEFAULT_WAZUH_PASS = os.getenv("WAZUH_API_PASSWORD", "MyS3cr37P450r.*-")


def get_wazuh_credentials() -> Tuple[str, str, str]:
    """
    Returns (url, user, password) from environment, with sensible defaults.
    """
    url = os.getenv("WAZUH_API_URL", DEFAULT_WAZUH_URL).rstrip("/")
    user = os.getenv("WAZUH_API_USER", DEFAULT_WAZUH_USER)
    password = os.getenv("WAZUH_API_PASSWORD", DEFAULT_WAZUH_PASS)
    return url, user, password


def authenticate_wazuh(
    url: str,
    user: str,
    password: str,
    timeout: float = 4.0
) -> Tuple[Optional[str], str, Optional[str]]:
    """
    Authenticates with Wazuh Manager REST API and retrieves a JWT token.
    Automatically checks candidate endpoints if host resolution fails.
    Returns (token, resolved_url, error_str).
    """
    # Candidate URLs to attempt in order
    candidates = [url.rstrip("/")]
    for fallback in [
        "https://wazuh.manager:55000",
        "https://host.docker.internal:55000",
        "https://172.17.0.1:55000",
        "https://localhost:55000"
    ]:
        if fallback not in candidates:
            candidates.append(fallback)

    last_error = None
    with httpx.Client(verify=False, timeout=timeout) as client:
        for target_url in candidates:
            endpoint = f"{target_url}/security/user/authenticate"
            try:
                resp = client.post(endpoint, auth=(user, password))
                if resp.status_code == 200:
                    data = resp.json()
                    token = data.get("data", {}).get("token")
                    if token:
                        return token, target_url, None
                    return None, target_url, "Wazuh API did not return an authentication token."
                elif resp.status_code == 401:
                    return None, target_url, f"HTTP 401: Invalid credentials for user '{user}'"
                elif resp.status_code == 403:
                    return None, target_url, "HTTP 403: Access forbidden by Wazuh RBAC policies"
                else:
                    last_error = f"HTTP {resp.status_code}: {resp.text[:120]}"
            except (httpx.ConnectError, httpx.ConnectTimeout):
                last_error = f"Cannot reach Wazuh Manager at {target_url} (port 55000 unreachable)."
                continue
            except httpx.TimeoutException:
                last_error = f"Connection to Wazuh Manager at {target_url} timed out."
                continue
            except Exception as e:
                last_error = f"Connection error on {target_url}: {str(e)}"
                continue

    return None, url, last_error or f"Could not connect to Wazuh Manager at {url}"


def check_wazuh_status(
    custom_url: Optional[str] = None,
    custom_user: Optional[str] = None,
    custom_pass: Optional[str] = None,
    timeout: float = 5.0
) -> Dict[str, Any]:
    """
    Tests Wazuh Manager connectivity, measures round-trip latency,
    and queries manager metadata and monitored agent counts.
    """
    def_url, def_user, def_pass = get_wazuh_credentials()
    url = (custom_url or def_url).rstrip("/")
    user = custom_user or def_user
    password = custom_pass or def_pass

    t0 = time.time()
    token, resolved_url, err = authenticate_wazuh(url, user, password, timeout=timeout)
    latency_ms = round((time.time() - t0) * 1000, 1)

    if not token or err:
        return {
            "connected": False,
            "status": "disconnected",
            "url": resolved_url,
            "user": user,
            "latency_ms": latency_ms,
            "error": err or "Failed to authenticate with Wazuh API.",
            "manager": None,
            "agents_summary": {
                "total": 0,
                "active": 0,
                "disconnected": 0
            },
            "agents": []
        }

    # Token acquired; query manager info and agents using the working resolved_url
    headers = {"Authorization": f"Bearer {token}"}
    manager_info = {
        "version": "v4.14.5",
        "name": "wazuh.manager",
        "type": "server",
        "tz": "UTC"
    }
    agents_summary = {"total": 0, "active": 0, "disconnected": 0}
    agents_list: List[Dict[str, Any]] = []

    try:
        with httpx.Client(verify=False, timeout=timeout) as client:
            # 1. Manager info
            try:
                info_resp = client.get(f"{resolved_url}/manager/info", headers=headers)
                if info_resp.status_code == 200:
                    items = info_resp.json().get("data", {}).get("affected_items", [])
                    if items:
                        item = items[0]
                        manager_info = {
                            "version": item.get("version", "v4.14.5"),
                            "name": item.get("name", "wazuh.manager"),
                            "type": item.get("type", "server"),
                            "tz": item.get("tz_name", "UTC")
                        }
            except Exception as e:
                logger.warning(f"Could not fetch manager info: {e}")

            # 2. Agents list
            try:
                agents_resp = client.get(f"{resolved_url}/agents?limit=25", headers=headers)
                if agents_resp.status_code == 200:
                    adata = agents_resp.json().get("data", {})
                    items = adata.get("affected_items", [])
                    total = adata.get("total_affected_items", len(items))
                    active = sum(1 for a in items if a.get("status") == "active")
                    disconnected = total - active
                    agents_summary = {
                        "total": total,
                        "active": active,
                        "disconnected": disconnected
                    }
                    for a in items:
                        os_info = a.get("os", {})
                        os_name = os_info.get("name") if isinstance(os_info, dict) else str(os_info)
                        agents_list.append({
                            "id": a.get("id"),
                            "name": a.get("name"),
                            "ip": a.get("ip"),
                            "os": os_name or "Unknown OS",
                            "status": a.get("status", "disconnected"),
                            "last_keep_alive": a.get("lastKeepAlive")
                        })
            except Exception as e:
                logger.warning(f"Could not fetch agents list: {e}")

        return {
            "connected": True,
            "status": "connected",
            "url": resolved_url,
            "user": user,
            "latency_ms": latency_ms,
            "error": None,
            "manager": manager_info,
            "agents_summary": agents_summary,
            "agents": agents_list
        }

    except Exception as e:
        return {
            "connected": False,
            "status": "degraded",
            "url": resolved_url,
            "user": user,
            "latency_ms": latency_ms,
            "error": f"Error querying Wazuh telemetry: {str(e)}",
            "manager": manager_info,
            "agents_summary": agents_summary,
            "agents": agents_list
        }
