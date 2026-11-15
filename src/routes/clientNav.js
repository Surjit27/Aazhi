import {
  Calendar,
  CalendarClock,
  Cloud,
  FolderKanban,
  FolderTree,
  GitBranch,
  LayoutGrid,
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
    keywords: 'backend explorer architecture discovery connect',
  },
  {
    to: '/deep/pager',
    label: 'Pager',
    icon: LayoutGrid,
    keywords: 'pager n8n workflow host webhook ai automation',
  },
  {
    to: '/deep/scheduler',
    label: 'Event Scheduler',
    icon: Calendar,
    keywords: 'event scheduler cron trigger',
  },
  {
    to: '/integrations/github',
    label: 'GitHub connections',
    icon: GitBranch,
    keywords: 'github oauth token private repository',
  },
  {
    to: '/integrations/cloud',
    label: 'Cloud deployment',
    icon: Cloud,
    keywords: 'aws gcp azure cloud scheduler deploy',
  },
]

/** Client Access: roles catalog + tenant user management (not platform admin screens). */
export const CLIENT_ACCESS_NAV = [
  { to: '/access/roles', label: 'Roles', icon: Shield, keywords: 'roles super admin' },
  {
    to: '/access/users',
    label: 'User management',
    icon: Users,
    keywords: 'users invite tenant',
  },
]

export const CLIENT_HISTORY_NAV = [
  {
    to: '/history/users',
    label: 'User history',
    icon: History,
    keywords: 'history users activity',
  },
  {
    to: '/history/emails',
    label: 'Email history',
    icon: Mail,
    keywords: 'history emails',
  },
  {
    to: '/history/jobs',
    label: 'Job history',
    icon: CalendarClock,
    keywords: 'history jobs activity',
  },
  {
    to: '/jobs',
    label: 'Scheduled jobs',
    icon: Calendar,
    keywords: 'jobs listing triggers schedule bullmq',
  },
]

export const CLIENT_PAGES_NAV = [
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
    keywords: 'settings preferences account',
  },
]

export const CLIENT_NAV = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true,
    keywords: 'dashboard overview',
  },
  {
    to: '/projects',
    label: 'Projects',
    icon: FolderKanban,
    keywords: 'projects workspace',
  },
  ...CLIENT_DEEP_BACKEND_NAV,
  ...CLIENT_ACCESS_NAV,
  ...CLIENT_HISTORY_NAV,
  ...CLIENT_PAGES_NAV,
]
