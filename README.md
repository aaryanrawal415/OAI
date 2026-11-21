# OptiFreight AI: Intelligent Freight Optimization

AI-assisted backhaul cargo matching. After a truck delivers its main cargo, the app finds
compatible extra cargo along the truck's already-planned onward route, inside strict,
deterministic rules. Machine learning ranks what survives the rules; it can never override them.

This is a standalone project (Mini Project / MP). It is not the larger Open Project (OP).

- GitHub repository: `Frieght-Engine`
- Local folder: `C:\Users\Aaryan Rawal\Desktop\Projects\OptiFreight AI`

## Status

The project is built file by file, and each file is approved before the next one is added.
The folder structure exists; most folders are still empty. Only files listed in
`CHANGELOG.md` have been written.

## Folder layout

```
docs/       specifications and decisions
backend/    FastAPI app: rules engine, trip planner, finance, adapters, ML inference, API
data/       reference tables and datasets (large files are git-ignored)
routing/    OSRM setup for the demo corridors
ml/         training and evaluation for Models A, B, C
scripts/    helper scripts
frontend/   React + TypeScript + Vite interface
.github/    continuous integration
```

## Prerequisites (Windows)

| Tool | Needed from | Check with |
|---|---|---|
| Git | now | `git --version` |
| Python 3.11 or newer | backend phase | `python --version` |
| Node.js 20 or newer | frontend phase | `node --version` |
| Docker Desktop | database and routing phase | `docker --version` |

## Project rules

- Scope is post-delivery backhaul matching only.
- The original route is the baseline; hard rules run before any ML; unverified is never eligible.
- No live GPS tracking.
- Never commit secrets. Use `.env` (git-ignored); `.env.example` lists the names.
- Do not claim a feature works until a test shows it.