import random, uuid
from .wallet import now


class SandboxGameEngine:
    """Temporary virtual-money engine. Replace with authorized provider adapters in production."""
    PAYOUTS = (0, 0, 0, 0.5, 1, 1.5, 2)

    def play(self, game, stake):
        stake = float(stake)
        win = round(stake * random.choice(self.PAYOUTS), 2)
        return {
            "id": "RND-" + uuid.uuid4().hex[:10].upper(),
            "game": game.name, "provider": game.provider,
            "stake": stake, "win": win,
            "commission": round(stake * game.commission / 100, 2),
            "status": "SETTLED", "time": now()
        }
