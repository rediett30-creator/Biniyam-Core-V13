# BINIYAM V13 — Real Provider Launch

This build is for testing the external Casino API Pro sandbox. It keeps local demo games, but provider games use a real provider session and redirect to the provider `launch_url`.

## 1. Configure sandbox credentials

Copy `.env.example` to `.env` and enter your own sandbox credentials:

```env
CASINO_API_BASE_URL=https://api.casinoapipro.com/v1
CASINO_API_KEY=ck_test_YOUR_KEY
CASINO_API_SECRET=cs_test_YOUR_SECRET
CASINO_API_CURRENCY=GHS
```

Never put the secret in browser JavaScript.

## 2. Start exactly this build

In Termux, enter this folder and run:

```bash
./RUN_V13.sh
```

Then open:

`http://127.0.0.1:9500/api/version`

It MUST say `V13-PROVIDER`. If it says another version, an older BINIYAM server is still running.

## 3. Test provider connection

Open:

`http://127.0.0.1:9500/api/casino-test`

Then test `Mines — Casino API Pro` or `Goal Jet — Casino API Pro` in the lobby.

The provider flow is:

`Open game -> /api/provider-session -> Casino API Pro /v1/sessions -> launch_url -> browser redirects to provider game`

A provider game will NOT use the local `/games/.../index.html` route.

## Important

The Casino API Pro sandbox only exposes games enabled for your operator account. The provider documentation also requires a currency supported by your account; this build defaults to GHS and lets you change it with `CASINO_API_CURRENCY`.

This is play-money sandbox testing only.
