'use strict';

var Layout = (function() {

  function pinSidenav() {
    // Add 'active' class to the element with the 'sidenav-toggler' class
    const sidenavToggler = document.querySelector('.sidenav-toggler');
    sidenavToggler.classList.add('active');

    // Set the 'data-action' attribute to 'sidenav-unpin'
    sidenavToggler.dataset.action = 'sidenav-unpin';

    // Remove 'g-sidenav-hidden' class and add 'g-sidenav-show' and 'g-sidenav-pinned' classes to the 'body' element
    document.body.classList.remove('g-sidenav-hidden');
    document.body.classList.add('g-sidenav-show', 'g-sidenav-pinned');

    // Create a new element for the backdrop and set its 'data-action' and 'data-target' attributes
    const backdrop = document.createElement('div');
    backdrop.classList.add('backdrop', 'd-xl-none');
    backdrop.dataset.action = 'sidenav-unpin';
    backdrop.dataset.target = document.getElementById('sidenav-main').dataset.target;

    // Append the backdrop to the 'body' element
    document.body.appendChild(backdrop);

    // Store the sidenav state in a cookie session using js-cookie library
    Cookies.set('sidenav-state', 'pinned');
  }

  function unpinSidenav() {
    // Remove 'active' class from the element with the 'sidenav-toggler' class
    const sidenavToggler = document.querySelector('.sidenav-toggler');
    sidenavToggler.classList.remove('active');

    // Set the 'data-action' attribute to 'sidenav-pin'
    sidenavToggler.dataset.action = 'sidenav-pin';

    // Remove 'g-sidenav-pinned' class and add 'g-sidenav-hidden' class to the 'body' element
    document.body.classList.remove('g-sidenav-pinned');
    document.body.classList.add('g-sidenav-hidden');

    // Remove the backdrop element from the 'body' element
    const backdrop = document.querySelector('.backdrop');
    if (backdrop) {
      backdrop.parentNode.removeChild(backdrop);
    }

    // Store the sidenav state in a cookie session using js-cookie library
    Cookies.set('sidenav-state', 'unpinned');
  }

    // Set sidenav state from cookie

  // Fetch the sidenav state from the cookie, or default to 'pinned'
  var sidenavState = Cookies.get('sidenav-state') ? Cookies.get('sidenav-state') : 'pinned';

// Check window width and apply sidenav state accordingly
  if (window.innerWidth > 1200) {
    if (sidenavState === 'pinned') {
      pinSidenav();
    } else if (sidenavState === 'unpinned') {
      unpinSidenav();
    }
  }

  document.body.addEventListener('click', function(e) {
    e.preventDefault();

    var target = e.target;
    var action = target.dataset.action;

    // Manage actions
    switch (action) {
      case 'sidenav-pin':
        pinSidenav();
        break;

      case 'sidenav-unpin':
        unpinSidenav();
        break;

      case 'search-show':
        target = target.dataset.target;
        document.body.classList.remove('g-navbar-search-show');
        document.body.classList.add('g-navbar-search-showing');

        setTimeout(function() {
          document.body.classList.remove('g-navbar-search-showing');
          document.body.classList.add('g-navbar-search-show');
        }, 150);

        setTimeout(function() {
          document.body.classList.add('g-navbar-search-shown');
        }, 300);
        break;

      case 'search-close':
        target = target.dataset.target;
        document.body.classList.remove('g-navbar-search-shown');

        setTimeout(function() {
          document.body.classList.remove('g-navbar-search-show');
          document.body.classList.add('g-navbar-search-hiding');
        }, 150);

        setTimeout(function() {
          document.body.classList.remove('g-navbar-search-hiding');
          document.body.classList.add('g-navbar-search-hidden');
        }, 300);

        setTimeout(function() {
          document.body.classList.remove('g-navbar-search-hidden');
        }, 500);
        break;
    }
  });


    // Add sidenav modifier classes on mouse events

  // Get the element with the class "sidenav"
  const sidenavElement = document.querySelector('.sidenav');

// Attach the 'mouseenter' event to the sidenav element
  sidenavElement.addEventListener('mouseenter', function() {
    // Check if the body does not have the class 'g-sidenav-pinned'
    if (!document.body.classList.contains('g-sidenav-pinned')) {
      // Remove 'g-sidenav-hide' and 'g-sidenav-hidden' classes, and add 'g-sidenav-show' class to the body
      document.body.classList.remove('g-sidenav-hide', 'g-sidenav-hidden');
      document.body.classList.add('g-sidenav-show');
    }
  });

// Attach the 'mouseleave' event to the sidenav element
  sidenavElement.addEventListener('mouseleave', function() {
    // Check if the body does not have the class 'g-sidenav-pinned'
    if (!document.body.classList.contains('g-sidenav-pinned')) {
      // Remove 'g-sidenav-show' class and add 'g-sidenav-hide' class to the body
      document.body.classList.remove('g-sidenav-show');
      document.body.classList.add('g-sidenav-hide');

      // After 300 milliseconds, remove 'g-sidenav-hide' class and add 'g-sidenav-hidden' class to the body
      setTimeout(function() {
        document.body.classList.remove('g-sidenav-hide');
        document.body.classList.add('g-sidenav-hidden');
      }, 300);
    }
  });



  // Attach 'load' and 'resize' events to the window object
  window.addEventListener('load', adjustBodyHeight);
  window.addEventListener('resize', adjustBodyHeight);

  function adjustBodyHeight() {
    // Check if the body height is less than 800 pixels
    if (document.body.clientHeight < 800) {
      // Set the minimum height of the body to 100vh using inline style
      document.body.style.minHeight = '100vh';

      // Add the class 'footer-auto-bottom' to the element with id 'footer-main'
      document.getElementById('footer-main').classList.add('footer-auto-bottom');
    } else {
      // If body height is greater than or equal to 800 pixels, remove the inline style and the class
      document.body.style.minHeight = '';
      document.getElementById('footer-main').classList.remove('footer-auto-bottom');
    }
  }

})();
