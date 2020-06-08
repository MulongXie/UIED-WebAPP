jQuery(document).ready(function( $ ) {
  
	// Preloader (if the #preloader div exists)
	$(window).on('load', function () {
	  if ($('#preloader').length) {
		$('#preloader').delay(100).fadeOut('slow', function () {
		  $(this).remove();
		});
	  }
	});
  
	// Back to top button
	$(window).scroll(function() {
	  if ($(this).scrollTop() > 100) {
		$('.back-to-top').fadeIn('slow');
	  } else {
		$('.back-to-top').fadeOut('slow');
	  }
	});
	$('.back-to-top').click(function(){
	  $('html, body').animate({scrollTop : 0},1500, 'easeInOutExpo');
	  return false;
	});
  
	// Initiate the wowjs animation library
	new WOW().init();
  
	// Header scroll class
	$(window).scroll(function() {
	  if ($(this).scrollTop() > 100) {
		$('#header').addClass('header-scrolled');
	  } else {
		$('#header').removeClass('header-scrolled');
	  }
	});
  
	if ($(window).scrollTop() > 100) {
	  $('#header').addClass('header-scrolled');
	}
  
	// Smooth scroll for the navigation and links with .scrollto classes
	$('.main-nav a, .mobile-nav a, .scrollto').on('click', function() {
	  if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
		var target = $(this.hash);
		if (target.length) {
		  var top_space = 0;
  
		  if ($('#header').length) {
			top_space = $('#header').outerHeight();
  
			if (! $('#header').hasClass('header-scrolled')) {
			  top_space = top_space - 20;
			}
		  }
  
		  $('html, body').animate({
			scrollTop: target.offset().top - top_space
		  }, 1500, 'easeInOutExpo');
  
		  if ($(this).parents('.main-nav, .mobile-nav').length) {
			$('.main-nav .active, .mobile-nav .active').removeClass('active');
			$(this).closest('li').addClass('active');
		  }
  
		  if ($('body').hasClass('mobile-nav-active')) {
			$('body').removeClass('mobile-nav-active');
			$('.mobile-nav-toggle i').toggleClass('fa-times fa-bars');
			$('.mobile-nav-overly').fadeOut();
		  }
		  return false;
		}
	  }
	});


	/*--------------------------------------------------------------
	# Upload
	--------------------------------------------------------------*/
	$('#avatarInput').on('change', function(){
		this.$avatarModal = $("body").find('#avatar-modal');

		this.$avatarForm = this.$avatarModal.find('.avatar-form');
		this.$avatarUpload = this.$avatarForm.find('.avatar-upload');
		this.$avatarSrc = this.$avatarForm.find('.avatar-src');
		this.$avatarData = this.$avatarForm.find('.avatar-data');
		this.$avatarInput = this.$avatarForm.find('.avatar-input');
		this.$avatarSave = this.$avatarForm.find('.avatar-save');
		this.$avatarBtns = this.$avatarForm.find('.avatar-btns');
	
		this.$avatarWrapper = this.$avatarModal.find('.avatar-wrapper');
		this.$avatarPreview = this.$avatarModal.find('.avatar-preview');

		var canvas  = $(".avatar-wrapper")
		var context = canvas.get(0).getContext("2d")
		var img = new Image();

		files = this.$avatarInput.prop('files');
		if (files.length > 0) {
			file = files[0];
			this.url = URL.createObjectURL(file);

			img.src = this.url;
			img.onload = function() {
				context.clearRect(0, 0, img.width, img.height);
				context.canvas.height = img.height;
				context.canvas.width  = img.width;
				context.drawImage(img, 0, 0);
				
				var cropper = canvas.cropper({
					autoCropArea: 1,
					preview: ".avatar-preview"
				});
			};
			
		}

     	this.$avatarBtns.click(function(e) {
			var data = $(e.target).data();
			if (data.method) {
				canvas.cropper(data.method, data.option);
			}
		});

		this.$avatarSave.click(function() {
			var croppedImageDataURL = canvas.cropper('getCroppedCanvas').toDataURL("image/png"); 
			$(".display-pic").attr('src', croppedImageDataURL);
			$("#display-content").removeClass("hide");
			// $(".display-content").fadeIn(1000);
			$('html, body').animate({scrollTop:   $('#display-content').offset().top-100}, 1500, 'easeInOutExpo');
     	});
	});



	$(".quickstart-modal-btn").on('click', function() {
		$(".carousel-inner .img-responsive").on('click', function() {
			$(".display-pic").attr('src', this.src);
			$("#display-content").removeClass("hide");
			$('html, body').animate({scrollTop:   $('#display-content').offset().top-100}, 1500, 'easeInOutExpo');
		});
   	});
  
});
