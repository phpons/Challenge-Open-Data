const updateNavbarEvents = () => {
  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0)

  // Check if there are any navbar burgers
  if ($navbarBurgers.length <= 0) return

  // Add a click event on each of them
  $navbarBurgers.forEach(el => {
    el.addEventListener('click', () => {
      // Get the target from the "data-target" attribute
      const target = el.dataset.target
      const $target = document.getElementById(target)

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      el.classList.toggle('is-active')
      $target.classList.toggle('is-active')
    })
  })

  $navbarBurgers.forEach(burger => {
    // Get all "navbar-item" elements
    const target = burger.dataset.target
    const $target = document.getElementById(target)
    const $navbarItems = Array.prototype.slice.call($target.querySelectorAll('.navbar-item'), 0)

    // Add a click event on each navbar item
    console.log($navbarItems)
    $navbarItems.forEach(el => {
      el.addEventListener('click', () => {
        $navbarItems.forEach(item => {
          // Remove the active class
          item.classList.remove('is-active')
        })
        // Add the active class to the selected one
        el.classList.add('is-active')
      })
    })
  })
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavbarEvents()
})
