import csv
from typing import List, Dict

class CSVImportAdapter:
    """Import freight data from CSV files."""
    def __init__(self, filepath: str):
        self.filepath = filepath

    def load(self) -> List[Dict]:
        records = []
        with open(self.filepath, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                records.append(row)
        return records
