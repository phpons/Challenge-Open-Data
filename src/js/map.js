'use strict'

const WIDTH = document.getElementById('visualization').offsetWidth
const HEIGHT = document.body.offsetHeight * 0.6
const COLORS = [
  '#b0d3e3',
  '#88bdd6',
  '#61a7c8',
  '#3a92bb',
  '#2e7495',
  '#225770'
]
const COMPLEMENTARY_COLOR = '#bb633a'

function shortCountryName (country) {
  return country.replace('Démocratique', 'Dem.').replace('République', 'Rep.')
}

function adjustHeight (width) {
  if (HEIGHT > width) {
    return width
  } else {
    return HEIGHT
  }
}

function getColorIndex (color) {
  for (let i = 0; i < COLORS.length; i++) {
    if (COLORS[i] === color) {
      return i
    }
  }
  return -1
}

function getMinMaxFromColumn (values, column) {
  const min = d3.min(values, (val) => +val[column])
  const max = d3.max(values, (val) => +val[column])
  return { min: min, max: max }
}

function getValueScaleQuantile (min, max) {
  return d3.scaleQuantile().domain([min, max]).range(COLORS)
}

function getStatsFromColumn (values, column, bool) {
  const { min, max } = getMinMaxFromColumn(values, column)
  let quantile
  if (bool) {
    quantile = getValueScaleQuantile(Math.sqrt(min), Math.sqrt(max))
  } else {
    quantile = getValueScaleQuantile(min, max)
  }
  return { min: min, max: max, quantile: quantile }
}

// eslint-disable-next-line no-unused-vars
class WorldHeatMap {
  constructor (
    csvDatas,
    geojson,
    valuesColumn,
    year,
    countryManagement,
    indicatorsWithSqrtScale
  ) {
    this.width = WIDTH
    this.height = HEIGHT

    this.rawCsvDatas = csvDatas

    this.geojson = geojson
    this.valuesColumn = valuesColumn
    this.currentYear = year

    this.countryManagement = countryManagement

    this.indicatorsWithSqrtScale = indicatorsWithSqrtScale

    this.updateMinMaxQuantile()

    this.initSvg()
    this.initMapFromGeoJSON()
    this.initMapLegend()
    this.initTitleAndSubtitle()
    this.initTooltip()
    this.initZoom()

    this.updateTitle()

    this.draw()
  }

  updateMinMaxQuantile () {
    const { min, max, quantile } = getStatsFromColumn(
      this.csvDatas,
      this.valuesColumn,
      !!this.sqrtScale // doing !! so we ensure this is a boolean
    )
    this.minCsvValue = min
    this.maxCsvValue = max
    this.scaleQuantile = quantile
  }

  initZoom () {
    // the more the scale extend the more you can zoom
    this.zoom = d3.zoom().scaleExtent([1, 200]).on('zoom', this.zoomed)
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
      .data(d3.range(COLORS.length))
      .enter()
      .append('svg:rect')
      .attr('x', 5)
      .attr('class', 'legend-scale-square')
      .style('fill', (currIdx) => COLORS[currIdx])
      .on('mouseover', this.onLegendMouseOver.bind(this))
      .on('mouseout', this.onLegendMouseOut.bind(this))

    legend // no values rect
      .append('svg:rect')
      .attr('x', 5)
      .attr('class', 'heatmap-country-default')
    legend // no values text
      .append('svg:text')
      .attr('class', 'legend-text')
      .text('Pas de valeur')

    legend
      .append('polyline')
      .attr('id', 'cursor')
      .style('display', 'none')
      .style('fill', COMPLEMENTARY_COLOR)

    legend
      .append('g')
      .attr('class', 'axis')

    this.legend = legend

    this.updateLegend()
    this.resizeLegend()
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

  get csvDatas () {
    return this.rawCsvDatas.filter(
      (value) =>
        this.isValidValue(value) &&
        +value[YEAR_COLUMN] === +this.currentYear
    )
  }

  set csvDatas (datas) {
    this.rawCsvDatas = datas
  }

  get legendCellSize () {
    return this.height * 0.04
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
        `translate(${this.legendCellSize + 5}, ${
          rangeIndex * this.legendCellSize
        })`
      )
      .style('display', null)
    d3.selectAll(`path[scorecolor='${COLORS[rangeIndex]}']`).style(
      'fill',
      COMPLEMENTARY_COLOR
    )
  }

  onLegendMouseOut (event, rangeIndex) {
    if (this.legend === undefined) return
    this.legend.select('#cursor').style('display', 'none')
    d3.selectAll(`path[scorecolor='${COLORS[rangeIndex]}']`).style(
      'fill',
      COLORS[rangeIndex]
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
      .on('click', (evt) => this.countryManagement.updateSelectedCountries(evt))
      .attr('class', 'heatmap-country-default')
  }

  onCountryMouseOver (countryPath, value) {
    countryPath.style('fill', COMPLEMENTARY_COLOR)
    this.tooltip.style('display', null)
    this.tooltip
      .select('#tooltip-country')
      .text(shortCountryName(value[(this, COUNTRY_NAME_COLUMN)]))
    this.tooltip
      .select('#tooltip-score')
      .text(`${this.formatValue(+value[this.valuesColumn])}`)
    this.legend
      .select('#cursor')
      .attr(
        'transform',
        `translate(${this.legendCellSize + 5},${
          getColorIndex(this.scaleQuantile(this.getValueWithScale(value))) *
          this.legendCellSize
        })`
      )
      .style('display', null)
  }

  onCountryMouseOut (countryPath, value) {
    countryPath.style(
      'fill',
      this.scaleQuantile(this.getValueWithScale(value))
    )
    this.tooltip.style('display', 'none')
    this.legend.select('#cursor').style('display', 'none')
  }

  getValueWithScale (value) {
    if (this.sqrtScale) {
      return Math.sqrt(+value[this.valuesColumn])
    } else {
      return +value[this.valuesColumn]
    }
  }

  onCountryMouseMove (evt) {
    const mouse = d3.pointer(evt, this.svg.node())
    this.tooltip.attr('transform', `translate(${mouse[0]},${mouse[1] - 75})`)
  }

  isValidValue (value) {
    return value[this.valuesColumn] !== ''
  }

  colorCountry (countryPath, value) {
    countryPath
      .attr('scorecolor', this.scaleQuantile(this.getValueWithScale(value)))
      .style('fill', this.scaleQuantile(this.getValueWithScale(value)))
  }

  bindCountryEvent (countryPath, value) {
    countryPath
      .on('mouseover', () => this.onCountryMouseOver(countryPath, value))
      .on('mouseout', () => this.onCountryMouseOut(countryPath, value))
      .on('mousemove', (evt) => this.onCountryMouseMove(evt))
  }

  colorAndBindCountries () {
    this.csvDatas.forEach((value, index) => {
      const countryPath = d3.select(`#${value[COUNTRY_CODE_COLUMN]}`)
      this.colorCountry(countryPath, value)
      this.bindCountryEvent(countryPath, value)
    })
    this.countryManagement.displaySelectedCountries()
  }

  draw () {
    this.colorAndBindCountries()
    this.svg.selectAll('#svg-countries path').attr('d', this.path)
  }

  resizeLegend () {
    const offsetX = this.width * 0.075
    const offsetY = this.height * 0.05
    this.legend.attr('transform', `translate(${offsetX}, ${offsetY})`)
    this.legend
      .selectAll('.legend-scale-square')
      .attr('height', this.legendCellSize + 'px')
      .attr('width', this.legendCellSize + 'px')
      .attr('y', (currIdx) => currIdx * this.legendCellSize)
    this.legend
      .select('.heatmap-country-default')
      .attr('height', this.legendCellSize + 'px')
      .attr('width', this.legendCellSize + 'px')
      .attr('y', this.height - this.height * 0.15)
    this.legend
      .select('#cursor')
      .attr(
        'points',
        `${this.legendCellSize},0 ${this.legendCellSize},${
          this.legendCellSize
        } ${this.legendCellSize * 0.2},${this.legendCellSize / 2}`
      )
    this.legend
      .select('.legend-text')
      .attr('x', this.legendCellSize + 10)
      .attr('text-anchor', 'start')
      .attr('y', this.height - this.height * 0.12)
    this.legendScale.range([0, COLORS.length * this.legendCellSize])
    this.legend.select('.axis').call(d3.axisLeft(this.legendScale).ticks(COLORS.length))
  }

  resize (evt) {
    this.width = document.getElementById('visualization').offsetWidth
    this.height = adjustHeight(this.width)
    this.svg.attr('width', this.width).attr('height', this.height)
    this.d3Title.attr('x', this.width / 2)
    this.d3Subtitle.attr('x', this.width / 2)
    this.resizeLegend()
    this.computeProjection()
    this.updateDisplay()
  }

  estimateAxisFormat () {
    if (this.valuesColumn.includes('$')) {
      return d3.format('$~s')
    } else if (this.valuesColumn.includes('%')) {
      return (d) => d + '%'
    } else {
      return d3.format('~s')
    }
  }

  formatValue (value) {
    let options = {}
    let suffix = ''
    if (this.valuesColumn.includes('$')) {
      options = { style: 'currency', currency: 'USD' }
    } else if (this.valuesColumn.includes('%')) {
      suffix = ' %'
    }
    return new Intl.NumberFormat('fr-FR', options).format(value) + suffix
  }

  updateLegend () {
    const format = this.estimateAxisFormat()
    if (this.sqrtScale) {
      this.legendScale = d3.scaleSqrt()
    } else {
      this.legendScale = d3.scaleLinear()
    }
    this.legendScale
      .domain([this.minCsvValue, this.maxCsvValue])
      .range([0, COLORS.length * this.legendCellSize])
    this.legend.select('.axis').call(
      d3.axisLeft(this.legendScale).tickFormat(format).ticks(COLORS.length)
    )
  }

  resetCountries () {
    this.svg
      .selectAll('#svg-countries path')
      .attr('scorecolor', null)
      .attr('style', null)
      .on('mouseover', null)
      .on('mouseout', null)
      .on('mousemove', null)
  }

  updateDisplay () {
    this.sqrtScale = this.indicatorsWithSqrtScale.includes(this.valuesColumn)
    this.updateMinMaxQuantile()
    this.updateLegend()
    this.updateTitle()
    this.resetCountries()
    this.draw()
  }

  updateTitle () {
    this.title = `${this.valuesColumn} en ${this.currentYear}`
    this.subtitle = this.sqrtScale ? 'Échelle racine carrée' : 'Échelle linéaire'
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
