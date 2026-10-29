#!/var/ossec/framework/python/bin/python3
import sys
import json
import requests

def main():
    if len(sys.argv) < 4:
        sys.exit(1)

    alert_file_path = sys.argv[1]
    webhook_url = sys.argv[3]

    try:
        with open(alert_file_path, 'r') as alert_file:
            alert_data = json.load(alert_file)
        headers = {'Content-Type': 'application/json'}
        response = requests.post(webhook_url, json=alert_data, headers=headers, timeout=10)
        if response.status_code >= 400:
            sys.stderr.write(f"ZeroRespond Webhook returned HTTP {response.status_code}: {response.text}\n")
    except Exception as e:
        sys.stderr.write(f"ZeroRespond Integration Error: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
