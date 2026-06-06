import json
import httpx

url = 'http://127.0.0.1:8000/api/pipeline/run'
payload = {"domain": "example.com"}
resp = httpx.post(url, json=payload, timeout=10.0)
print(json.dumps(resp.json(), indent=2))
