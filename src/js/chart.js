'use strict'

const CHART_SUBTITLE = document.getElementById('chart-subtitle')

const MARGIN = { top: 30, right: 50, bottom: 30, left: 30 }
const HORIZONTAL_POS = 5
const VERTICAL_POS = 50

// eslint-disable-next-line no-unused-vars
class Chart {
  constructor (
    csvDatas,
    selectedIndicator,
    countryManagement
  ) {
    this.width = WIDTH - (MARGIN.left + MARGIN.right)
    this.height = 450 - (MARGIN.top + MARGIN.bottom)

    this.csvDatas = csvDatas

    this.selectedIndicator = selectedIndicator
    this.countryManagement = countryManagement
  }

  resize (evt) {
    if (!this.svg) return
    this.width = document.getElementById('visualisation').offsetWidth * 0.95 - (MARGIN.left + MARGIN.right)
    this.svg.attr('width', this.width)
    this.updateChart()
  }

  isValidValue (value) {
    return value[this.selectedIndicator] !== ''
  }

  addEventListener (evt, func) {
    this.svg.node().addEventListener(evt, func)
  }

  updateChart (evt) {
    CHART_SUBTITLE.classList.add('is-hidden')
    d3.select('#chart').select('svg').remove()
    if (this.countryManagement.getSelectedCountries().length > 0) {
      CHART_SUBTITLE.classList.remove('is-hidden')
      this.svg = d3.select('#chart').append('svg')
        .attr('id', 'svg-chart')
        .attr('width', this.width + MARGIN.left + MARGIN.right)
        .attr('height', this.height + MARGIN.top + MARGIN.bottom)
        .attr('transform', 'translate(0, 0)')

      const data = this.csvDatas.filter((val) => this.countryManagement.getSelectedCountries().includes(val[COUNTRY_CODE_COLUMN]) && this.isValidValue(val))
      data.forEach(d => {
        d[this.selectedIndicator] = +d[this.selectedIndicator]
      })

      const x = d3.scaleLinear()
        .range([0, this.width])

      const y = d3.scaleLinear()
        .range([this.height, 0])

      const line = d3.line()
        .x(d => x(d[YEAR_COLUMN]))
        .y(d => y(d[this.selectedIndicator]))

      x.domain(d3.extent(data, d => d[YEAR_COLUMN]))
      y.domain(d3.extent(data, d => d[this.selectedIndicator]))

      this.svg.append('g')
        .attr('transform', 'translate(' + VERTICAL_POS + ',' + (this.height + HORIZONTAL_POS) + ')')
        .call(d3.axisBottom(x).tickFormat(d3.format('d')))

      this.svg.append('g')
        .attr('transform', 'translate(' + VERTICAL_POS + ', ' + HORIZONTAL_POS + ')')
        .call(d3.axisLeft(y).tickFormat(d3.format('~s')))
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .style('text-anchor', 'end')
        .text(this.selectedIndicator)

      this.countryManagement.getSelectedCountries().forEach((value, index) => {
        this.svg.append('path')
          .attr('transform', 'translate(' + VERTICAL_POS + ', ' + HORIZONTAL_POS + ')')
          .datum(this.csvDatas.filter((val) => val[COUNTRY_CODE_COLUMN] === value && this.isValidValue(val)))
          .style('fill', 'none')
          .style('stroke', BULMA_COLORS[this.countryManagement.getColor(value)])
          .style('stroke-width', '2px')
          .style('opacity', '1')
          .attr('d', line)
      })
    }
  }
}
