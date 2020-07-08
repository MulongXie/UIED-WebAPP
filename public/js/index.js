jQuery(document).ready(function( $ ) {

    var canvas_loaded = false;
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

		var files = this.$avatarInput.prop('files');
		if (files.length > 0) {
			file = files[0];
			this.url = URL.createObjectURL(file);

			img.src = this.url;
            if (canvas_loaded){
                canvas.cropper('replace', this.url);
            }else{
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
                canvas_loaded = true;
            }
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
			$("#display-content").attr('data-type', 'base64');
			// $(".display-content").fadeIn(1000);
			$('html, body').animate({scrollTop:   $('#display-content').offset().top - 100}, 1500, 'easeInOutExpo');
     	});
	});



	$(".quickstart-modal-btn").on('click', function() {
		$(".carousel-inner .img-responsive").on('click', function() {
			$(".display-pic").attr('src', this.src);
			$("#display-content").removeClass("hide");
            $("#display-content").attr('data-type', 'image');
            console.log($('#display-content').offset().top);
			$('html, body').animate({scrollTop: $('#display-content').offset().top - 100}, 1500, 'easeInOutExpo');
		});
   	});


    /*--------------------------------------------------------------
	# Process
	--------------------------------------------------------------*/
    var result_root = '';
    var upload_path = '';
    $("#btn-process").click(function () {
        if ($("#btn-process").hasClass('disabled')){
            console.log('Backend is running');
            return false;
        }

        let method = $("#method-select option:selected").attr('value');
        let input_img = $(".display-pic").attr('src');
        let input_type = $("#display-content").attr('data-type');
        let uied_params = null;

        if (method == 'uied'){
            uied_params = {};
        	let params = $(".slider");
        	for (let i = 0; i < params.length; i++){
        		uied_params[params[i].id] = params[i].value
			}
		}

        console.log(input_type);
        if(method == 'empty'){
        	alert('Please elect a method');
		}
		else{
            // Processing start
            $('#proc-status').fadeIn('quick').text('Processing ... (3s-15s ETA)');
            $('.loader').slideToggle('quick');
            $('#btn-process').addClass('disabled');
            $('#btn-show-res').addClass('disabled');
            $('#btn-show-res').attr('data-target', '');
            // $('#btn-show-res').css('margin-top', '-40px');
            $.ajax({
                url: '/process',
                type: 'post',
                data: {
                    input_img: input_img,
                    method: method,
                    input_type: input_type,
					uied_params: uied_params
                },
                success: function (resp) {
                    if (resp.code == 1){
                        result_root = resp.result_path;
                        upload_path = resp.upload_path;
                        console.log(resp);

                        // Allocate image and result on modal
                        $('#proc-status').text('Process Done!');
                        $('#show-input').attr('src', input_img);
                        $('#show-result').attr('src', result_root + '/' + 'result.jpg');
                        $('#btn-show-res').removeClass('disabled');
                        $('#btn-show-res').fadeIn('quick');
                        $('#btn-show-res').attr('data-target', '#result-modal');
                        // $('#btn-show-res').css('margin-top', '50px');
                        $('.modal-title').text('Detection Result - ' + method.toUpperCase())
                    }
                    else{
                        $('#proc-status').text('Process Failed!');
                        $('#btn-show-res').fadeOut();
                        alert('Process failed')
                    }
                    // Processing completed status
                    $('.loader').slideToggle('quick');
                    $('#btn-process').removeClass('disabled');
                },
				error: function (jqXHR) {
					console.log(jqXHR);
					if(jqXHR.status == 413){
						$('#proc-status').text('Image too Large!');
						$('#btn-show-res').fadeOut();
						$('.loader').slideToggle('quick');
						$('#btn-process').removeClass('disabled');
						alert('Uploaded image size too large');
					}
				}
            })
		}
    });

    $('#go-dashboard').click(function () {
        let method = $("#method-select option:selected").attr('value');

        let url = '/dashboard?method=' + method + '&input_img=' + upload_path + '&output_root=' + result_root;
        console.log(url);
        $(location).attr('href', url);

        // let url = new URL('https:/test');
        // url.searchParams.append('method', method);
        // url.searchParams.append('input_img', input_img);
        // url.searchParams.append('out_root', output_root);
        // console.log(url.href.replace('https:/', ''));
        // $(location).attr('href',  url.href.replace('https:/', ''));
    });

	/* Adjust uied's parameters */
	$('#method-select').on('change', function () {
		let selected_method = $("#method-select option:selected").attr('value');
		let params = $("#uied-parameter");
		if (selected_method == 'uied'){
			params.slideDown();
			$('#btn-process').css('margin-top', '20px')
		}
		else {
            params.slideUp();
            $('#btn-process').css('margin-top', '30px')
		}
    });

    $('.slider').on('input', function () {
        $('#' + $(this).attr('id') + '-show').text($(this).val());
        // let params = $('.slider');
        // console.log(params[0].id, params[0].value)
    });

});
