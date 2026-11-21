# Architecture (design only, nothing built yet)

A modular monolith: one backend, one frontend, one database.

```
frontend (React)  <->  API (FastAPI)  ->  core/ (rules, planner, finance, explain)
                           |                  ^  no web, database, or routing imports
                           |                  |  talks through interfaces
                           +-> adapters/routing   OSRM client, cached routes, fallback
                           +-> adapters/sources   synthetic, manual, CSV import, public API
                           +-> db                 PostgreSQL + PostGIS
                           +-> ml                 Models A, B, C inference (after hard filters)
                           +-> auth               login, tokens, roles
```

## Why this shape

- `core/` holds the business rules and can be tested without a database, a web server, or a
  routing engine.
- Routing and cargo sources sit behind interfaces, so a provider can be swapped without touching
  the rules.
- ML is a layer that ranks only what the rules allow. It cannot change an eligibility decision.

## Per-request pipeline

```
Authenticate -> validate input -> load route version -> fetch sources -> normalize
-> dedupe, drop stale -> hard filters -> corridor pre-filter (PostGIS)
-> exact road routing (batched) -> 40 km per-stop checks -> bundling
-> cap, day, budget, and time checks -> Model B risk bands -> Model A/C ranking
-> deterministic plan validator -> finance and explanation -> save decision record
```

## Rules that apply at every stage

- Fail closed: anything that cannot be verified is "unknown", never eligible.
- ML only sees candidates that passed the hard filters.
- A deterministic validator re-checks every plan before it is shown.
- If a model or the routing engine is unavailable, fall back to the baseline and say so.
- Every check writes a structured record; explanations are generated from those records, so an
  explanation can never disagree with the decision.