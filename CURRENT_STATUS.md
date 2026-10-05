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

## Authentication modernization started 2026-10-04
- User approved invitation-only employee accounts using unique email addresses, secure password hashes, one-time setup/reset links, revocable sessions, and server-enforced roles.
- Planned initial roles: technician, project_manager, and system_admin. Open public registration is explicitly out of scope.
- Existing plaintext users in data.json will not be migrated with their old passwords. They will be disabled as login records and must establish new credentials through an invitation.
- Authentication state will move to a separate local SQLite database; operational project records remain in data.json during this phase.
- The legacy client-side role selector and role headers are not trusted authorization and will be removed from the active root frontend.
- Finance reads require project_manager or system_admin; user/security administration requires system_admin.
- Fresh verified rollback point: C:\Users\asshole\Desktop\M3T-PreAuth-20261004-164758 (93 files, valid Git bundle, SHA256SUMS.json).
- Baseline Git commit before this phase: 3ed7ed5961d6def804d3a7bb5e98a985d7cf43b3.
- Baseline data.json SHA-256: 59AE36C262A625B37FE3074F5D4DAD9CE67D21D2C9F90A3C096B40F499AA1E49.
- Runtime remains stopped. No production data mutation or credential creation has occurred yet.

### Bounded implementation
1. Add the SQLite account/session/invitation store and Argon2id password hashing.
2. Add one-time administrator bootstrap, invitation acceptance, login/logout/session, reset, and account-management routes.
3. Enforce the role matrix on every sensitive API route and eliminate the shared write token from browser authorization.
4. Replace client-side role switching with authenticated session state.
5. Add isolated temporary-database tests and prove that live JSON hashes do not change.
6. Generate runtime secrets in an ACL-restricted local configuration, repair startup, then verify local and tunnel paths.

## Authentication implementation checkpoint 2026-10-04
- Frontend authentication and account administration were committed and pushed as ca845cc.
- Live API now uses a separate SQLite authentication database at C:\Users\asshole\AppData\Local\M3T\auth.sqlite.
- Passwords use Argon2id hashes. Sessions, invitations, and password-reset tokens are random, stored only as SHA-256 token hashes, expire, and can be revoked.
- Account creation is invitation-only. Email is the unique login identity. Public self-registration is not implemented.
- Implemented roles:
  - technician: assigned technician data/work only; finance fields removed and cross-technician writes rejected.
  - project_manager: project, dispatch, and finance access; no user/security administration.
  - system_admin: full access plus invitations, resets, account status, technician lifecycle, and settings.
- Finance read routes now require project_manager/system_admin. User administration requires system_admin.
- Browser role switching and trusted role headers were removed from the active root frontend.
- Legacy plaintext data.json users are ignored by the new authentication store and their passwords were not migrated.
- Legacy hardcoded-token tests were removed from the live folder after the verified snapshot. Replacement tests use temporary JSON and SQLite files.
- Windows staging and live isolated suites each passed 7/7 tests. npm audit reported zero vulnerabilities.
- Live data.json, log.json, and undo-queue.json hashes remained identical to the pre-authentication baseline.
- The live launcher and Startup launcher match and use the ACL-restricted auth database plus explicit CORS origins.
- A local runtime probe returned 200 for /health and 401 for unauthenticated /data.
- The obsolete loaded Node process and its ngrok process were stopped. Port 3000 and ngrok are intentionally stopped pending first-administrator bootstrap.
- Authentication database currently contains zero users. Activation requires the owner's email address and display name to generate the one-time system-administrator invitation.

### Rollback
1. Stop the exact M3T Node/ngrok processes.
2. Restore live and repository files from C:\Users\asshole\Desktop\M3T-PreAuth-20261004-164758 and verify SHA256SUMS.json.
3. Restore Git from Project-Management.bundle only with explicit approval.
4. The new auth database is separate at C:\Users\asshole\AppData\Local\M3T; preserve it unless the account system itself is intentionally rolled back.

## First administrator activation 2026-10-04
- The first system-administrator invitation was created for the owner; the one-time token is intentionally not recorded here.
- The API is running from the ACL-restricted authentication database and local /health returned 200.
- Unauthenticated local /data returned 401 as required.
- The static ngrok tunnel is online and remote /health returned 200.
- data.json SHA-256 remains 59AE36C262A625B37FE3074F5D4DAD9CE67D21D2C9F90A3C096B40F499AA1E49.
- The authenticated browser client is deployed at https://steadystatesystems.github.io/Dispatch/; the ngrok root is the API-hosted legacy static copy and must not be used as the invitation frontend.
- Remaining manual step: the owner must open the one-time Dispatch invitation URL, choose a password, and sign in. Full login verification is pending that password-setting step.

## Responsive UI correction started 2026-10-04
- Owner screenshots confirmed malformed account presentation, raw role identifiers, dashboard controls that crowd on mobile, project controls that overflow the card, and excessive header/card sizing in landscape.
- The invitation/reset forms also require a password visibility control and password confirmation before submission.
- Active branch is `main` at `cff7c03`, matching `origin/main`; only generated `.next/` and `node_modules/` folders are untracked in the Windows repository.
- API and static ngrok health checks return 200. Production `data.json`, `log.json`, and `undo-queue.json` hashes remain at their authentication baseline values.
- Verified pre-change snapshot: `C:\Users\asshole\Desktop\M3T-PreUI-20261004-185218` (96 files, valid Git bundle, SHA-256 manifest verified).

### Bounded UI work
1. Normalize the displayed account name and render friendly role labels.
2. Add accessible show/hide controls and matching-password confirmation to invitation/reset forms.
3. Reflow dashboard and project toolbars for narrow and landscape viewports without horizontal overflow.
4. Run syntax/build checks plus mobile and desktop visual regression checks before deployment.

## Responsive UI correction completed 2026-10-04
- Project Managers and System Administrators now land on a flat, clickable Jobs view showing all technicians' matching jobs.
- A Jobs/Technicians switch changes to a clickable technician list; selecting a technician expands that technician's jobs and each job opens the existing project detail screen.
- Technician accounts retain their technician-scoped view.
- Account names are normalized for display and raw role identifiers are replaced by friendly labels.
- Invitation and reset forms require matching passwords; sign-in, invitation, and reset forms provide accessible Show/Hide controls.
- Dashboard and project controls now wrap at narrow widths; portrait mobile controls use full-width inputs/buttons and short landscape layouts no longer reserve fixed-header space.
- Cache-busting query versions were advanced for the changed CSS and JavaScript assets.
- Verification completed: `node --check` passed for all changed JavaScript, `git diff --check` passed, and an isolated DOM test passed PM Jobs default, technician switching, friendly labels, password visibility, and mismatch rejection. Full Playwright rendering was unavailable on the Gateway because its Chromium runtime lacks system libraries; no production data was used by the isolated test.


### Deployment verification
- Frontend implementation commit: d569176.
- GitHub Pages serves the new Jobs/Technicians navigation and password confirmation assets.
- Local and static-ngrok health checks return 200.
- Production data.json, log.json, and undo-queue.json SHA-256 values match the verified pre-UI snapshot.
- Windows repository matches origin/main; only known generated .next/ and node_modules/ folders are untracked.

## PM summary readability refinement started 2026-10-04
- Owner requested the PM summary be converted from a dense inline sentence into a readable list inside a white job-style card.
- Active branch is main at 14da41e, matching origin/main; only generated .next/ and node_modules/ folders are untracked.
- Verified rollback snapshot: C:\Users\asshole\Desktop\M3T-PreSummary-20261004-201752 (96 files, valid Git bundle, SHA-256 manifest verified).
- Bounded work: change only the PM summary presentation and related responsive styling/cache versions, then run syntax, isolated DOM, diff, deployment, health, and live-data integrity checks.

## PM summary readability refinement completed 2026-10-04
- PM/System Administrator dashboards now show PM Summary inside a white job-style card with one labeled metric per row.
- Technician hours render as a nested name/value list instead of compressed inline text.
- The card stacks labels and values on narrow screens while retaining two-column rows on wider screens.
- Cache versions advanced to 20261004-3 for styles.css and main.js.
- Verification passed: node --check, git diff --check, and an isolated DOM/CSS test covering all 10 summary rows and technician-hour entries.
- Browser-rendered screenshots remain unverified because the Gateway Chromium lacks libnspr4 and the Windows browser listener owner could not be authenticated.
- Local and static-ngrok health checks return 200; production JSON hashes remain unchanged.
- Rollback snapshot: C:\Users\asshole\Desktop\M3T-PreSummary-20261004-201752.

### PM summary deployment verification
- Frontend implementation commit: 6c5f54a.
- GitHub Pages deployment for 6c5f54a completed successfully and serves cache version 20261004-3, the pm-summary-card markup, and the responsive card styles.
- Local and static-ngrok health checks return 200.
- Production data.json, log.json, and undo-queue.json SHA-256 values match the pre-change baseline.
- Windows repository matches origin/main; only known generated .next/ and node_modules/ folders remain untracked.


## PM summary collapse refinement started 2026-10-04
- Owner requested the PM Summary card be collapsed by default and expand when clicked.
- Active branch is main at 746a03f, matching origin/main; only generated .next/ and node_modules/ folders are untracked.
- Verified rollback snapshot: C:\Users\asshole\Desktop\M3T-PreSummaryCollapse-20261004-210813 (96 files, valid Git bundle, SHA-256 manifest verified).
- Bounded work: add an accessible collapsed-by-default disclosure to the existing PM summary card, preserve its list presentation when expanded, advance cache versions, and run syntax, DOM/CSS, diff, deployment, health, and production-data integrity checks.

