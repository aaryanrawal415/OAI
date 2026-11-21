# Decision log

This file contains the core architectural and business decisions for OptiFreight AI.

- **D-001**: Use FastAPI for the backend service.
- **D-002**: All data access is through SQLAlchemy async engine.
- **D-003**: UNCTAD API credentials are stored in `.env` and accessed via `app.config.Settings`.
- **D-004**: PostgreSQL is the primary database; default DB name and user: `optifreight`.
- **D-005**: JWT authentication will use `python-jose` with a secret key from `.env`.
- **D-006**: Hard business rules (excursion caps, job caps, bundling, detour budget) are enforced in the routing/logic layer (not shown here) and must not be overridden by ML models.
- **D-007**: All monetary values are stored as numeric types; net contribution equals revenue minus incremental costs.
- **D-010**: 40 km excursion cap enforced per off‑route stop.
- **D-011‑D‑014**: Job and day caps based on route distance (see project spec).
- **D-015‑D‑016**: Bundling radius 5 km.
- **D-017‑D‑018**: Detour budget multipliers as specified.

All other decisions are documented in the project's design documents.
