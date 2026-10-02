from dataclasses import dataclass, asdict
from pathlib import Path
import json


@dataclass(frozen=True)
class Provider:
    id: str
    name: str
    status: str = "simulator"
    adapter: str = "SimulatorAdapter"

    def public(self, game_count=0):
        data = asdict(self)
        data["games"] = game_count
        return data


class ProviderManager:
    """Loads provider manifests from providers/*/provider.json."""
    def __init__(self, providers_dir: Path):
        self.providers_dir = Path(providers_dir)
        self.providers_dir.mkdir(parents=True, exist_ok=True)
        self.providers = {}
        self.reload()

    def reload(self):
        loaded = {}
        for manifest in sorted(self.providers_dir.glob("*/provider.json")):
            try:
                data = json.loads(manifest.read_text(encoding="utf-8"))
                provider = Provider(
                    id=data["id"], name=data["name"],
                    status=data.get("status", "simulator"),
                    adapter=data.get("adapter", "SimulatorAdapter")
                )
                if provider.id in loaded:
                    raise ValueError(f"duplicate provider id: {provider.id}")
                loaded[provider.id] = provider
            except Exception as exc:
                print(f"[ProviderManager] skipped {manifest}: {exc}")
        self.providers = loaded
        return list(self.providers.values())

    def get(self, provider_id):
        return self.providers.get(provider_id)

    def all(self):
        return list(self.providers.values())
