import PersonalSettingsPanel from '../../components/settings/PersonalSettingsPanel.jsx'
import PasswordChangePanel from '../../components/settings/PasswordChangePanel.jsx'

export default function AdminPersonalSettingsSection() {
  return (
    <div className="flex flex-col gap-6 px-6 pb-10 pt-2">
      <PersonalSettingsPanel
        title="Personal"
        description="Preferences for your admin account — separate from platform email and API configuration."
      />
      <PasswordChangePanel />
    </div>
  )
}