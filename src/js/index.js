'use strict'

const WIDTH = document.getElementById('visualisation').offsetWidth * 0.95
const HEIGHT = 500
const colors = [
  '#9cc8dd',
  '#88bdd6',
  '#75b2cf',
  '#61a7c8',
  '#4d9cc1',
  '#3a92bb'
]
const complementaryColor = '#bb633a'
const legendCellSize = 20

function shortCountryName (country) {
  return country.replace('Démocratique', 'Dem.').replace('République', 'Rep.')
}

function getColorIndex (color) {
  for (let i = 0; i < colors.length; i++) {
    if (colors[i] === color) {
      return i
    }
  }
  return -1
}

function parseCSV (csv, separator = ',') {
  const stringRows = csv.split('\n').map((str) => str.trim())
  const headers = stringRows.shift().split(separator)
  const table = []
  stringRows.forEach((stringRow) => {
    const row = Object()
    stringRow.split(separator).forEach((value, idx) => {
      row[headers[idx]] = value
    })
    table.push(row)
  })
  return table
}

function getMinMaxFromColumn (values, column) {
  const min = d3.min(values, (val) => +val[column])
  const max = d3.max(values, (val) => +val[column])
  return { min: min, max: max }
}

function getValueScaleQuantile (min, max) {
  return d3.scaleQuantile().domain([min, max]).range(colors)
}

function getStatsFromColumn (values, column) {
  const { min, max } = getMinMaxFromColumn(values, column)
  const quantile = getValueScaleQuantile(min, max)
  return { min: min, max: max, quantile: quantile }
}

class WorldHeatMap {
  constructor (
    csvDatas,
    geojson,
    countryCodeColumn,
    countryNameColumn,
    valuesColumn
  ) {
    this.width = WIDTH
    this.height = HEIGHT

    this.csvDatas = csvDatas
    this.geojson = geojson
    this.countryCodeColumn = countryCodeColumn
    this.valuesColumn = valuesColumn
    this.countryNameColumn = countryNameColumn

    this.updateMinMaxQuantile()

    this.initSvg()
    this.initMapFromGeoJSON()
    this.initMapLegend()
    this.initTitleAndSubtitle()
    this.initTooltip()
    this.initZoom()

    this.draw()
  }

  updateMinMaxQuantile () {
    const { min, max, quantile } = getStatsFromColumn(
      this.csvDatas,
      this.valuesColumn
    )
    this.minCsvValue = min
    this.maxCsvValue = max
    this.scaleQuantile = quantile
  }

  initZoom () {
    this.zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', this.zoomed)
    this.svg.call(this.zoom)
  }

  initSvg () {
    this.svg = d3
      .select('#map')
      .append('svg')
      .attr('id', 'svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('class', 'svg')
  }

  initMapLegend () {
    const offsetX = 40
    const offsetY = 50
    const legend = this.svg
      .append('g')
      .attr('transform', `translate(${offsetX}, ${offsetY})`)
    legend
      .selectAll()
      .data(d3.range(colors.length))
      .enter()
      .append('svg:rect')
      .attr('height', legendCellSize + 'px')
      .attr('width', legendCellSize + 'px')
      .attr('x', 5)
      .attr('y', (currIdx) => currIdx * legendCellSize)
      .style('fill', (currIdx) => colors[currIdx])
      .on('mouseover', this.onLegendMouseOver.bind(this))
      .on('mouseout', this.onLegendMouseOut.bind(this))

    legend // no values rect
      .append('svg:rect')
      .attr('height', legendCellSize + 'px')
      .attr('width', legendCellSize + 'px')
      .attr('x', 5)
      .attr('y', this.height - legendCellSize * 2 - offsetY)
      .attr('class', 'heatmap-country-default')
    legend // no values text
      .append('svg:text')
      .attr('x', offsetX + 15)
      .attr('y', this.height - legendCellSize - offsetY - 10)
      .attr('text', 'No values')
      .attr('class', 'legend-text')
      .attr('text-anchor', 'middle')
      .text('No values')

    legend
      .append('polyline')
      .attr(
        'points',
        `${legendCellSize},0 ${legendCellSize},${legendCellSize} ${
          legendCellSize * 0.2
        },${legendCellSize / 2}`
      )
      .attr('id', 'cursor')
      .style('display', 'none')
      .style('fill', complementaryColor)

    this.legendScale = d3
      .scaleLinear()
      .domain([this.minCsvValue, this.maxCsvValue])
      .range([0, colors.length * legendCellSize])

    legend
      .append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(this.legendScale))

    this.legend = legend
  }

  set title (text) {
    // should have use private property but this functionality is still experimental
    this.d3Title.text(text)
  }

  get title () {
    return this.d3Title.text()
  }

  set subtitle (text) {
    this.d3Subtitle.text(text)
  }

  get subtitle () {
    return this.d3Subtitle.text()
  }

  initTitleAndSubtitle () {
    this.d3Title = this.svg
      .append('text')
      .attr('x', this.width / 2)
      .attr('y', 25)
      .attr('id', 'heatmap-title')
      .attr('text-anchor', 'middle')
      .text('Titre')

    this.d3Subtitle = this.svg
      .append('text')
      .attr('x', this.width / 2)
      .attr('y', 50)
      .attr('id', 'heatmap-subtitle')
      .attr('text-anchor', 'middle')
      .text('Sous-Titre')
  }

  onLegendMouseOver (event, rangeIndex) {
    if (this.legend === undefined) return
    this.legend
      .select('#cursor')
      .attr(
        'transform',
        `translate(${legendCellSize + 5}, ${rangeIndex * legendCellSize})`
      )
      .style('display', null)
    d3.selectAll(`path[scorecolor='${colors[rangeIndex]}']`).style(
      'fill',
      complementaryColor
    )
  }

  onLegendMouseOut (event, rangeIndex) {
    if (this.legend === undefined) return
    this.legend.select('#cursor').style('display', 'none')
    d3.selectAll(`path[scorecolor='${colors[rangeIndex]}']`).style(
      'fill',
      colors[rangeIndex]
    )
  }

  initTooltip () {
    const tooltip = this.svg
      .append('g')
      .attr('id', 'tooltip')
      .style('display', 'none')

    tooltip.append('polyline').attr('points', '0,0 210,0 210,60 0,60 0,0')

    tooltip
      .append('line')
      .attr('x1', 40)
      .attr('y1', 25)
      .attr('x2', 160)
      .attr('y2', 25)
      .attr('transform', 'translate(0, 5)')

    const text = tooltip.append('text').attr('transform', 'translate(0, 20)')

    text
      .append('tspan')
      .attr('x', 105) // tooltip width / 2
      .attr('y', 0)
      .attr('id', 'tooltip-country')
      .attr('text-anchor', 'middle')

    text
      .append('tspan')
      .attr('x', 105) // tooltip width / 2
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .text('Score : ')

    text.append('tspan').attr('id', 'tooltip-score')

    this.tooltip = tooltip
  }

  computeProjectionScale () {
    this.projectionScale =
      0.8 /
      Math.max(
        (this.bbox[1][0] - this.bbox[0][0]) / this.width,
        (this.bbox[1][1] - this.bbox[0][1]) / this.height
      )
  }

  computeProjectionTranslation () {
    this.projectionTranslate = [
      (this.width -
        this.projectionScale * (this.bbox[1][0] + this.bbox[0][0])) /
        2,
      (this.height -
        this.projectionScale * (this.bbox[1][1] + this.bbox[0][1])) /
        2
    ]
  }

  computeProjection () {
    this.computeProjectionScale()
    this.computeProjectionTranslation()
    this.projection
      .scale(this.projectionScale)
      .translate(this.projectionTranslate)
  }

  initMapFromGeoJSON () {
    this.projection = d3.geoNaturalEarth1().scale(0.95).translate([0, 0])
    this.path = d3.geoPath().pointRadius(2).projection(this.projection)

    const countries = this.svg.append('g').attr('id', 'svg-countries')

    this.bbox = this.path.bounds(this.geojson) // getting the bounding box of the path
    this.computeProjection()

    countries
      .selectAll('path')
      .data(this.geojson.features)
      .enter()
      .append('path')
      .attr('id', (currentCountry) => currentCountry.id)
      .attr('name', (currentCountry) => currentCountry.properties.name)
      .on('click', updateSelectedCountries)
      .attr('class', 'heatmap-country-default')
  }

  onCountryMouseOver (countryPath, value) {
    countryPath.style('fill', complementaryColor)
    this.tooltip.style('display', null)
    this.tooltip
      .select('#tooltip-country')
      .text(shortCountryName(value[(this, this.countryNameColumn)]))
    this.tooltip.select('#tooltip-score').text(`${(+value[this.valuesColumn]).toFixed(2)}`)
    this.legend
      .select('#cursor')
      .attr(
        'transform',
        `translate(${legendCellSize + 5},${
          getColorIndex(this.scaleQuantile(+value[this.valuesColumn])) *
          legendCellSize
        })`
      )
      .style('display', null)
  }

  onCountryMouseOut (countryPath, value) {
    countryPath.style('fill', this.scaleQuantile(+value[this.valuesColumn]))
    this.tooltip.style('display', 'none')
    this.legend.select('#cursor').style('display', 'none')
  }

  onCountryMouseMove (evt) {
    const mouse = d3.pointer(evt, this.svg.node())
    this.tooltip.attr('transform', `translate(${mouse[0]},${mouse[1] - 75})`)
  }

  colorCountries () {
    this.csvDatas.forEach((value, index) => {
      const countryPath = d3.select(`#${value[this.countryCodeColumn]}`)
      countryPath.attr('style', null) // resetting default color
      countryPath
        .attr('scorecolor', this.scaleQuantile(+value[this.valuesColumn]))
        .style('fill', this.scaleQuantile(+value[this.valuesColumn]))
        .on('mouseover', () => this.onCountryMouseOver(countryPath, value))
        .on('mouseout', () => this.onCountryMouseOut(countryPath, value))
        .on('mousemove', (evt) => this.onCountryMouseMove(evt))
    })
  }

  draw () {
    this.colorCountries()
    this.svg.selectAll('#svg-countries path').attr('d', this.path)
  }

  resize (evt) {
    this.width = document.getElementById('visualisation').offsetWidth * 0.95
    // this.height = HEIGHT
    this.svg.attr('width', this.width) // .attr('height', this.height)
    this.d3Title.attr('x', this.width / 2)
    this.d3Subtitle.attr('x', this.width / 2)
    // TODO: resize legend
    this.computeProjection()
    this.updateDisplay()
  }

  updateLegendScaleDomain () {
    this.legendScale.domain([this.minCsvValue, this.maxCsvValue])
    this.legend.select('.axis').call(d3.axisLeft(this.legendScale))
  }

  updateDisplay () {
    this.updateMinMaxQuantile()
    this.updateLegendScaleDomain()
    this.draw()
  }

  addEventListener (evt, func) {
    this.svg.node().addEventListener(evt, func)
  }

  zoomed (evt) {
    d3.select('#svg-countries').attr('transform', evt.transform)
  }

  resetZoom () {
    this.svg
      .transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity)
  }
}

function main () {
  const csvValues = parseCSV(CSV_DATA)
  // TODO: temporary cause year selection is in another issue
  const filtereValues = csvValues.filter((val) => val.Year === '2000')

  const map = new WorldHeatMap(
    // csvValues,
    filtereValues,
    WORLD_MAP_JSON,
    'ISO_Country',
    'Country Name',
    'CO2 emissions (metric tons per capita)'
  )
  window.addEventListener('resize', map.resize.bind(map))
  document
    .getElementById('reset-zoom-button')
    .addEventListener('click', map.resetZoom.bind(map))
}
// Use window.onload event to launch the main function when loading process has ended
window.onload = main
