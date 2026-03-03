# Dispatch V2 Architecture (Kickoff)

## Phase 1 (current)
1. RBAC scaffolding
2. Tech-focused schedule views (Today / This Week / Next 2 Weeks)
3. Time event engine (Travel To / On Site / Travel From)

## RBAC roles
- system_admin
- project_manager
- technician

## System Admin management functions
- Add technician
- Remove technician
- Activate/deactivate technician
- Assign role/profile defaults

## Initial permission boundaries
- system_admin: all
- project_manager: planning/assignment/reporting, no system-level config
- technician: own assignments, status/time/notes/photos

## Time event model (v1)
Event types:
- travel_to_start
- onsite_start
- travel_from_start
- travel_from_end
- break_start
- break_end

Required metadata:
- user
- tech
- project
- timestamp
- source (mobile/web)
- note (optional)

Rollups:
- travel_to_minutes
- onsite_minutes
- travel_from_minutes
- break_minutes
- total_minutes

## Views
- My Day (default)
- My Week
- Next 2 Weeks

Data fields required per assignment:
- scheduledStart
- scheduledEnd
- assignedTech
- priority
- status
- siteContactName
- siteContactPhone
- location

## Notes
V1 remains stable on `main`.
All V2 development occurs on branch `v2` until merge-approved.
