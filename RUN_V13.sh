#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")"
echo "=========================================="
echo " BINIYAM V13 — REAL PROVIDER LAUNCH BUILD"
echo "=========================================="
echo
echo "Checking files..."
python3 -m py_compile server.py core/*.py providers/*.py providers/casino_api_pro_provider.py
echo "Python syntax: OK"
echo
echo "Starting server on http://127.0.0.1:9500"
echo "After startup, verify: http://127.0.0.1:9500/api/version"
echo
exec python3 server.py
