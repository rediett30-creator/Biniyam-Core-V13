# Local game integration

1. Start the platform with `python3 server.py`.
2. Open `http://127.0.0.1:9500`.
3. Click **Open game** on any catalog card.
4. The lobby creates a `biniyam-local` session and opens the game's local `index.html` inside the platform.
5. Replace a game's `index.html` (and add JS/CSS/assets) with your own implementation. Keep the `session_id` query parameter if your game needs to call the platform APIs.

The current Mines demo uses:
- `POST /api/mines/start`
- `POST /api/mines/reveal`
- `POST /api/mines/cashout`
- `GET /api/mines/state?session_id=...`

All wallet activity in this build is virtual play money.
