from flask import Flask, request, jsonify, render_template_string
from datetime import datetime

app = Flask(__name__)
alerts = []
DASHBOARD_HTML = """
<!DOCTYPE html>
<html>
<head>
<title>Wazuh SOC Dashboard</title>
<style>
body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f9; }
h1 { color: #333; }
.alert { background: white; padding: 15px; margin-bottom: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.alert-info { border-left: 5px solid #17a2b8; }
.alert-warning { border-left: 5px solid #ffc107; }
.alert-critical { border-left: 5px solid #dc3545; }
</style>
</head>
<body>
<h1>Wazuh Live Alerts</h1>
{% for alert in alerts|reverse %}
<div class="alert {% if alert.level >= 12 %}alert-critical{% elif alert.level >= 7 %}alert-warning{% else %}alert-info{% endif %}">
<strong>[{{ alert.time }}] Level {{ alert.level }} - {{ alert.description }}</strong><br>
Agent: {{ alert.agent }} ({{ alert.ip }}) <br>
Rule ID: {{ alert.rule_id }}
</div>
{% else %}
<p>Waiting for alerts...</p>
{% endfor %}
</body>
</html>
"""

@app.route('/webhook', methods=['POST'])
def wazuh_webhook():
    data = request.json
    if not data:
        return jsonify({'error': 'No JSON payload'}), 400

    rule = data.get('rule', {})
    agent = data.get('agent', {})
    win_eventdata = data.get('data', {}).get('win', {}).get('eventdata', {})
    parsed_alert = {
        'time': data.get('timestamp', datetime.now().isoformat()),
        'rule_id': rule.get('id', 'N/A'),
        'level': rule.get('level', 0),
        'description': rule.get('description', 'N/A'),
        'mitre_id': (rule.get('mitre', {}).get('id') or ['N/A'])[0],
        'agent': agent.get('name', 'Unknown'),
        'ip': agent.get('ip', 'N/A'),
        'source_ip': win_eventdata.get('ipAddress', 'N/A'),
        'target_user': win_eventdata.get('targetUserName', 'N/A'),
        'threat_type': 'brute_force',
    }

    alerts.append(parsed_alert)
    if len(alerts) > 50:
        alerts.pop(0)

    return jsonify({'status': 'success'}), 200

@app.route('/api/v1/alerts', methods=['GET'])
def get_alerts():
    """Endpoint for M2 (Case Manager) to fetch parsed incident records."""
    return jsonify({
        'status': 'success',
        'count': len(alerts),
        'data': alerts
    }), 200

@app.route('/')
def dashboard():
    return render_template_string(DASHBOARD_HTML, alerts=alerts)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
