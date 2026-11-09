import PortalAuthLayout from './PortalAuthLayout.jsx'

/** Home marketing hostname — same chrome as client/admin auth. */
export default function HomeClientAuthLayout(props) {
  return <PortalAuthLayout portal="home" {...props} />
}
