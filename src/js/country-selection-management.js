'use strict'

const BULMA_COLORS = {
  info: '#3e8ed0',
  success: '#198038',
  warning: '#ffa600',
  primary: '#003f5c',
  danger: '#dd5182',
  link: '#485fc7'
}
const NB_COLORS = Object.keys(BULMA_COLORS).length

const ERROR_MESSAGE_NB_COUNTRY = `Vous ne pouvez sélectionner que ${NB_COLORS} pays au maximum.\nSi vous souhaitez désélectionner un pays cliquez à nouveau dessus.`
const ERROR_MESSAGE_NULL_VALUE = 'Vous ne pouvez pas sélectionner un pays dont les données ne sont pas connues'

function countryIsValid (countryPath) {
  const countryValues = CSV_VALUES.filter(value => value.ISO_Country === countryPath.id && value[selectedIndicator])
  return countryValues.length
}

function addCountryPathStyle (countryPath, bulmaClass) {
  countryPath.style.stroke = BULMA_COLORS[bulmaClass]
  countryPath.style.strokeWidth = '3px'
}

function removeCountryPathStyle (countryPath) {
  countryPath.style.removeProperty('stroke')
  countryPath.style.removeProperty('stroke-width')
}

function createCountryNameElement (countryName, bulmaClass) {
  const countryNameElement = document.createElement('span')
  countryNameElement.classList.add('tag', `is-${bulmaClass}`)
  countryNameElement.appendChild(document.createTextNode(countryName))
  return countryNameElement
}

function createDeleteElement (countryPath, countryManagement) {
  const deleteElement = document.createElement('a')
  deleteElement.classList.add('tag', 'is-delete')
  deleteElement.addEventListener('click', () => countryManagement.removeSelectedCountry(countryPath))
  return deleteElement
}

function createCountryElement (countryId) {
  const countryElement = document.createElement('div')
  countryElement.classList.add('tags', 'are-medium', 'has-addons')
  countryElement.setAttribute('id', `${countryId}-tag`)
  return countryElement
}

function createControlElement () {
  const controlElement = document.createElement('div')
  controlElement.classList.add('control')
  return controlElement
}

function addControlElement (countryPath, countryManagement, bulmaClass) {
  const countryNameElement = createCountryNameElement(countryPath.getAttribute('name'), bulmaClass)
  const deleteElement = createDeleteElement(countryPath, countryManagement)
  const countryElement = createCountryElement(countryPath.id)
  const controlElement = createControlElement()

  countryElement.appendChild(countryNameElement)
  countryElement.appendChild(deleteElement)

  controlElement.appendChild(countryElement)

  const selectedCountriesElement = document.getElementById('selected-countries')
  selectedCountriesElement.appendChild(controlElement)
}

function removeControlElement (countryId) {
  const countryElement = document.getElementById(`${countryId}-tag`)
  const controlElement = countryElement.parentNode
  controlElement.parentNode.removeChild(controlElement)
}

// eslint-disable-next-line no-unused-vars
class CountryManagement {
  constructor () {
    this.selectedCountries = {}
  }

  getNextColor () {
    const bulmaClassesUsed = Object.values(this.selectedCountries)
    for (const bulmaClass of Object.keys(BULMA_COLORS)) {
      if (!bulmaClassesUsed.includes(bulmaClass)) return bulmaClass
    }
  }

  getColor (countryName) {
    return this.selectedCountries[countryName]
  }

  getSelectedCountries () {
    return Object.keys(this.selectedCountries)
  }

  removeSelectedCountry (countryPath) {
    removeCountryPathStyle(countryPath)
    removeControlElement(countryPath.id)

    delete this.selectedCountries[countryPath.id]
  }

  addSelectedCountry (countryPath) {
    if (this.getSelectedCountries().length >= NB_COLORS) {
      displayNotification(ERROR_MESSAGE_NB_COUNTRY, 'is-info')
      return
    }

    if (!countryIsValid(countryPath)) {
      displayNotification(ERROR_MESSAGE_NULL_VALUE, 'is-warning')
      return
    }

    const bulmaClass = this.getNextColor()
    this.selectedCountries[countryPath.id] = bulmaClass

    addCountryPathStyle(countryPath, bulmaClass)
    addControlElement(countryPath, this, bulmaClass)
  }

  updateSelectedCountries (event) {
    removeNotificationElement()

    const countryPath = event.target
    countryPath.classList.toggle('selected')

    if (this.getSelectedCountries().includes(countryPath.id)) {
      this.removeSelectedCountry(countryPath)
    } else {
      this.addSelectedCountry(countryPath)
    }
  }

  displaySelectedCountries () {
    this.getSelectedCountries().forEach(key => {
      const countryPath = document.getElementById(key)
      if (countryIsValid(countryPath)) {
        addCountryPathStyle(countryPath, this.selectedCountries[key])
      } else {
        this.removeSelectedCountry(countryPath)
      }
    })
  }
}
