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
