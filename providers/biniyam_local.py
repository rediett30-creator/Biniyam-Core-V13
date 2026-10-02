import uuid
from urllib.parse import quote
from core.wallet import now
from .base import ProviderAdapter


class BiniyamLocalAdapter(ProviderAdapter):
    """First-party local game adapter. Play-money only; no external provider required."""
    def create_session(self, player, game):
        sid = "SES-" + uuid.uuid4().hex[:10].upper()
        return {
            "id": sid,
            "player_id": player["id"],
            "game_id": game.id,
            "provider": "biniyam-local",
            "created": now(),
            "status": "OPEN",
            "launch_url": f"/games/{quote(game.id)}/index.html?session_id={quote(sid)}",
        }

    def place_bet(self, session, game, stake):
        return {"session_id": session["id"], "stake": float(stake)}
