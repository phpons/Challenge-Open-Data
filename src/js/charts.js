'use strict'

const CHART_HEIGHT = '400px'
const LINE_CHART_ID = 'line-chart'
const BAR_CHART_ID = 'bar-chart'
const SCATTER_CHART_ID = 'scatter-chart'

class BasicChart {
  constructor (
    csvDatas,
    countryManagement,
    selectedIndicator
  ) {
    this.csvDatas = csvDatas
    this.countryManagement = countryManagement
    this.selectedIndicator = selectedIndicator
  }

  resize (evt) {
    this.updateChart()
  }

  isValidValue (value) {
    return value[this.selectedIndicator] !== ''
  }

  addEventListener (evt, func) {
    this.svg.node().addEventListener(evt, func)
  }

  createChart (id, chartType, options) {
    const ctx = document.getElementById(id)

    const data = {
      labels: [],
      datasets: [{
        label: '',
        data: [],
        backgroundColor: []
      }]
    }

    return new Chart(ctx, {
      type: chartType,
      data: data,
      options: options
    })
  }
}

// eslint-disable-next-line no-unused-vars
class LineChart extends BasicChart {
  constructor (
    csvDatas,
    countryManagement,
    selectedIndicator
  ) {
    super(csvDatas, countryManagement, selectedIndicator)

    const options = {
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      },
      legend: {
        labels: {
          boxWidth: 0
        }
      }
    }
    this.chart = this.createChart(LINE_CHART_ID, 'line', options)
  }

  updateChart (evt) {
    if (!this.countryManagement.getSelectedCountries().length) return
    this.chart.canvas.parentNode.style.height = CHART_HEIGHT

    const data = this.csvDatas.filter((val) => (
      this.countryManagement.getSelectedCountries().includes(val[COUNTRY_CODE_COLUMN]) &&
      this.isValidValue(val)
    ))
    data.forEach(d => {
      d[this.selectedIndicator] = +d[this.selectedIndicator]
    })

    const datasets = []
    this.countryManagement.getSelectedCountries().forEach(value => {
      const filteredData = data.filter(val => val[COUNTRY_CODE_COLUMN] === value)
      datasets.push({
        fill: false,
        backgroundColor: BULMA_COLORS[this.countryManagement.getColor(value)],
        data: filteredData.map(val => +val[this.selectedIndicator]),
        label: ''
      })
    })

    this.chart.data.datasets = datasets
    this.chart.data.labels = [...new Set(data.map(val => val[YEAR_COLUMN]))]
    this.chart.data.datasets[0].label = this.selectedIndicator

    this.chart.update()
  }
}

// eslint-disable-next-line no-unused-vars
class BarChart extends BasicChart {
  constructor (
    csvDatas,
    countryManagement,
    selectedIndicator,
    year
  ) {
    super(csvDatas, countryManagement, selectedIndicator)

    this.currentYear = year

    const options = {
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      },
      legend: {
        labels: {
          boxWidth: 0
        }
      }
    }
    this.chart = this.createChart(BAR_CHART_ID, 'bar', options)
  }

  updateChart (evt) {
    if (!this.countryManagement.getSelectedCountries().length) return
    this.chart.canvas.parentNode.style.height = CHART_HEIGHT

    const data = this.csvDatas.filter((val) => (
      this.countryManagement.getSelectedCountries().includes(val[COUNTRY_CODE_COLUMN]) &&
      +val[YEAR_COLUMN] === +this.currentYear &&
      this.isValidValue(val)
    ))
    data.forEach(d => {
      d[this.selectedIndicator] = +d[this.selectedIndicator]
    })

    this.chart.data.datasets[0].backgroundColor = data.map(val => BULMA_COLORS[this.countryManagement.getColor(val[COUNTRY_CODE_COLUMN])])
    this.chart.data.labels = data.map(val => val[COUNTRY_NAME_COLUMN])
    this.chart.data.datasets[0].data = data.map(val => +val[this.selectedIndicator])
    this.chart.data.datasets[0].label = this.selectedIndicator + ' (' + this.currentYear + ')'

    this.chart.update()
  }
}

// eslint-disable-next-line no-unused-vars
class ScatterChart extends BasicChart {
  constructor (
    csvDatas,
    countryManagement,
    selectedIndicator,
    selectedIndicatorY,
    year
  ) {
    super(csvDatas, countryManagement, selectedIndicator)

    this.selectedIndicatorY = selectedIndicatorY
    this.currentYear = year

    const options = {
      maintainAspectRatio: false,
      title: {
        display: true,
        text: '',
        fontSize: 14
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: ''
          },
          gridLines: {
            display: true
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: ''
          },
          gridLines: {
            display: true
          }
        }]
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            const label = data.labels[tooltipItem.index]
            return label + ': (' + tooltipItem.xLabel + ', ' + tooltipItem.yLabel + ')'
          }
        }
      }
    }
    this.chart = this.createChart(SCATTER_CHART_ID, 'scatter', options)
    this.updateChart()
  }

  isValidValue (value) {
    return (
      (super.isValidValue(value) && +value[this.selectedIndicator] !== 0) &&
      (value[this.selectedIndicatorY] !== '' && +value[this.selectedIndicatorY] !== 0)
    )
  }

  updateChart (evt) {
    this.chart.canvas.parentNode.style.height = CHART_HEIGHT

    const data = this.csvDatas.filter((val) => +val[YEAR_COLUMN] === +this.currentYear && this.isValidValue(val))
    data.forEach(d => {
      d[this.selectedIndicator] = +d[this.selectedIndicator]
      d[this.selectedIndicatorY] = +d[this.selectedIndicatorY]
    })

    const xAxisIndicator = this.selectedIndicator
    const yAxisIndicator = this.selectedIndicatorY

    this.chart.options.scales.xAxes[0].scaleLabel.labelString = xAxisIndicator
    this.chart.options.scales.yAxes[0].scaleLabel.labelString = yAxisIndicator

    if (xAxisIndicator === PIB_COLUMN) {
      this.chart.options.scales.xAxes[0].type = 'logarithmic'
    } else {
      this.chart.options.scales.xAxes[0].type = 'linear'
    }

    this.chart.options.title.text = yAxisIndicator + ' x ' + xAxisIndicator
    this.chart.data = {
      labels: data.map(val => val[COUNTRY_NAME_COLUMN]),
      datasets: [{
        data: data.map(function (row) {
          return {
            x: row[xAxisIndicator],
            y: row[yAxisIndicator],
            name: row[COUNTRY_NAME_COLUMN]
          }
        }),
        backgroundColor: 'rgb(255, 99, 132)',
        pointRadius: 5.0,
        pointHoverRadius: 7.0
      }]
    }

    this.chart.update()
  }
}
