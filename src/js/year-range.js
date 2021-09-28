'use strict'

// eslint-disable-next-line prefer-const
let selectedYear = 2000
const yearRange = document.getElementById('indicator-year')

function getMinMaxYear (rawValues, column) {
  const values = rawValues.filter((val) => val[column] !== '')
  const min = +values.reduce((prev, curr) =>
    +prev.Year < +curr.Year ? prev : curr
  ).Year
  const max = +values.reduce((prev, curr) =>
    +prev.Year > +curr.Year ? prev : curr
  ).Year
  return { min: min, max: max }
}

// eslint-disable-next-line no-unused-vars
function initYearRange (column) {
  updateYearRange(column)
  yearRange.value = selectedYear
}

function updateYearRange (column) {
  const { min, max } = getMinMaxYear(CSV_VALUES, column)
  yearRange.min = min
  yearRange.max = max
  yearRange.step = 1

  const outputElement = document.getElementsByTagName('output')[0]
  outputElement.innerText = selectedYear
}
