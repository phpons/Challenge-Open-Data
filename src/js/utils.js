'use strict'

// Permet de switcher entre la page documentation et la page visualisation de données
// eslint-disable-next-line no-unused-vars
function switchPage (id) {
  const documentation = document.getElementById('documentation')
  const visualization = document.getElementById('visualisation')
  const navVisu = document.getElementById('nav-visu')
  const navDoc = document.getElementById('nav-doc')
  if (
    (id === 'nav-doc' && documentation.classList.contains('is-hidden')) ||
    (id === 'nav-visu' && visualization.classList.contains('is-hidden'))
  ) {
    visualization.classList.toggle('is-hidden')
    documentation.classList.toggle('is-hidden')
    navVisu.classList.toggle('is-active')
    navDoc.classList.toggle('is-active')
  }
}

// eslint-disable-next-line no-unused-vars
function parseCSV (csv, separator = ',') {
  const stringRows = csv.split('\n').map((str) => str.trim())
  const headers = stringRows
    .shift()
    .split(separator)
    .map((str) => str.trim())
  const table = []
  stringRows.forEach((stringRow) => {
    const row = Object()
    stringRow.split(separator).forEach((value, idx) => {
      row[headers[idx]] = value
    })
    table.push(row)
  })
  return { CSV_VALUES: table, CSV_HEADERS: headers }
}
