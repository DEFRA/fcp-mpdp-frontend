import { config } from '../../../config/config.js'

const getPageTitle = (route) => config.routes[route]?.pageTitle || ''

export { getPageTitle }
