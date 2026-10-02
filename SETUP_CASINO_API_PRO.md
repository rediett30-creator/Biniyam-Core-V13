# BINIYAM V11 — Casino API Pro sandbox launch

## 1. Create `.env`

```bash
cp .env.example .env
nano .env
```

Use your own sandbox credentials:

```env
CASINO_API_BASE_URL=https://api.casinoapipro.com/v1
CASINO_API_KEY=ck_test_...
CASINO_API_SECRET=cs_test_...
```

Never share the secret.

## 2. Run

```bash
python3 server.py
```

Open `http://127.0.0.1:9500`.

## 3. Test the API connection

Open:

`http://127.0.0.1:9500/api/casino-test`

The server calls the provider using the credentials in `.env` and reports the number of games returned. The secret is never returned to the browser.

## 4. Launch the provider game

Use **Mines — Casino API Pro** and tap **Open game**.

BINIYAM creates a fresh provider session using the game slug `mines`. The provider returns a short-lived `launch_url`; BINIYAM redirects the current browser page to that URL.

The launch URL is intentionally not stored or reused. A fresh session is created for every click.

## If it does not launch

- Check `/api/casino-test` first.
- Confirm the sandbox credential is valid.
- Confirm the game is enabled for your provider account.
- Confirm the currency configured for the session is supported by the account/game. Change the `currency` value in `providers/casino_api_pro.py` if your sandbox account uses another currency.
- If the provider reports that `mines` is unavailable, use the slug returned by your account's `/v1/games` catalogue and create a matching game manifest.

## Security

If a real secret has ever been exposed in a screenshot, chat, repository, or terminal history, rotate it in the provider dashboard.
