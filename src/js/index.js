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
      map.updateDisplay()
    })

  // Map
  window.addEventListener('resize', map.resize.bind(map))
  document
    .getElementById('reset-zoom-button')
    .addEventListener('click', map.resetZoom.bind(map))
}

function main () {
  initIndicators()

  const filteredValues = CSV_VALUES.filter((val) => val.Year === selectedYear)

  const countryManagement = new CountryManagement()
  const map = new WorldHeatMap(
    filteredValues,
    WORLD_MAP_JSON,
    'ISO_Country',
    'Country_Name',
    countryManagement
  )

  updateEvents(map)
}

// Use window.onload event to launch the main function when loading process has ended
window.onload = main
