import json
import sys
from pathlib import Path
from datetime import datetime

FILE = Path("data/deposit_requests.json")

if len(sys.argv) != 3:
    print("Usage:")
    print("  python3 admin_verify_deposit.py REQUEST_ID VERIFIED")
    print("  python3 admin_verify_deposit.py REQUEST_ID REJECTED")
    raise SystemExit(1)

request_id = sys.argv[1]
new_status = sys.argv[2].upper()

if new_status not in ("VERIFIED", "REJECTED"):
    print("Status must be VERIFIED or REJECTED.")
    raise SystemExit(1)

if not FILE.exists():
    print("No deposit requests found.")
    raise SystemExit(1)

try:
    requests = json.loads(FILE.read_text(encoding="utf-8"))
except Exception as e:
    print(f"Could not read deposit requests: {e}")
    raise SystemExit(1)

found = None

for request in requests:
    if request.get("id") == request_id:
        found = request
        break

if found is None:
    print(f"Request not found: {request_id}")
    raise SystemExit(1)

if found.get("status") != "PENDING":
    print(f"Request is already {found.get('status')}.")
    raise SystemExit(1)

found["status"] = new_status
found["verified_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

tmp = FILE.with_suffix(".tmp")
tmp.write_text(json.dumps(requests, indent=2), encoding="utf-8")
tmp.replace(FILE)

print(f"Request {request_id} marked {new_status}.")
print(f"Amount: {found.get('amount', 0):.2f} ETB")
print(f"User: {found.get('user_name', '-')}")
print(f"Reference: {found.get('reference', '-')}")
