'use strict'

// eslint-disable-next-line no-unused-vars
let selectedIndicator = ''
// eslint-disable-next-line no-unused-vars
let selectedIndicatorScatter = ''

function isIndicator (string) {
  return (
    string !== 'Country_Name' && string !== 'Year' && string !== 'ISO_Country'
  )
}

// eslint-disable-next-line no-unused-vars
function initIndicators (map) {
  const selector = document.getElementById('indicators-select')
  const selectorScatter = document.getElementById('scatter-select')

  for (const header of CSV_HEADERS) {
    if (isIndicator(header)) {
      for (const currentSelector of [selector, selectorScatter]) {
        const option = document.createElement('option')
        option.value = header
        option.innerHTML = header
        currentSelector.appendChild(option)
      }
    }
  }

  selectedIndicator = selector.value
  selectedIndicatorScatter = selectorScatter.value
}
