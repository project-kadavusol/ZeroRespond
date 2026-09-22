# Wazuh Custom Webhook Integration Guide

Follow these steps to configure a custom Python Flask webhook integration with Wazuh.

---

## Prerequisites
* Administrative root access to the Wazuh Manager.
* Python 3 installed on the target machine where the webhook server will run.

---

## Step 1: Add the Custom Integration Script
Place your custom Python script into the default Wazuh integrations directory:

* **File Location:** `/var/ossec/integrations/custom-fapi-flask.py`

Make sure to assign the proper execution permissions and ownership:

```bash
sudo chmod 750 /var/ossec/integrations/custom-fapi-flask.py
sudo chown root:wazuh /var/ossec/integrations/custom-fapi-flask.py