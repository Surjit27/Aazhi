/** Mirrors backend src/lib/personalSettings.js defaults. */
export const PERSONAL_SETTINGS_DEFAULTS = {
  ui: {
    timezone: 'UTC',
    compactSidebar: false,
  },
  notifications: {
    emailDigest: true,
    jobFailures: true,
  },
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function mergePersonalSettingsDefaults(raw) {
  const source = isPlainObject(raw) ? raw : {}
  const ui = isPlainObject(source.ui) ? source.ui : {}
  const notifications = isPlainObject(source.notifications) ? source.notifications : {}
  return {
    ui: { ...PERSONAL_SETTINGS_DEFAULTS.ui, ...ui },
    notifications: { ...PERSONAL_SETTINGS_DEFAULTS.notifications, ...notifications },
  }
}