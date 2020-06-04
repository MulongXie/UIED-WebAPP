var using_example = false;
var uploaded_img_name = '';
var uploaded_img_path = '';
var processing_img_path = '';

// *** Upload customized image ***
// *******************************
$("#upload-img-btn").click(function () {
    $("#upload-img-input").click();
});

$("#upload-img-input").on("change", function () {
    let val = $(this).val();
    if (val != ''){
        let split = val.split('\\');
        uploaded_img_name = split.pop();
    }
    $('#upload-img-btn').text(uploaded_img_name);
    $('#submit-btn').slideDown("slow")
});

$('#submit-btn').click(function () {
    using_example = false;
});

$("#upload-img-form").submit(function () {
    $(this).ajaxSubmit({
        success: function (response) {
            carousel_out();
            if(response.code == 1){
                uploaded_img_path = response.imgPath;
                let showImage = $('#show-upload-image').children('img');
                console.log('Org image: ' + uploaded_img_path);
                showImage.attr('src', uploaded_img_path);
                showImage.fadeIn(2000);
                method_selection(uploaded_img_name, uploaded_img_path);
            }else {
                $('#show-upload-image').html('Upload failed');
            }
        }
    });
    return false;
});

function carousel_out() {
    let carousel = $('#show-examples-carousel');
    carousel.fadeOut();
    $("#examples-select").val("empty");
}
// *************************************


// *** Select provided example image ***
// *************************************
$('#examples-select').on('change', function () {
    using_example = true;
    let name = $("#examples-select option:selected").text();
    let car_index = parseInt(name.split('.')[0]) - 1;
    let carousel = $('#show-examples-carousel');
    $('#show-upload-image').children('img').hide();
    carousel.carousel(car_index);
    carousel.fadeIn();
    method_selection(name);
});

$('.my-carousel-img').click(function () {
    using_example = true;
    let name = $(this).attr('src').split('/').pop();
    let index = parseInt(name.split('.')[0]);

    $('#show-examples-carousel').carousel(index - 1);
    $("#examples-select").val(index);
    method_selection(name);
});
// *************************************

function processing_start() {
    processing_wait();
    let method = $("#method-select option:selected").attr('value');

    $.ajax({
        url: '/' + method,
        type: 'get',
        data: {
            image_path: processing_img_path
        },
        success: function (response) {
            if (response.code == 1){
                alert('success ' + processing_img_path + ' ' + response.result_path + '/result.jpg');
                $("#li-nav-result").fadeIn('slow');
                $('#result').slideDown('slow');
                $('#display-input-img').attr('src', processing_img_path);
                $('#display-result-img').attr('src', response.result_path + '/result.jpg');
                $('html, body').animate({
                    scrollTop: $("#result").offset().top
                })
            }
            else {
                alert('failed')
            }
            processing_done();
        }
    })
}

function method_selection(input_name, saved_path=''){
    $("#select-methods-section").fadeIn();
    let method_select = $("#method-select");
    method_select.on('change', function () {
        let method = $("#method-select option:selected").text();
        confirm_selection(input_name, method, saved_path);
    })
}

function confirm_selection(input_name, method, saved_path='') {
    let confirm = $("#confirm-input");
    confirm.fadeIn();
    if (input_name.search('.jpg|.png') != -1){
        $("#btn-process").removeClass('disabled');
        if (using_example){
            confirm.children('h3').text("Use Image Example " + input_name);
            confirm.children('h2').text("Use Method " + method);
            processing_img_path = 'data/example/' + input_name;
        }
        else {
            confirm.children('h3').text("Use Image Example " + input_name);
            confirm.children('h2').text("Use Method " + method);
            processing_img_path = saved_path;
        }
    }
    else {
        confirm.children('h3').text("Only accept image formats(.jpg/.png)");
        $("#btn-process").addClass('disabled');
    }
}

function processing_wait() {
    $("#btn-process").addClass('disabled');
    $("#confirm-input").children('p').text('Processing ...')
}

function processing_done() {
    $("#btn-process").removeClass('disabled');
    $("#confirm-input").children('p').text('Processing Done')
}

function scrollFunc() {
    let scroll_top = parseInt($(document).scrollTop());
    let nav_bar = $('#navigation');
    let nav_container = $('#navigation-container');
    if(scroll_top > 100){
        nav_container.css('padding', '0px');
        nav_bar.css('background', 'white');
        nav_bar.css('box-shadow', '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2)')
    }
    else {
        nav_container.css('padding', '60px');
        nav_bar.css('background', 'rgba(0,0,0,0.2)');
    }
}
