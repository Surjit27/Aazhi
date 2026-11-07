import {
  Activity,
  Calendar,
  CalendarClock,
  Cloud,
  FolderKanban,
  FolderTree,
  GitBranch,
  Network,
  History,
  LayoutDashboard,
  Mail,
  Settings,
  Shield,
  Users,
} from 'lucide-react'

/** Collapsible **Deep Backend** children. */
export const CLIENT_DEEP_BACKEND_NAV = [
  {
    to: '/deep/explorer',
    label: 'Backend Explorer',
    icon: FolderTree,
    flagKey: 'client.account',
    keywords: 'backend explorer architecture discovery connect',
  },
  {
    to: '/deep/orchestration',
    label: 'Orchestration',
    icon: Network,
    flagKey: 'client.account',
    keywords: 'orchestration airflow simulation data pipeline',
  },
  {
    to: '/deep/scheduler',
    label: 'Event Scheduler',
    icon: Calendar,
    flagKey: 'client.account',
    keywords: 'event scheduler cron trigger',
  },
  {
    to: '/deep/executions',
    label: 'Execution Activity',
    icon: Activity,
    flagKey: 'client.account',
    keywords: 'execution activity trace replay',
  },
  {
    to: '/integrations/github',
    label: 'GitHub connections',
    icon: GitBranch,
    flagKey: 'client.account',
    keywords: 'github oauth token private repository',
  },
  {
    to: '/integrations/cloud',
    label: 'Cloud deployment',
    icon: Cloud,
    flagKey: 'client.account',
    keywords: 'aws gcp azure cloud scheduler deploy',
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
    flagKey: 'client.account',
    keywords: 'history jobs activity',
  },
  {
    to: '/jobs',
    label: 'Scheduled jobs',
    icon: Calendar,
    flagKey: 'client.account',
    keywords: 'jobs listing triggers schedule bullmq',
  },
]

/** Pages section — Settings stays visible even if feature flags hide other client paths. */
export const CLIENT_PAGES_NAV = [
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
    flagKey: 'client.settings',
    alwaysShow: true,
    keywords: 'settings preferences account',
  },
]

export const CLIENT_NAV = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true,
    flagKey: 'client.account',
    keywords: 'dashboard overview',
  },
  {
    to: '/projects',
    label: 'Projects',
    icon: FolderKanban,
    flagKey: 'client.account',
    keywords: 'projects workspace',
  },
  ...CLIENT_DEEP_BACKEND_NAV,
  ...CLIENT_ACCESS_NAV,
  ...CLIENT_HISTORY_NAV,
  ...CLIENT_PAGES_NAV,
]
