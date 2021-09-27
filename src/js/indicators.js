'use strict'

// eslint-disable-next-line no-unused-vars
let selectedIndicator = ''

function isIndicator (string) {
  return (
    string !== 'Country_Name' && string !== 'Year' && string !== 'ISO_Country'
  )
}

// eslint-disable-next-line no-unused-vars
function initIndicators (map) {
  const selector = document.getElementById('indicators-select')

  for (const header of CSV_HEADERS) {
    if (isIndicator(header)) {
      const option = document.createElement('option')
      option.value = header
      option.innerHTML = header
      selector.appendChild(option)
    }
  }

  selectedIndicator = selector.value
}
