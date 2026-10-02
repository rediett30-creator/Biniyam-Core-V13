# Provider launch behavior

BINIYAM never treats a local HTML game as a real provider game.

- `provider: casino-api-pro` -> POST `/api/provider-session` -> fresh Casino API Pro session -> browser redirect to the returned `launch_url`.
- `provider: biniyam-local` -> local HTML game only.
- `spribe` in this project is still only a simulator because no real SPRIBE API credentials/adapter have been supplied.

The included real provider example is **Goal Jet — Casino API Pro** (`goal-jet`). Casino API Pro documents `goal-jet` as a crash game and documents the session flow as creating a fresh session and redirecting to its short-lived `launch_url`.

If you specifically need SPRIBE Aviator, do not rename Goal Jet to Aviator. Provide the actual SPRIBE integration/API documentation and credentials, then a real SPRIBE adapter can be added.
