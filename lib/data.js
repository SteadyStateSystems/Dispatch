export const dashboard = {
  kpis: [
    { label: 'Open Tasks', value: '14', note: 'Across backlog + active work' },
    { label: 'Scheduled Jobs', value: '9', note: 'Cron and recurring automations' },
    { label: 'Active Projects', value: '6', note: 'High-leverage priorities' },
    { label: 'Agents Online', value: '4', note: 'Primary + specialist workers' }
  ],
  columns: [
    {
      name: 'Backlog',
      items: [
        { id: 'b1', title: 'Publish weekly operator update', owner: 'Henry' },
        { id: 'b2', title: 'Review inbound leads flow', owner: 'Alex' }
      ]
    },
    {
      name: 'In Progress',
      items: [
        { id: 'p1', title: 'Refine mission-control mobile layout', owner: 'Henry' },
        { id: 'p2', title: 'Document Telegram operations policy', owner: 'Henry' }
      ]
    },
    {
      name: 'Review',
      items: [
        { id: 'r1', title: 'Central PA feed quality check', owner: 'Alex' }
      ]
    },
    {
      name: 'Done',
      items: [
        { id: 'd1', title: 'Split dispatch + central PA repos', owner: 'Henry' },
        { id: 'd2', title: 'Telegram channel link + verification', owner: 'Henry' }
      ]
    }
  ],
  activity: [
    { time: '20:41', text: 'Dispatch repo reorganized into v1/v2 structure.' },
    { time: '20:52', text: 'Central PA opportunities pushed to dedicated repo.' },
    { time: '21:05', text: 'Mission Control build started with read-only policy.' },
    { time: '21:10', text: 'Public-access requirement set, no page input to agent.' }
  ],
  modules: [
    { name: 'Task Board', desc: 'Kanban + ownership for complete visibility of work in flight.' },
    { name: 'Calendar', desc: 'Single pane for scheduled jobs and proactive behavior checks.' },
    { name: 'Projects', desc: 'Tracks progress against high-value outcomes to avoid drift.' },
    { name: 'Memories', desc: 'Daily + long-term memory browser for continuity.' },
    { name: 'Docs', desc: 'Searchable repository of generated docs and drafts.' },
    { name: 'Team', desc: 'Agent roles, hierarchy, and mission statement alignment.' },
    { name: 'Office', desc: 'Visual layer for agent-at-work status and quick confidence checks.' }
  ]
};
