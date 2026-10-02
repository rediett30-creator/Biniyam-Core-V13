from .casino_api_pro import create_session


class CasinoApiProAdapter:
    """Sandbox adapter for Casino API Pro. Uses test credentials only."""
    def create_session(self, player, game):
        provider_game_id = game.provider_game_id or game.id
        out = create_session(
            player_id=player['id'],
            game_id=provider_game_id,
            currency=None,
            player_name=player.get('name', 'Demo Player'),
            return_url=None
        )
        return {
            'id': out.get('session_id'),
            'provider': 'casino-api-pro',
            'game_id': game.id,
            'provider_game_id': provider_game_id,
            'launch_url': out.get('launch_url'),
            'expires_at': out.get('expires_at'),
            'game': out.get('game'),
            'currency': out.get('currency'),
        }
