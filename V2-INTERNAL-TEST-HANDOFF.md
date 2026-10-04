# Dispatch V2 Internal Test Handoff

## Branch
- `v2`

## What to validate first
1. Role behavior
   - Tech cannot add projects/delete items/admin techs
   - Project Manager can add projects but cannot admin-tech manage
   - System Admin can manage techs and feature toggles

2. Project page workflow
   - Address copy + maps actions
   - Daily notes save/display
   - Time events + rollup summary
   - Closeout checklist save

3. Closeout toggle behavior
   - In Admin overlay, toggle required photo enforcement ON/OFF
   - Verify closeout save rejects missing photos when ON

4. PM summary
   - Confirm total/overdue/at-risk counts
   - Confirm hours by tech signal appears

## Commands
- `restart-stack.bat`
- `Project-Management\v2-smoke-test.bat`
- `Project-Management\v2-role-audit.ps1`

## Notes
- V1 remains on `main`
- V2 is active development branch only


---

## Verified catch-up note - 2026-10-03

This handoff's original branch language is historical. The v2 branch is now an ancestor of main; the current root frontend on main is the active integrated line. The live API was stopped during catch-up, and current endpoints require authentication. See CURRENT_STATUS.md for the verified baseline, test-safety warnings, and rollback snapshot.
