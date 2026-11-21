# Status

Labels: implemented, tested, simulated, planned. "Written" means the file exists but has not
been verified on the laptop yet. Update this file whenever something changes.

| Area | Status | Notes |
|---|---|---|
| Folder structure | created | Empty folders only |
| Root files (README, .gitignore, .gitattributes, .editorconfig, .env.example, CHANGELOG) | written | Not yet pushed |
| docs/DECISIONS.md, STATUS.md, ARCHITECTURE.md | written | Not yet pushed |
| docs/REQUIREMENTS.md, DATA_MODEL.md, FORMULAS.md, ML_PLAN.md, TEST_PLAN.md | written | Not yet pushed |
| Backend skeleton, config, domain models | planned | |
| Reference data (vehicle classes, cargo categories, costs) | planned | |
| Simulator | planned | |
| Routing (OSRM) | planned | |
| Rules engine | planned | |
| Trip planner and finance | planned | |
| ML Models A, B, C | planned | |
| Authentication, database, API | planned | |
| Frontend | planned | |
| CI | planned | |
| Tests | none yet | |
| Datasets | curated & verified | Part 1 complete: 34 canonical traffic parquet files & 9 raw Olist CSVs |
| Environment & Launch Infrastructure | implemented | Part 2 complete: setup.bat, run.bat, root requirements.txt, async driver configured |

## Known limitations

- No code exists yet, so nothing is tested.
- No public freight-listing dataset has been confirmed. Training will partly rely on a
  simulator, and results will be reported as simulation.