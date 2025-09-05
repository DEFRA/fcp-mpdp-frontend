import { initAll } from 'govuk-frontend'
import schemePaymentsByYear from './scheme-payments-by-year.js'
import search from './search.js'
import sortByDropdown from './sort-by-dropdown.js'
import searchFilters from './search-filters.js'
import searchForm from './search-form.js'
import searchFilterTags from './search-filter-tags.js'

schemePaymentsByYear.init()
search.init()
sortByDropdown.init()
searchFilters.init()
searchForm.init()
searchFilterTags.init()

initAll()
