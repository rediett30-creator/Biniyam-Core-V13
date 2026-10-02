class ProviderAdapter:
    """Interface for an authorized game provider integration."""
    def create_session(self, player, game):
        raise NotImplementedError

    def place_bet(self, session, game, stake):
        raise NotImplementedError
