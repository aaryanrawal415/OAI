# Data model

Conventions: distances in km, weight in kg, volume in m3, money in INR, times stored in UTC and
shown in Indian time. IDs are UUIDs. Coordinates are WGS84 latitude and longitude.
**Unknown is null, never 0.** A null weight is not a zero weight; a null deadline is not
"no deadline". Nullable fields are marked `?`.

## Enums

- SourceType: synthetic, manual, csv_import, public_api
- ListingStatus: open, cancelled, expired, unavailable
- Verdict: pass, fail, unknown
- ClaimTag: fact, calculation, estimate, recommendation, ml_estimate
- ShipmentStatus: accepted, heading_to_pickup, loaded, in_transit, delivered, cancelled
- RouteClass: on_route, off_route

## Entities

### User
id, email, password_hash, role, created_at

### Truck
id, owner_id, vehicle_class, body_type, max_payload_kg, available_payload_kg,
available_volume_m3?, loaded_mileage_km_per_l?, handling_equipment[], cargo_restrictions[],
available_from (time), location (lat, lng)

### Route (the original onward route)
id, truck_id, origin (lat, lng), destination (lat, lng), polyline, distance_km,
baseline_driving_minutes, verified (bool), version (integer, increases on any change)

### Cargo (one listing)
id, source_type, source_id?, category, description?, weight_kg?, volume_m3?,
length_m?, width_m?, height_m?, pickup (lat, lng), drop (lat, lng),
pickup_window_start?, pickup_window_end?, delivery_deadline?, rate_inr?,
hazardous (bool?), temperature_controlled (bool?), over_dimensional (bool?),
required_body_types[]?, status, created_at, updated_at, verification_status,
completeness_flags[], reliability_score?

### Job
id, cargo_ids[] (one for a normal job, several for a bundle), is_bundle (bool),
pickup_cluster_radius_km?, drop_cluster_radius_km?

### TripPlan
id, route_id, route_version, config_version, jobs[] (ordered), distance_km, active_minutes,
jobs_used_total, jobs_used_by_day{date: count}, budget_distance_used_fraction,
budget_time_used_fraction, plan_status (verdict)

### CheckResult
rule_code, verdict, value?, threshold?, unit?, claim_tag, message

### DecisionRecord
id, match_run_id, job_id, route_class?, checks[] (CheckResult), eligible (verdict),
rejection_codes[], pickup_access_km?, excursion_km?, extra_distance_km?, extra_active_minutes?,
revenue_inr?, incremental_cost_inr?, net_inr_low?, net_inr_expected?, net_inr_high?,
baseline_score?, model_scores{}, explanation

### MatchRun
id, user_id, truck_id, route_id, route_version, off_route_enabled (bool), config_version,
model_versions{}, data_versions{}, started_at, finished_at, routing_source, status

### Shipment
id, user_id, trip_plan_id, status, status_history[], accepted_at, frozen_route_version,
frozen_numbers (copy of the figures shown at acceptance)

### ConfigVersion
id, created_at, content_hash, content (rule limits, weights, cost parameters)

### DataSource (provenance)
id, name, link, licence, date_range, region, fields_used[], rows_used, split_role, notes

## Relationships

User has many Trucks and Shipments. A Truck has one active Route (versioned). A MatchRun
produces many DecisionRecords. A TripPlan has ordered Jobs. A Job contains one or more Cargo
records. A Shipment points to one accepted TripPlan.

## Integrity rules

- A DecisionRecord can only be eligible if every CheckResult is pass.
- A Route change creates a new version; MatchRuns on older versions are marked invalid.
- Cargo from a synthetic source can never have a verification_status above "demonstration".
- A bundle's cargo records must all pass the bundling check together.