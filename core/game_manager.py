from dataclasses import dataclass, asdict
from pathlib import Path
import json

@dataclass(frozen=True)
class Game:
    id: str
    name: str
    provider: str
    category: str
    status: str = 'simulator'
    commission: float = 0.0
    icon: str = '🎮'
    provider_game_id: str = ''

    def public(self):
        return asdict(self)

class GameManager:
    def __init__(self, games_dir: Path):
        self.games_dir = Path(games_dir)
        self.games_dir.mkdir(parents=True, exist_ok=True)
        self.games = {}
        self.reload()

    def reload(self):
        loaded = {}
        for manifest in sorted(self.games_dir.glob('*/game.json')):
            try:
                data = json.loads(manifest.read_text(encoding='utf-8'))
                game = Game(
                    id=data['id'], name=data['name'], provider=data['provider'],
                    category=data.get('category', 'Other'), status=data.get('status', 'simulator'),
                    commission=float(data.get('commission', 0)), icon=data.get('icon', '🎮'),
                    provider_game_id=data.get('provider_game_id', data['id'])
                )
                loaded[game.id] = game
            except Exception as exc:
                print(f'[GameManager] skipped {manifest}: {exc}')
        self.games = loaded
        return list(self.games.values())

    def get(self, game_id):
        return self.games.get(game_id)

    def all(self):
        return list(self.games.values())
