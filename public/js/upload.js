jQuery(document).ready(function( $ ) {
	
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
			$(".display-pic").fadeIn(2000);
			$(".content").removeClass("hide");
     	});
	});



	$(".quickstart-modal-btn").on('click', function() {
		$(".carousel-inner .img-responsive").on('click', function() {
			$(".display-pic").attr('src', this.src);
			$(".display-pic").fadeIn(2000);
			$(".content").removeClass("hide");
			$("#quickstart-modal").modal('toggle');
			$("#quickstart-modal").fadeIn(2000);
		});
   	});
  

//   $("#avatar-form").submit(function (e) {
//     $(this).ajaxSubmit({
//         success: function (response) {
// 			console.log(response)
//             if(response.code == 1){
//                 var uploaded_img_path = response.imgPath;
//                 $(".display-pic").attr('src', uploaded_img_path);
//                 $(".display-pic").fadeIn(2000);
//             }else {
//                 // $('#show-upload-image').html('Upload failed');
//             }
//         }
//     });
//     return false;
//   });



// // custom code
//   $( "#quickstart" ).click(function() {
//     $( "#custom-container" ).animate({
//       opacity: 0
//     }, 300, function() {
//       // Animation complete.
//       $( "#quickstart-container" ).animate({
//         opacity: 100
//       }, 1000, "linear", function() {
//         // Animation complete.
//       });
//     });
//   });

//   $( "#custom" ).click(function() {
//     $( "#quickstart-container" ).animate({
//       opacity: 0
//     }, 300, function() {
//       // Animation complete.
//       $( "#custom-container" ).animate({
//         opacity: 100
//       }, 1000, "linear", function() {
//         // Animation complete.
//       });
//     });
//   });




});
