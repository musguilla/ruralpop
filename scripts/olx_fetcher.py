#!/usr/bin/env python3
"""
OLX Portugal Prerendered State Fetcher
Bypasses CloudFront TLS/WAF fingerprinting using curl_cffi Chrome impersonation.
"""

import sys
import json
import re
from curl_cffi import requests

def fetch_olx_ads(url):
    try:
        r = requests.get(url, impersonate="chrome124", timeout=20)
        if r.status_code != 200:
            return {"error": f"HTTP {r.status_code}", "ads": []}

        match = re.search(r'window\.__PRERENDERED_STATE__\s*=\s*\"(.*?)\";', r.text)
        if not match:
            return {"error": "PRERENDERED_STATE not found", "ads": []}

        decoded = json.loads('"' + match.group(1) + '"')
        state = json.loads(decoded)
        ads = state.get("listing", {}).get("listing", {}).get("ads", [])
        return {"ads": ads, "total": len(ads)}
    except Exception as e:
        return {"error": str(e), "ads": []}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing URL argument", "ads": []}))
        sys.exit(1)

    target_url = sys.argv[1]
    result = fetch_olx_ads(target_url)
    print(json.dumps(result))
