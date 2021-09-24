'use strict'

// Permet de switcher entre la page documentation et la page visualisation de données
// eslint-disable-next-line no-unused-vars
function switchPage (id) {
  const documentation = document.getElementById('documentation')
  const visualization = document.getElementById('visualisation')
  const navVisu = document.getElementById('nav_visu')
  const navDoc = document.getElementById('nav_doc')
  if (
    (id === 'nav_doc' && documentation.classList.contains('is-hidden')) ||
    (id === 'nav_visu' && visualization.classList.contains('is-hidden'))
  ) {
    visualization.classList.toggle('is-hidden')
    documentation.classList.toggle('is-hidden')
    navVisu.classList.toggle('is-active')
    navDoc.classList.toggle('is-active')
  }
}

const WIDTH = document.getElementById('container').offsetWidth * 0.95
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
    .attr('id', (currentCountry) => 'code' + currentCountry.id)
    .attr('class', 'country')
    .style('fill', 'grey') // default color
}

function main () {
  const svg = initSvg()
  initMap(svg)
}
// Use window.onload event to launch the main function when loading process has ended
window.onload = main
