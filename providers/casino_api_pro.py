import os
import json
import subprocess

BASE_URL = os.getenv(
    'CASINO_API_BASE_URL',
    'https://api.casinoapipro.com/v1'
).rstrip('/')


def _request(method, path, payload=None, token=None):
    url = f"{BASE_URL}{path}"

    cmd = [
        "curl",
        "-sS",
        "-X", method,
        url,
        "-H", "Content-Type: application/json",
        "-H", "Accept: application/json",
        "-w", "\n__HTTP_STATUS__:%{http_code}"
    ]

    if token:
        cmd.extend([
            "-H",
            f"Authorization: Bearer {token}"
        ])

    if payload is not None:
        cmd.extend([
            "--data",
            json.dumps(payload)
        ])

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30
        )
    except subprocess.TimeoutExpired:
        raise RuntimeError("Casino API request timed out")

    if result.returncode != 0:
        error = result.stderr.strip()
        raise RuntimeError(
            f"Casino API curl failed: {error or 'unknown curl error'}"
        )

    output = result.stdout
    marker = "\n__HTTP_STATUS__:"

    if marker not in output:
        raise RuntimeError("Casino API returned an invalid response")

    body, status_text = output.rsplit(marker, 1)

    try:
        status = int(status_text.strip())
    except ValueError:
        raise RuntimeError("Casino API returned an invalid HTTP status")

    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        raise RuntimeError(
            f"Casino API returned non-JSON HTTP {status}: {body[:500]}"
        )

    if status >= 400:
        raise RuntimeError(
            f"Casino API HTTP {status}: {data}"
        )

    return data


def get_access_token():
    key = os.getenv('CASINO_API_KEY', '').strip()
    secret = os.getenv('CASINO_API_SECRET', '').strip()

    if not key or not secret:
        raise RuntimeError(
            'Casino API credentials are missing. '
            'Put CASINO_API_KEY and CASINO_API_SECRET in .env'
        )

    auth = _request(
        'POST',
        '/auth/token',
        {
            'api_key': key,
            'api_secret': secret
        }
    )

    token = auth.get('access_token')

    if not token:
        raise RuntimeError(
            'Casino API did not return an access token'
        )

    return token


def list_games():
    token = get_access_token()
    return _request('GET', '/catalogue', token=token)


def test_connection():
    games = list_games()

    if isinstance(games, dict):
        items = games.get('games', [])
    else:
        items = games

    return {
        'ok': True,
        'game_count': len(items) if isinstance(items, list) else None,
    }


def create_session(
    player_id,
    game_id,
    currency=None,
    player_name='Demo Player',
    return_url=None
):
    token = get_access_token()

    if not currency:
        currency = os.getenv(
            'CASINO_API_CURRENCY',
            'GHS'
        ).strip().upper()

    if not return_url:
        return_url = os.getenv(
            'BINIYAM_RETURN_URL',
            'http://127.0.0.1:9500/'
        )

    payload = {
        'game_id': game_id,
        'player_id': player_id,
        'currency': currency,
        'player_name': player_name,
        'return_url': return_url
    }

    return _request(
        'POST',
        '/sessions',
        payload,
        token=token
    )
