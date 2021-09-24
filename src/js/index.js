'use strict'

const WIDTH = document.getElementById('visualisation').offsetWidth * 0.95
const HEIGHT = 500

function initSvg () {
  const svg = d3
    .select('#map')
    .append('svg')
    .attr('id', 'svg')
    .attr('width', WIDTH)
    .attr('height', HEIGHT)
    .attr('class', 'svg')
  return svg
}

function initMap (svg) {
  // cf => https://www.datavis.fr/index.php?page=map-improve
  const projection = d3.geoNaturalEarth1().scale(1).translate([0, 0])
  const path = d3.geoPath().pointRadius(2).projection(projection)

  const countries = svg.append('g')
  const geojson = WORLD_MAP_JSON

  const box = path.bounds(geojson) // getting the bounding box of the path
  const s =
    0.8 /
    Math.max((box[1][0] - box[0][0]) / WIDTH, (box[1][1] - box[0][1]) / HEIGHT)
  const t = [
    (WIDTH - s * (box[1][0] + box[0][0])) / 2,
    (HEIGHT - s * (box[1][1] + box[0][1])) / 2
  ]

  projection.scale(s).translate(t)

  countries
    .selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', (currentCountry) => currentCountry.id)
    .attr('name', (currentCountry) => currentCountry.properties.name)
    .on('click', updateSelectedCountries)
    .attr('class', 'country')
    .style('fill', 'grey') // default color
}

function main () {
  const svg = initSvg()
  initMap(svg)
}

// Use window.onload event to launch the main function when loading process has ended
window.onload = main
