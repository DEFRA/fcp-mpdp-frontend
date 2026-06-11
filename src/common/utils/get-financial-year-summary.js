function sortFinancialYears (financialYears) {
  return financialYears.sort((a, b) => {
    const [, endYearA] = a.split('/')
    const [, endYearB] = b.split('/')

    return Number.parseInt(endYearA) - Number.parseInt(endYearB)
  })
}

export function getFinancialYearSummary (financialYears) {
  const sortedFinancialYears = sortFinancialYears(financialYears)

  if (!financialYears || financialYears.length === 0) {
    return {}
  }

  return {
    sortedFinancialYears,
    startYear: `20${sortedFinancialYears[0].split('/')[0]}`,
    endYear: `20${sortedFinancialYears[sortedFinancialYears.length - 1].split('/')[1]}`
  }
}
