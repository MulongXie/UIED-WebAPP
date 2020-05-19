jQuery(document).ready(function( $ ) {
  // Initiate the wowjs animation library
  new WOW().init();

  // Init Owl Carousel
  $('.owl-carousel').owlCarousel({
    items: 4,
    autoplay: true,
    loop: true,
    margin: 30,
    dots: true,
    responsiveClass: true,
    responsive: {
      320: { items: 1},
      480: { items: 2},
      600: { items: 2},
      767: { items: 3},
      768: { items: 3},
      992: { items: 4}
    }
  });

// custom code
  $( "#quickstart" ).click(function() {
    $( "#custom-container" ).animate({
      opacity: 0
    }, 300, function() {
      // Animation complete.
      $( "#quickstart-container" ).animate({
        opacity: 100
      }, 1000, "linear", function() {
        // Animation complete.
      });
    });
  });

  $( "#custom" ).click(function() {
    $( "#quickstart-container" ).animate({
      opacity: 0
    }, 300, function() {
      // Animation complete.
      $( "#custom-container" ).animate({
        opacity: 100
      }, 1000, "linear", function() {
        // Animation complete.
      });
    });
  });

});
