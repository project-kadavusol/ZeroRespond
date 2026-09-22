Instructions to webhook script
step 1 - add the script in the custom-fapi-flask.py in the integration folder of wazuh
step 2 - edit the ossec.conf file of wazuh add the integration script

<ossec_config>
  <integration>
    <name>custom-fapi-flask</name>
    <hook_url>http://(ip_address):5000/webhook</hook_url>
    <level>11</level>
    <alert_format>json</alert_format>
  </integration>
</ossec_config>

step 3 - restart the wazuh manager 

step 4 - install python-flask package in the desired directory to run the webhook.py file
