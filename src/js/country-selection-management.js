'use strict'

const BULMA_COLORS = {
  info: '#3e8ed0',
  success: '#48c78e',
  warning: '#ffe08a',
  primary: '#00d1b2',
  danger: '#f14668',
  link: '#485fc7'
}
const NB_COLORS = Object.keys(BULMA_COLORS).length

const ERROR_MESSAGE_NB_COUNTRY = `Vous ne pouvez sélectionner que ${NB_COLORS} pays au maximum.\nSi vous souhaitez désélectionner un pays cliquez à nouveau dessus.`
const ERROR_MESSAGE_NULL_VALUE = 'Vous ne pouvez pas sélectionner un pays dont les données ne sont pas connues'

const bulmaClassesUsed = []

const selectedCountries = []

function getNextColor () {
  for (const bulmaClass of Object.keys(BULMA_COLORS)) {
    if (!bulmaClassesUsed.includes(bulmaClass)) return bulmaClass
  }
}

function removeCountryPathStyle (countryPath) {
  countryPath.style.removeProperty('stroke')
  countryPath.style.removeProperty('stroke-width')
  countryPath.removeAttribute('bulma-class')
}

function removeControlElement (countryId) {
  const countryElement = document.getElementById(`${countryId}-tag`)
  const controlElement = countryElement.parentNode
  controlElement.parentNode.removeChild(controlElement)
}

function removeSelectedCountry (countryPath) {
  const bulmaClass = countryPath.getAttribute('bulma-class')

  removeCountryPathStyle(countryPath)
  removeControlElement(countryPath.id)

  const indexColor = bulmaClassesUsed.indexOf(bulmaClass)
  bulmaClassesUsed.splice(indexColor, 1)

  const indexCountry = selectedCountries.indexOf(countryPath.id)
  selectedCountries.splice(indexCountry, 1)
}

function addCountryPathStyle (countryPath, bulmaClass) {
  countryPath.style.stroke = BULMA_COLORS[bulmaClass]
  countryPath.style.strokeWidth = '3px'
  countryPath.setAttribute('bulma-class', bulmaClass)
}

function addControlElement (countryPath, bulmaClass) {
  const countryNameElement = createCountryNameElement(countryPath.getAttribute('name'), bulmaClass)
  const deleteElement = createDeleteElement(countryPath)
  const countryElement = createCountryElement(countryPath.id)
  const controlElement = createControlElement()

  countryElement.appendChild(countryNameElement)
  countryElement.appendChild(deleteElement)

  controlElement.appendChild(countryElement)

  const selectedCountriesElement = document.getElementById('selected-countries')
  selectedCountriesElement.appendChild(controlElement)
}

function createCountryNameElement (countryName, bulmaClass) {
  const countryNameElement = document.createElement('span')
  countryNameElement.classList.add('tag', `is-${bulmaClass}`)
  countryNameElement.appendChild(document.createTextNode(countryName))
  return countryNameElement
}

function createDeleteElement (countryPath) {
  const deleteElement = document.createElement('button')
  deleteElement.classList.add('tag', 'is-delete')
  deleteElement.addEventListener('click', () => removeSelectedCountry(countryPath))
  return deleteElement
}

function createCountryElement (countryId) {
  const countryElement = document.createElement('div')
  countryElement.classList.add('tags', 'has-addons')
  countryElement.setAttribute('id', `${countryId}-tag`)
  return countryElement
}

function createControlElement () {
  const controlElement = document.createElement('div')
  controlElement.classList.add('control')
  return controlElement
}

function addSelectedCountry (countryPath) {
  if (selectedCountries.length >= NB_COLORS) {
    displayNotification(ERROR_MESSAGE_NB_COUNTRY, 'is-info')
    return
  }

  const countryValue = CSV_VALUES.find(value => value.ISO_Country === countryPath.id && value.Year === selectedYear)
  if (!countryValue || countryValue[selectedIndicator] === '') {
    displayNotification(ERROR_MESSAGE_NULL_VALUE, 'is-warning')
    return
  }

  const bulmaClass = getNextColor()

  addCountryPathStyle(countryPath, bulmaClass)
  addControlElement(countryPath, bulmaClass)

  bulmaClassesUsed.push(bulmaClass)

  selectedCountries.push(countryPath.id)
}

// eslint-disable-next-line no-unused-vars
function updateSelectedCountries (event) {
  removeNotificationElement()

  const countryPath = event.target
  const index = selectedCountries.indexOf(countryPath.id)
  countryPath.classList.toggle('selected')
  if (index !== -1) {
    removeSelectedCountry(countryPath)
  } else {
    addSelectedCountry(countryPath)
  }
}
