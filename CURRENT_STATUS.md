# M3T / Dispatch Current Status

Last verified: 2026-10-03

## Authoritative locations
- Frontend Git repository: C:\Users\asshole\Desktop\Project-Management
- Live API/data folder: C:\Users\asshole\Desktop\M3T-PRJ-DATA
- Git remote: SteadyStateSystems/Dispatch

## Verified baseline
- Active branch: main at 9685e32, matching origin/main.
- Historical v2 at 864f8f2 is an ancestor of main; current root files on main are the deployed line.
- Working-tree-only generated folders: .next/ and node_modules/.
- API: Node/Express, file-backed by data.json.
- No M3T Node server or ngrok process was running; port 3000 was not listening.
- Root frontend defaults to https://adjusted-bluejay-gratefully.ngrok-free.app.
- Copies under v1/ and v2/ still default to an older temporary ngrok URL.
- Operational endpoints require login/session authentication; mutations also require a write token.

## Test safety
- npm test is a placeholder and performs no tests.
- test-auth.js rewrites data.json and exercises an admin route; do not run it against live data.
- test-write-middleware.js contains a hardcoded historical write token; retire or replace it without printing the token.
- v2-smoke-test.bat and v2-role-audit.ps1 predate current authentication and are not valid acceptance tests.

## Pre-work recovery point
- Snapshot: C:\Users\asshole\Desktop\M3T-PreWork-20261003-200838
- Includes live source/data, repository files, Project-Management.bundle, and SHA256SUMS.txt.
- Restore source/data only with M3T stopped, then verify hashes.
- Restore Git from the bundle or reset only after explicit approval.

## Next safe work
1. Build isolated tests using a temporary data file and ephemeral port.
2. Remove hardcoded secrets from test source and update checks for login authentication.
3. Start the local API and validate health/auth without altering production records.
4. Validate the static ngrok domain and remote frontend-to-API path.
5. Reconcile stale API defaults in v1/ and v2/ after confirming those copies must remain deployable.

## Change control
Update this file and the live folder PROJECT_STATUS.md before and after implementation work. Never mutate data.json without a timestamped, hash-verified copy.



## Critical startup blocker found during final verification
- The Windows Startup launcher is present and points to the correct live folder and static ngrok domain.
- M3T_AUTH_SECRET, M3T_WRITE_TOKEN, and CORS_ORIGINS are not configured at process, user, or machine scope.
- The launcher does not provide those settings, so authenticated and write routes cannot operate correctly after startup.
- Resolution requires an approved credential-storage and launcher update; no credentials were generated or changed during catch-up.

