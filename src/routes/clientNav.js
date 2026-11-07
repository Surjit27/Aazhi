import {
  Activity,
  Calendar,
  CalendarClock,
  FolderKanban,
  FolderTree,
  History,
  LayoutDashboard,
  Mail,
  Settings,
  Shield,
  Users,
  Workflow,
} from 'lucide-react'

/** Collapsible **Deep Backend** children. */
export const CLIENT_DEEP_BACKEND_NAV = [
  {
    to: '/deep/explorer',
    label: 'Backend Explorer',
    icon: FolderTree,
    flagKey: 'client.backends',
    keywords: 'backend explorer architecture discovery connect',
  },
  {
    to: '/deep/scheduler',
    label: 'Event Scheduler',
    icon: Calendar,
    flagKey: 'client.scheduler',
    keywords: 'event scheduler cron trigger',
  },
  {
    to: '/deep/flow-studio',
    label: 'Flow Studio',
    icon: Workflow,
    flagKey: 'client.backends',
    keywords: 'flow studio execution flow visual',
  },
  {
    to: '/deep/executions',
    label: 'Execution Activity',
    icon: Activity,
    flagKey: 'client.monitor',
    keywords: 'execution activity trace replay',
  },
]

/** Client Access: roles catalog + tenant user management (not platform admin screens). */
export const CLIENT_ACCESS_NAV = [
  { to: '/access/roles', label: 'Roles', icon: Shield, flagKey: 'client.account', keywords: 'roles super admin' },
  {
    to: '/access/users',
    label: 'User management',
    icon: Users,
    flagKey: 'client.account',
    keywords: 'users invite tenant',
  },
]

export const CLIENT_HISTORY_NAV = [
  {
    to: '/history/users',
    label: 'User history',
    icon: History,
    flagKey: 'client.account',
    keywords: 'history users activity',
  },
  {
    to: '/history/emails',
    label: 'Email history',
    icon: Mail,
    flagKey: 'client.account',
    keywords: 'history emails',
  },
  {
    to: '/history/jobs',
    label: 'Job history',
    icon: CalendarClock,
    flagKey: 'client.scheduler',
    keywords: 'history jobs scheduler',
  },
]

/** Pages section (admin parity): Jobs + Settings. */
export const CLIENT_PAGES_NAV = [
  {
    to: '/jobs',
    label: 'Jobs',
    icon: Calendar,
    flagKey: 'client.scheduler',
    keywords: 'jobs triggers schedule bullmq',
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
    flagKey: 'client.settings',
    keywords: 'settings preferences email',
  },
]

export const CLIENT_NAV = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true,
    flagKey: 'client.backends',
    keywords: 'dashboard overview',
  },
  {
    to: '/projects',
    label: 'Projects',
    icon: FolderKanban,
    flagKey: 'client.backends',
    keywords: 'projects workspace',
  },
  ...CLIENT_DEEP_BACKEND_NAV,
  ...CLIENT_ACCESS_NAV,
  ...CLIENT_HISTORY_NAV,
  ...CLIENT_PAGES_NAV,
]
