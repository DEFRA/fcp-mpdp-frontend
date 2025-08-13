import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Header,
  Radios,
  SkipLink,
  initAll
} from 'govuk-frontend'
import schemePaymentsByYear from './scheme-payments-by-year.js'

createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Header)
createAll(Radios)
createAll(SkipLink)

schemePaymentsByYear.init()

initAll()
