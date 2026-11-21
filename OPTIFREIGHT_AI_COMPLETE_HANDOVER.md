# OPTIFREIGHT AI — MASTER PROJECT HANDOVER & DEVELOPMENT SPECIFICATION

> **Document Status:** Authoritative Master Handover Package  
> **Target Agent / Model:** Antigravity Agent running **GPT-OSS 120B** on the Same Laptop  
> **Project Directory:** `C:\Users\Aaryan Rawal\.gemini\antigravity\scratch\OptiFreight_AI\OptiFreight AI`  
> **Companion Document:** `HANDOVER_PRIVATE_CONFIG.txt` (Local service and variable map)  
> **Date of Handover:** November 20, 2026  

---

## 1. PROJECT IDENTITY & SCOPE

### 1.1 Project Name
**OptiFreight AI — Intelligent Freight Optimization**  
*(Note: A separate larger project exists in discussions, previously referred to as Open Project / OP / op. Do NOT confuse it with OptiFreight AI. Do not rename OptiFreight AI or merge their scopes).*

### 1.2 Core Problem Statement
In road freight transportation across Indian national highways, commercial trucks frequently return or continue partially or completely empty after completing their primary cargo delivery (the "deadhead" or empty backhaul problem).  
**OptiFreight AI** is a post-delivery backhaul cargo matching system. Its objective is:
- Take a truck that has completed its primary delivery.
- Take the truck's already-planned, fixed onward return route.
- Scan available cargo listings (from synthetic demonstrations, CSV imports, manual postings, and UNCTADstat transport cost indices).
- Filter cargo listings through strict, fail-closed deterministic business rules.
- Evaluate candidate extra jobs that can be delivered along or near the route.
- Rank surviving candidates using Machine Learning models.
- Present transparent, mathematically honest decision records (revenue minus incremental costs only, never gross profit) to the driver/operator with interactive Leaflet map visualizations.

---

## 2. HARD REQUIREMENTS & LOCKED INVARIANTS

Every implementation step must strictly obey the locked decisions in `docs/DECISIONS.md`. The most critical invariants are:

1. **Authoritative 40 km Excursion Cap (`D-010`)**:
   - On-route delivery is the default (checkbox OFF).
   - When the driver enables the off-route checkbox, any pickup or drop off the main corridor is permitted **if and only if the round-trip road detour is $\le 40.0\text{ km}$** ($40,000\text{ meters}$).
   - **40.000 km passes; 40.001 km strictly fails.** (Earlier 20 km proposals are superseded; 40 km is locked).
2. **Job Caps by Route Distance (`D-011`–`D-014`)**:
   - Baseline route $\le 500\text{ km}$: Maximum **3 extra jobs** total (no daily cap).
   - Baseline route $500\text{ km} - 1250\text{ km}$: Maximum **5 extra jobs** total (max **3 jobs per calendar day**).
   - Baseline route $1250\text{ km} - 2000\text{ km}$: Maximum **8 extra jobs** total (max **4 jobs per calendar day**).
   - Baseline route $> 2000\text{ km}$: Maximum **10 extra jobs** total (max **4 jobs per calendar day**).
   - **Band edges belong to the lower band** (exactly 500.0 km belongs to the $\le 500\text{ km}$ band = 3 jobs).
   - A day is defined in **Indian Standard Time (`Asia/Kolkata`) resetting at 12:00 AM midnight**.
   - A job counts toward the calendar day of its **pickup**.
3. **Bundling Geometry (`D-015`, `D-016`)**:
   - Two or more compatible cargos whose pickups all lie within a **5.0 km radius** and whose delivery drops all lie within a **5.0 km radius** bundle into **1 single job**.
   - The radius is verified using the **smallest enclosing circle** algorithm ($\le 5.0\text{ km}$ straight line).
4. **Trip Detour Budget Curve (`D-017`, `D-018`)**:
   - Total trip detour is capped by a multiplier curve over original route distance $L$:
     - For $L \le 1000\text{ km}$: Multiplier is $1.25\times$.
     - For $1000\text{ km} < L < 1500\text{ km}$: Multiplier scales linearly from $1.25\times$ to $1.35\times$ ($1.25 + 0.10 \times \frac{L - 1000}{500}$).
     - For $L \ge 1500\text{ km}$: Multiplier is capped at $1.35\times$.
   - Checked separately for **distance** and **active driving/handling time**.
5. **Deterministic Hard Filters Before ML (`D-003`, `FR-08`, `FR-17`)**:
   - Hard filters (weight, volume, vehicle compatibility, handling gear, excursion, timing windows, driver hours, e-way bills) run **before** any ML model.
   - ML scores can **never** override a hard filter failure.
6. **Fail-Closed & Null-Not-Zero Integrity (`D-004`, `D-005`, `NFR-03`)**:
   - Unknown values remain `null`, **never 0**. Missing weight is not zero weight; missing deadline is not "no deadline".
   - Any check where required data or routing distance is missing evaluates to `verdict: "unknown"`.
   - `verdict: "unknown"` is **never eligible**. Only candidates where all checks are `pass` are eligible.
7. **Financial Honesty (`D-007`, `FR-19`)**:
   - Net contribution $= \text{Revenue} - \text{Incremental Costs}$ (incremental fuel, tolls, driver allowances, loading/unloading fees). Gross revenue must never be shown as profit.
8. **Simulated Location Only (`D-004`, `FR-02`)**:
   - Truck location is user-selected or simulated. **No live GPS tracking**.

---

## 3. COMPLETE CHRONOLOGICAL HISTORY & RECOVERED CONTEXT

1. **Initial Project Setup**: Specification established modular monolith architecture: React/TypeScript frontend (Leaflet maps), FastAPI backend (SQLAlchemy 2.0 async, PostgreSQL + PostGIS), LightGBM ML models, and OSRM routing.
2. **Authoritative Decisions Locked**: `D-001` through `D-031` established in `docs/DECISIONS.md`.
3. **Frontend Separation**: The frontend UI was built by Claude on a separate account and provided as a complete React/TypeScript project. The user will upload the frontend ZIP to the new account.
4. **UNCTAD Integration Supplied**: The user provided credentials and an authoritative R integration script for UNCTADstat transport cost analytical data (Fact table `US.TransportCosts/cur/Facts?culture=en`).
5. **PostgreSQL Configuration**: The user confirmed PostgreSQL password `devil` on `localhost:5432`, database `optifreight`, user `optifreight`.
6. **Hardware Context**: ASUS TUF A16 (AMD Ryzen 9 8940HX, 32GB DDR5 RAM, NVIDIA RTX 5070 8GB GPU, Windows 11).
7. **Audit Revelation**: Prior agent reports claimed complete implementation, but forensic code inspection proved the backend consisted of 7-20 line stubs, disconnected modules, missing domain models, and mock returns (`random.random()`).
8. **Current Mandate**: Full, honest handover so the new agent on GPT-OSS 120B can execute complete implementation autonomously without asking the user to repeat already-known details.

---

## 4. LOCAL WORKSPACE & REPOSITORY STRUCTURE

**Root Directory:** `C:\Users\Aaryan Rawal\.gemini\antigravity\scratch\OptiFreight_AI\OptiFreight AI`

```
OptiFreight AI/
├── .editorconfig
├── .env                                  # Root environment template
├── .gitattributes
├── .gitignore
├── CHANGELOG.md                          # Project changelog
├── README.md                             # Project overview
├── config/
│   └── default.yaml                      # App configuration defaults
├── docs/
│   ├── ARCHITECTURE.md                   # System architecture spec
│   ├── DATA_MODEL.md                     # Domain entity definitions
│   ├── DECISIONS.md                      # Authoritative locked decisions D-001 to D-031
│   ├── FORMULAS.md                       # Exact financial & detour formulas
│   ├── ML_PLANS.md                       # LightGBM LambdaRank & quantile risk specs
│   ├── REQUIREMENTS.md                   # Functional & non-functional requirements
│   ├── STATUS.md                         # Phase-gate status tracker
│   └── TEST_PLAN.md                      # Boundary and property test specifications
├── routing/
│   ├── corridors.geojson                 # GeoJSON for NH-48 and major freight corridors
│   ├── docker-compose.osrm.yml           # OSRM container service definition
│   └── README.md                         # OSRM extract and build documentation
├── backend/
│   ├── .env                              # Active backend environment configuration
│   ├── .gitignore
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── alembic/
│   │   ├── env.py                        # Alembic migration runner
│   │   └── versions/
│   │       └── 0001_initial.py           # Initial schema migration
│   └── app/
│       ├── __init__.py
│       ├── config.py                     # Pydantic BaseSettings loader
│       ├── db.py                         # Async SQLAlchemy engine/session generator
│       ├── main.py                       # FastAPI entry point
│       ├── models.py                     # ORM models (currently only UnctadData stub)
│       ├── schemas.py                    # Pydantic schemas (currently only UnctadData)
│       ├── settings.py                   # Duplicate settings stub
│       ├── api/
│       │   ├── __init__.py
│       │   ├── auth.py                   # Auth router (broken DB imports)
│       │   ├── cargo.py                  # Cargo CRUD router (broken DB imports)
│       │   ├── health.py                 # Health check router (/health/ping)
│       │   └── routes.py                 # API aggregator (/api/unctad stub)
│       ├── authentication/
│       │   ├── router.py                 # Duplicate auth router
│       │   ├── schemas.py                # Token schemas
│       │   └── security.py               # JWT tools; mock password hash
│       ├── database/
│       │   └── models.py                 # Empty database re-export
│       ├── explain/
│       │   ├── decision_builder.py       # Stub decision builder
│       │   └── human_readable.py         # 2-item dictionary formatter
│       ├── finance/
│       │   ├── __init__.py
│       │   ├── costs.py                  # Toy cost calculation
│       │   └── net_contribution.py       # Trivial subtraction stub
│       ├── ml_wrappers/
│       │   ├── gating.py                 # Gating stub (always True)
│       │   ├── model_a.py                # Model A stub (returns random.random())
│       │   ├── model_b.py                # Model B stub (weight_kg / 10000)
│       │   ├── model_c.py                # Model C stub (distance_km / 1000)
│       │   └── shap_explainer.py         # SHAP explainer stub
│       ├── planner/
│       │   ├── __init__.py
│       │   ├── budget_tracker.py         # Scalar budget stub
│       │   ├── day_counter.py            # Simple day difference stub
│       │   ├── generator.py              # Candidate generator stub
│       │   ├── greedy.py                 # Greedy sort stub
│       │   └── validator.py              # Validator stub
│       ├── routing_adapters/
│       │   ├── cache.py                  # Local JSON file cache stub
│       │   ├── client.py                 # Mock client (routing.example.com)
│       │   └── fallback.py               # Fallback stub (returns distance 0)
│       ├── services/
│       │   └── unctad.py                 # Mock unctad.org call (needs real OData logic)
│       ├── simulator/
│       │   ├── scenario_generator.py     # Scenario stub
│       │   └── seed_data.py              # Seed stub
│       └── source_adapters/
│           ├── csv_import.py             # CSV reader stub
│           ├── public_api.py             # Duplicate mock UNCTAD stub
│           └── synthetic.py              # Synthetic generator stub
└── frontend/                             # Directory structure present; ZIP uploaded separately
```

---

## 5. RECONCILED IMPLEMENTATION STATUS AUDIT (70 FILES)

| Status | Count | Files |
|---|:---:|---|
| **COMPLETE** | **0** | No executable modules are complete. |
| **PARTIALLY IMPLEMENTED** | **3** | `backend/alembic/env.py`, `backend/alembic/versions/0001_initial.py`, `backend/app/config.py` |
| **SKELETON** | **16** | `backend/app/db.py`, `main.py`, `models.py`, `schemas.py`, `settings.py`, `api/auth.py`, `api/cargo.py`, `api/health.py`, `authentication/router.py`, `authentication/schemas.py`, `database/models.py`, `finance/net_contribution.py`, `planner/budget_tracker.py`, `planner/day_counter.py`, `routing_adapters/cache.py`, `source_adapters/csv_import.py` |
| **PLACEHOLDER / MOCK** | **20** | `api/routes.py`, `authentication/security.py`, `explain/decision_builder.py`, `explain/human_readable.py`, `finance/costs.py`, `ml_wrappers/gating.py`, `ml_wrappers/model_a.py`, `ml_wrappers/model_b.py`, `ml_wrappers/model_c.py`, `ml_wrappers/shap_explainer.py`, `planner/generator.py`, `planner/greedy.py`, `planner/validator.py`, `routing_adapters/client.py`, `routing_adapters/fallback.py`, `services/unctad.py`, `simulator/scenario_generator.py`, `simulator/seed_data.py`, `source_adapters/public_api.py`, `source_adapters/synthetic.py` |
| **EMPTY** | **4** | `backend/app/__init__.py`, `api/__init__.py`, `finance/__init__.py`, `planner/__init__.py` |
| **CONFIGURATION / STATIC** | **27** | `.editorconfig`, `.env`, `.gitattributes`, `.gitignore`, `CHANGELOG.md`, `README.md`, `.github/workflows/backend.yml`, `config/default.yaml`, 8 files in `docs/`, 3 files in `routing/`, and 8 configuration/meta files in `backend/` |
| **TOTAL** | **70** | **100% accounted for** |

---

## 6. EXTERNAL INTEGRATIONS & CREDENTIAL RECOVERY

### 6.1 PostgreSQL & PostGIS
- **DSN Expected by App**: `postgresql+asyncpg://optifreight:devil@localhost:5432/optifreight`
- **Location on Host**: Windows binaries installed at `C:\Program Files\PostgreSQL\18`.
- **Action Required**: Align `backend/app/config.py` and `backend/app/db.py` to use `asyncpg`. When testing, start the PostgreSQL service or run via Docker Compose once Docker is available.

### 6.2 UNCTADstat OData Analytical Transport Costs
- **Original User Integration Script (R)**:
  ```r
  # UNCTADstat: Trade and transport: By destination, mode and product group - Annual
  filter <- "TransportMode/Code eq '00' and Origin/Code eq '0000' and Product/Code eq 'TOTAL' and Destination/Code in ('0001','0000','5100','5110','5120','5121','5122','5123','5124','5200','5210','5220','5221','5222','5223','5300','5310','5330','5350','5320','5340','5400','5410','5420','5430','5440','5500','5600','5702','5706','5703','5704','5705','1400','1410','1420','1460','1430','1450','1500','1520','1560','1530','1550','1540','1600','1601','1610','1614','1612','1615','1620','1640','1641','1642','1643','2623','2622','2621','2711','3916','3412','3919','3905') and Year in (2016,2017,2018,2019,2020,2021)"
  curl::curl_download("https://unctadstat-user-api.unctad.org/US.TransportCosts/cur/Facts?culture=en", tempFilePath, handle = curlHandle)
  ```
- **Authentication**: Custom HTTP Headers `ClientId` and `ClientSecret` passed directly to the OData endpoint.
- **Keys Location**: Stored securely in `backend/.env` as `UNCTAD_CLIENT_ID` and `UNCTAD_CLIENT_SECRET`.
- **Action Required**: Translate the R script into `backend/app/services/unctad.py` using Python `requests` + `gzip` + `pandas`. Replace the mock `https://unctad.org/api/v1/trade` URLs.

### 6.3 OSRM Routing Engine
- **Protocol**: OSRM HTTP API v1 (`/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson`).
- **Autonomous Setup**: The new agent should default to `http://localhost:5000` (Docker OSRM) with fallback to public demonstration `https://router.project-osrm.org` or pre-calculated `routing/corridors.geojson`.
- **Fail-Closed Rule**: If routing fails, return `Verdict.unknown`. **Never return distance 0**.

---

## 7. RECOMMENDED IMPLEMENTATION ROADMAP FOR GPT-OSS 120B

Work folder-by-folder in logical sequence without breaking working code:

1. **Step 1: Core Domain Entities & Database Layer (`backend/app/models.py`, `backend/app/db.py`)**
   - Implement complete SQLAlchemy 2.0 async models matching `docs/DATA_MODEL.md`: `User`, `Truck`, `Cargo`, `Route`, `TripPlan`, `Job`, `CheckResult`, `DecisionRecord`, `UnctadData`.
   - Update `backend/app/db.py` to use `asyncpg` and manage async session lifecycles properly.
2. **Step 2: Real UNCTADstat Ingestion (`backend/app/services/unctad.py`)**
   - Implement the authentic Python requests client with gzip decompression and OData parameters.
3. **Step 3: Deterministic Rule Engine (`backend/app/core/rules/` & `planner/`)**
   - 40 km excursion cap (`D-010`).
   - Job caps by route band & IST midnight reset (`D-011`–`D-014`).
   - 5.0 km smallest-enclosing-circle bundling (`D-015`, `D-016`).
   - Piecewise detour budget curve $1.25\times$ to $1.35\times$ (`D-017`, `D-018`).
4. **Step 4: Finance Engine (`backend/app/finance/costs.py`, `net_contribution.py`)**
   - Real equations from `docs/FORMULAS.md` (fuel burn, NHAI tolls, driver allowance, loading fees).
5. **Step 5: OSRM Routing Client (`backend/app/routing_adapters/`)**
   - Real OSRM v1 protocol, coordinate parsing, geometry decoding, caching, and fail-closed handling.
6. **Step 6: Optimization Planner (`backend/app/planner/`)**
   - Candidate generation, corridor matching, greedy packing, plan validation.
7. **Step 7: Machine Learning Wrappers (`backend/app/ml_wrappers/`)**
   - Feature extraction, LightGBM model loaders, deterministic baselines, SHAP tree explainers.
8. **Step 8: Authentication & FastAPI Routers (`backend/app/api/`)**
   - Argon2 password hashing, JWT tokens, `/auth`, `/cargo`, `/match`, `/health`.
   - Mount all routers in `backend/app/main.py` with CORS.
9. **Step 9: Frontend Inspection & Integration**
   - Inspect user's uploaded frontend ZIP, align API request/response contracts, and test end-to-end.
10. **Step 10: Comprehensive Test Suite (`backend/tests/`)**
    - Unit tests, Hypothesis property tests, boundary tests, and integration tests.
