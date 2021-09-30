'use strict'

// eslint-disable-next-line no-unused-vars
const { CSV_VALUES, CSV_HEADERS } = parseCSV(CSV_DATA)
const CHARTS_ELEMENT = document.getElementById('charts')

let mapWidthSave

function updateCharts (countryManagement, lineChart, barChart) {
  if (countryManagement.getSelectedCountries().length) {
    CHARTS_ELEMENT.classList.remove('is-hidden')
    lineChart.updateChart()
    barChart.updateChart()
  } else {
    CHARTS_ELEMENT.classList.add('is-hidden')
  }
}

function updateEvents (map, countryManagement, lineChart, barChart, scatterChart) {
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

      lineChart.selectedIndicator = selectedIndicator
      lineChart.updateChart()

      barChart.selectedIndicator = selectedIndicator
      barChart.updateChart()

      scatterChart.selectedIndicatorX = selectedIndicator
      scatterChart.updateChart()

      updateYearRange(selectedIndicator)
    })

  document
    .getElementById('indicator-year')
    .addEventListener('input', (evt) => {
      selectedYear = evt.target.value
      map.currentYear = selectedYear
      map.updateDisplay()

      barChart.currentYear = selectedYear
      barChart.updateChart()

      scatterChart.currentYear = selectedYear
      scatterChart.updateChart()
    })

  document
    .getElementById('scatter-select')
    .addEventListener('change', (evt) => {
      selectedIndicatorScatter = evt.target.value
      scatterChart.selectedIndicatorY = selectedIndicatorScatter
      scatterChart.updateChart()
    })

  // Map
  window.addEventListener('resize', (evt) => {
    map.resize()
    lineChart.resize()
    barChart.resize()
    scatterChart.resize()
  })

  document.getElementById('reset-zoom-button').addEventListener('click', map.resetZoom.bind(map))

  document.getElementById('map').addEventListener('click', (evt) => {
    updateCharts(countryManagement, lineChart, barChart)
  })

  // Selected countries
  document.getElementById('selected-countries').addEventListener('click', (evt) => {
    updateCharts(countryManagement, lineChart, barChart)
  })

  // Print
  window.addEventListener('beforeprint', () => {
    mapWidthSave = document.getElementById('visualization').style.width
    document.getElementById('visualization').style.width = '1150px'
    map.resize()
  })

  window.addEventListener('afterprint', () => {
    document.getElementById('visualization').style.width = mapWidthSave
    map.resize()
  })
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

  const lineChart = new LineChart(
    CSV_VALUES,
    countryManagement,
    selectedIndicator
  )

  const barChart = new BarChart(
    CSV_VALUES,
    countryManagement,
    selectedIndicator,
    selectedYear
  )

  const scatterChart = new ScatterChart(
    CSV_VALUES,
    countryManagement,
    selectedIndicator,
    selectedIndicatorScatter,
    selectedYear
  )

  updateEvents(map, countryManagement, lineChart, barChart, scatterChart)
}

// Use window.onload event to launch the main function when loading process has ended
window.onload = main
