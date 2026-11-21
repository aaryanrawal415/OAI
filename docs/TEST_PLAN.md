# Test plan

The rule regression suite is never skipped or loosened. Nothing is claimed as working until a
test shows it.

## Rule boundary tests

| Rule | Cases |
|---|---|
| Job caps | L = 1, 500, 500.01, 1250, 1250.01, 2000, 2000.01, 5000 give the right caps; L <= 0 or NaN is rejected |
| Job counts | 3rd of 3 allowed, 4th of 3 rejected; daily cap reached rejects even when the total allows it |
| Day reset | 23:59:59 and 00:00:00 Indian time fall on different days; the same instant in UTC maps correctly; a time without a timezone is rejected |
| Excursion | 0, 12.3, 40.0, 40.0004 pass; 40.001 and 55 fail; null gives unknown |
| Bundling | Smallest enclosing radius 5.0 km passes, 5.001 km fails; mixed incompatible cargo fails; combined weight over capacity fails; one cargo missing weight gives unknown |
| Budget multiplier | 1.25 at 1000, 1.30 at 1250, 1.35 at 1500 and beyond; never decreases; no jump at 1250 |
| Budget check | Distance exactly m*L passes, one hundredth of a km over fails; same for active time; None gives unknown |
| Capacity over time | Two cargos fit only when the sum holds at every point |
| Verdict algebra | Any fail gives fail; no fail but an unknown gives unknown; all pass gives pass |

## Route and routing tests

- Delivery on route is allowed with the checkbox off; an off-route delivery is excluded.
- Off-route with the checkbox on and a valid excursion passes the route check.
- Straight line small but road distance large (river with no bridge) fails.
- An inaccessible stop fails; an infeasible pickup fails.
- A routing failure gives unknown and the plan is never eligible.
- A route change invalidates earlier results.
- Pickup is always visited before its drop.

## Property tests (Hypothesis)

- A rejected job never appears in results.
- With the checkbox off, no off-route job is ever returned.
- No returned stop has an excursion over 40 km.
- No plan exceeds its job caps, day caps, or budgets.
- The same input always gives the same ranking.
- Higher gross payment never outranks a rule violation.

## Golden scenarios

Fixed route, fixed cargo, and expected output, kept as files, one per demo corridor and one per
cap band.

## Data tests

Synthetic, manual, and imported listings all work through the same matching logic. Test
malformed imports, duplicates, missing fields, stale and cancelled listings, and an external
source failing.

## Finance tests

Only incremental costs are counted. Net equals revenue minus incremental costs. Gross is never
shown as profit. Unknown inputs give an estimate label or no figure.

## ML tests

Same features in training and serving; guards fall back to the baseline on out-of-range input;
evaluation uses leave-one-corridor-out; the locked test set is opened once per model;
evaluation is reproducible from saved seeds and versions.

## API and authentication tests

Register, login, token expiry, and role checks; every matching response passes the validator;
the API schema matches what the frontend expects; rate limiting works.

## Frontend and end-to-end tests

Component tests for the checkbox, result list, decision panel, and budget meter. End-to-end on
all four corridors: log in, set the truck and route, search, review, accept, view the Shipment
page, and open the Google Maps link.

## Failure injection

Routing server down, source timeout, malformed listing, database unavailable, expired token.

## Benchmarks

Matching latency at 100, 1,000, and 10,000 listings; rejection breakdown per rule; routing call
count with and without batching.