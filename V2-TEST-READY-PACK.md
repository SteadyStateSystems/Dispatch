# Dispatch V2 Test-Ready Pack

## Scope covered
- RBAC scaffolding (Tech / PM / System Admin)
- Schedule range views (Today / Week / Next 2 Weeks)
- Time-event engine with transition validation and rollups
- Tech admin APIs + UI wiring
- Daily notes + address actions
- PM summary baseline
- Closeout checklist scaffold

## Pre-test startup
1. Run `restart-stack.bat` from Desktop
2. Run `v2-smoke-test.bat` from `Project-Management`
3. Open V2 branch preview/build environment

## Manual acceptance checklist
- Dashboard loads without JS console errors
- Role dropdown supports Tech/PM/System Admin
- Add Project supports schedule/contact fields
- Project page shows location/address/contact correctly
- Copy Address and Open in Maps work
- Time buttons save and rollup updates
- Daily notes save and display
- Closeout checklist saves and reloads
- PM summary appears only for PM/Admin
- Tech admin functions available only to System Admin

## Known limitations (current)
- Full financial workflow remains future phase
- Required-photo enforcement is scaffolded, not strict-blocking yet
- Schedule optimization/routing engine not yet implemented

## Rollback
- V1 remains on `main`
- V2 changes isolated to `v2` branch
- Revert by switching deployment source back to `main`
