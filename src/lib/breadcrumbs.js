import { BRAND_NAME } from '../components/ui/Brand.jsx'

/** Prefix page breadcrumbs with the product name (`deepe`). */
export function brandBreadcrumbs(...segments) {
  return [BRAND_NAME, ...segments]
}