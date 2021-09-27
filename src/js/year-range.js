'use strict'

let selectedYear = 2000
const yearRange = document.getElementById('indicator-year')
const yearRangeList = document.getElementById('indicator-year-list')

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
function getRange (start, end) {
  return new Array(end - start + 1).fill(undefined).map((_, i) => start + i)
}

// eslint-disable-next-line no-unused-vars
function initYearRange (column) {
  updateYearRange(column)
  yearRange.value = selectedYear
}

function updateYearDisplay (domain) {
  const currentYearDisplay = document.getElementById('current-year')
  if (domain !== undefined) {
    selectedYear = selectedYear < domain[0] ? domain[0] : selectedYear
    selectedYear = selectedYear > domain[1] ? domain[1] : selectedYear
    yearRange.dispatchEvent(new Event('input'))
  }
  currentYearDisplay.innerText = selectedYear
}

function updateYearRange (column) {
  const { min, max } = getMinMaxYear(CSV_VALUES, column)
  const yearValueRange = getRange(min, max)
  yearRange.min = min
  yearRange.max = max
  yearRange.step = 1
  yearRangeList.innerHTML = ''
  yearValueRange.forEach((year) => {
    const opt = document.createElement('option')
    opt.value = year
    opt.label = year
    yearRangeList.appendChild(opt)
  })
  updateYearDisplay([min, max])
}
