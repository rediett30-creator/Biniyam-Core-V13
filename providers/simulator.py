import uuid
from core.wallet import now
from .base import ProviderAdapter


class SimulatorAdapter(ProviderAdapter):
    def create_session(self, player, game):
        return {
            "id": "SES-" + uuid.uuid4().hex[:10].upper(),
            "player_id": player["id"], "game_id": game.id,
            "provider": game.provider, "created": now(), "status": "OPEN"
        }

    def place_bet(self, session, game, stake):
        return {"session_id": session["id"], "stake": float(stake)}
