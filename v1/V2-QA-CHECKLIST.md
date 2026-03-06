# V2 QA Checklist

## Role / Access
- [ ] Technician cannot access admin-only actions
- [ ] Project Manager can view PM summary but not system-admin controls
- [ ] System Admin can access full controls

## Scheduling Views
- [ ] Today filter works
- [ ] This Week filter works
- [ ] Next 2 Weeks filter works
- [ ] Tech dropdown supports own tech, specific tech, and all tech

## Project Flow
- [ ] Add Project works with required fields
- [ ] Site contact fields save and display
- [ ] Address copy and open maps actions work
- [ ] Daily notes save and render in order

## Time Tracking
- [ ] Valid transitions accepted
- [ ] Invalid transitions rejected with clear error
- [ ] Rollup endpoint returns expected totals

## Stability
- [ ] No console syntax/runtime errors on dashboard
- [ ] No console syntax/runtime errors on project page
- [ ] Smoke endpoints all return 200
