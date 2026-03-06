# V2 Role Enforcement Matrix

## Roles
- technician
- project_manager
- system_admin

## Permissions

### technician
- Can view: own/default schedule, selected tech/all (view-only scope)
- Can update: task/material statuses, time events, daily notes, attachments
- Cannot: add/remove techs, system settings, full admin actions

### project_manager
- Can view: all schedules, PM summary, project progress, timeline
- Can update: assignments, project status fields
- Cannot: system-admin-only controls (tech lifecycle + global settings)

### system_admin
- Full access, including:
  - technician add/remove/activate/deactivate
  - role defaults and feature toggles
  - full audit/control operations

## UI Enforcement Targets
- Header role mode includes all 3 roles
- Admin-only buttons hidden/disabled unless system_admin
- PM summary visible to project_manager and system_admin only
