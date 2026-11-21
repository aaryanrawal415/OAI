# Changelog

All notable changes are recorded here. Each entry names the files added or changed.

## [Unreleased]

### 2026-11-20
- Completed Part 1: Curated and verified dataset inventory (34 canonical files in `DATASETS/extracted/archive2`, 9 raw Olist CSVs in `DATASETS/raw`, duplicates removed from `DATASETS_extracted/archive1`, manifest created).
- Completed Part 2: Added automated Windows environment setup and launcher:
  - Added root canonical `requirements.txt` with required dependencies including `pydantic-settings`.
  - Added `setup.bat` for environment bootstrap, dependency installation, and PostgreSQL connectivity verification.
  - Added `scripts/check_db.py` for safe database connectivity diagnostics without credential exposure.
  - Added `run.bat` for automated setup check and Uvicorn backend launch.
  - Updated backend configuration in `backend/app/config.py` for Pydantic V2 compatibility (`pydantic-settings`) and SQLAlchemy asyncpg async driver alignment.

### 2026-11-17
- Added project root files: `README.md`, `.gitignore`, `.gitattributes`, `.editorconfig`,
  `.env.example`, `CHANGELOG.md`.
- Added `docs/DECISIONS.md`, `docs/STATUS.md`, `docs/ARCHITECTURE.md`.
- Created the empty folder structure (no code yet).
- Added `docs/REQUIREMENTS.md`, `docs/DATA_MODEL.md`, `docs/FORMULAS.md`, `docs/ML_PLAN.md`,
  `docs/TEST_PLAN.md`.