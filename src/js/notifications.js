'use strict'

function removeNotificationElement () {
  const notificationElement = document.getElementById('notification')
  notificationElement.removeAttribute('class')
  while (notificationElement.firstChild) {
    notificationElement.removeChild(notificationElement.lastChild)
  }
}

// eslint-disable-next-line no-unused-vars
function displayNotification (fullMessage, bulmaClass) {
  removeNotificationElement()

  const notificationElement = document.getElementById('notification')
  const buttonElement = document.createElement('button')
  const divElement = document.createElement('div')

  const messages = fullMessage.split('\n')

  for (const message of messages) {
    const messageNode = document.createTextNode(message)
    const brElement = document.createElement('br')

    divElement.appendChild(messageNode)
    divElement.appendChild(brElement)
  }

  buttonElement.classList.add('delete')
  buttonElement.addEventListener('click', removeNotificationElement)

  notificationElement.appendChild(buttonElement)
  notificationElement.appendChild(divElement)
  notificationElement.setAttribute('class', `notification ${bulmaClass}`)
}
