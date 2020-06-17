jQuery(document).ready(function( $ ) {

    var canvas_loaded = false;

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

});
