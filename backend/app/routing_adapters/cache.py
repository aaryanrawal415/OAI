import json
import os
from pathlib import Path
from typing import Dict, Optional

class RoutingCache:
    """Cache routing responses in a local JSON file."""
    def __init__(self, cache_file: str = "routing_cache.json"):
        self.cache_path = Path(cache_file)
        if self.cache_path.exists():
            try:
                self.cache: Dict[str, Dict] = json.loads(self.cache_path.read_text())
            except Exception:
                self.cache = {}
        else:
            self.cache = {}

    def get(self, key: str) -> Optional[Dict]:
        return self.cache.get(key)

    def set(self, key: str, value: Dict) -> None:
        self.cache[key] = value
        self.cache_path.write_text(json.dumps(self.cache))
