import json
from pathlib import Path

FILE = Path("data/deposit_requests.json")

if not FILE.exists():
    print("No deposit requests found.")
    raise SystemExit

try:
    requests = json.loads(FILE.read_text(encoding="utf-8"))
except Exception as e:
    print(f"Could not read deposit requests: {e}")
    raise SystemExit(1)

print("\n=== BINIYAM ADMIN — DEPOSIT REQUEST HISTORY ===\n")

if not requests:
    print("No deposit requests.")
else:
    for r in requests:
        print(f"ID        : {r.get('id', '-')}")
        print(f"User      : {r.get('user_name', '-')}")
        print(f"Method    : {str(r.get('method', '-')).upper()}")
        print(f"Amount    : {r.get('amount', 0):.2f} ETB")
        print(f"Reference : {r.get('reference', '-')}")
        print(f"Note      : {r.get('note', '-')}")
        print(f"Created   : {r.get('created_at', '-')}")
        print(f"Status    : {r.get('status', '-')}")
        if r.get("verified_at"):
            print(f"Updated   : {r.get('verified_at')}")
        print("-" * 55)

pending = sum(1 for r in requests if r.get("status") == "PENDING")
verified = sum(1 for r in requests if r.get("status") == "VERIFIED")
rejected = sum(1 for r in requests if r.get("status") == "REJECTED")

print(f"\nTotal requests   : {len(requests)}")
print(f"Pending           : {pending}")
print(f"Verified          : {verified}")
print(f"Rejected          : {rejected}")
