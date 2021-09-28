'use strict'

// eslint-disable-next-line no-unused-vars
const { CSV_VALUES, CSV_HEADERS } = parseCSV(CSV_DATA)

function updateEvents (map, chart) {
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
      chart.selectedIndicator = selectedIndicator
      chart.updateChart()
      updateYearRange(selectedIndicator)
    })

  document
    .getElementById('indicator-year')
    .addEventListener('input', (evt) => {
      selectedYear = evt.target.value
      map.currentYear = selectedYear
      map.updateDisplay()
    })

  // Map
  window.addEventListener('resize', (evt) => {
    map.resize()
    chart.resize()
  })

  document
    .getElementById('reset-zoom-button')
    .addEventListener('click', map.resetZoom.bind(map))

  document.getElementById('map').addEventListener('click', chart.updateChart.bind(chart))
  document.getElementById('selected-countries').addEventListener('click', chart.updateChart.bind(chart))
}

function main () {
  initIndicators()
  initYearRange(selectedIndicator)

  bulmaSlider.attach()

  const countryManagement = new CountryManagement()
  const map = new WorldHeatMap(
    CSV_VALUES,
    WORLD_MAP_JSON,
    selectedIndicator,
    selectedYear,
    countryManagement,
    [POPULATION_COLUMN, PIB_COLUMN]
  )

  const chart = new Chart(
    CSV_VALUES,
    selectedIndicator,
    countryManagement
  )

  updateEvents(map, chart)
}

// Use window.onload event to launch the main function when loading process has ended
window.onload = main
