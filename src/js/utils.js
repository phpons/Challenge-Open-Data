'use strict'

const NAV_DOC_ID = 'nav-doc'
const NAV_VISU_ID = 'nav-visu'

const DOCUMENTATION_ELEMENT = document.getElementById('documentation')
const VISUALIZATION_ELEMENT = document.getElementById('visualization')

const NAV_DOC_ELEMENT = document.getElementById(NAV_DOC_ID)
const NAV_VISU_ELEMENT = document.getElementById(NAV_VISU_ID)

const TOOGLE = {
  [NAV_DOC_ID]: {
    navElement: NAV_DOC_ELEMENT,
    element: DOCUMENTATION_ELEMENT
  },
  [NAV_VISU_ID]: {
    navElement: NAV_VISU_ELEMENT,
    element: VISUALIZATION_ELEMENT
  }
}

// Permet de switcher entre la page documentation et la page visualisation de données
// eslint-disable-next-line no-unused-vars
function switchPage (id) {
  for (const currentId of Object.keys(TOOGLE)) {
    if (currentId === id) {
      TOOGLE[currentId].navElement.classList.add('is-active')
      TOOGLE[currentId].element.classList.remove('is-hidden')
    } else {
      TOOGLE[currentId].navElement.classList.remove('is-active')
      TOOGLE[currentId].element.classList.add('is-hidden')
    }
  }

  window.dispatchEvent(new Event('resize'))
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
