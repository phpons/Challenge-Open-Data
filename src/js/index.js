'use strict'

// eslint-disable-next-line no-unused-vars
const { CSV_VALUES, CSV_HEADERS } = parseCSV(CSV_DATA)

function updateEvents (map) {
  // Navbar
  const navbarBurger = document.getElementById('navbar-burger')
  navbarBurger.addEventListener('click', (evt) => {
    const target = navbarBurger.dataset.target
    document.getElementById(target).classList.toggle('is-active')
    navbarBurger.classList.toggle('is-active')
  })

  // Indicators
  document
    .getElementById('indicators-select')
    .addEventListener('change', (evt) => {
      selectedIndicator = evt.target.value
      map.valuesColumn = selectedIndicator
      map.updateDisplay()
      updateYearRange(selectedIndicator)
    })

  document
    .getElementById('indicator-year')
    .addEventListener('input', (evt) => {
      selectedYear = evt.target.value
      map.currentYear = selectedYear
      map.updateDisplay()
      updateYearDisplay()
    })

  // Map
  window.addEventListener('resize', map.resize.bind(map))
  document
    .getElementById('reset-zoom-button')
    .addEventListener('click', map.resetZoom.bind(map))
}

function main () {
  initIndicators()
  initYearRange(selectedIndicator)

  const countryManagement = new CountryManagement()
  const map = new WorldHeatMap(
    CSV_VALUES,
    WORLD_MAP_JSON,
    'ISO_Country',
    'Country_Name',
    selectedIndicator,
    'Year', selectedYear,
    countryManagement
  )

  updateEvents(map)
}

// Use window.onload event to launch the main function when loading process has ended
window.onload = main
