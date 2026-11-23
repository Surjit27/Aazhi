import PortalAuthLayout from './PortalAuthLayout.jsx'

/** home.localhost `/login` and `/signup` — plain auth shell (no marketing hyperspeed). */
export default function HomeClientAuthLayout(props) {
  return <PortalAuthLayout portal="home" {...props} />
}
