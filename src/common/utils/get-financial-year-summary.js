function sortFinancialYears (financialYears) {
  return financialYears.sort((a, b) => {
    const [, endYearA] = a.split('/')
    const [, endYearB] = b.split('/')
    return parseInt(endYearA) - parseInt(endYearB)
  })
}

export function getFinancialYearSummary (financialYears) {
  /* eslint-disable camelcase */
  const financial_years = sortFinancialYears(financialYears)

  if (!financialYears || financialYears.length === 0) {
    return {}
  }

  return {
    financial_years,
    startYear: `20${financial_years[0].split('/')[0]}`,
    endYear: `20${financial_years[financial_years.length - 1].split('/')[1]}`
  }
  /* eslint-enable camelcase */
}
