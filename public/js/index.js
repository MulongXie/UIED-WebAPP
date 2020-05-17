
$("#upload-img-btn").click(function () {
    $("#upload-img-input").click()
});

$('.my-carousel-img').click(function () {
    let name = $(this).attr('src').split('/').pop();
    let index = parseInt(name.split('.')[0].substring(3));

    $('#show-examples-carousel').carousel(index - 1);
    $("#examples-select").val(index);

    confirm_selection(name);
});

function select_example() {
    let name = $("#examples-select option:selected").text();
    let car_index = parseInt(name.split('.')[0]) - 1;
    let carousel = $('#show-examples-carousel');
    $('#show-example-image').children('img').hide();
    carousel.carousel(car_index);
    carousel.fadeIn();
    confirm_selection(name)
}

function carousel_out() {
    let carousel = $('#show-examples-carousel');
    carousel.fadeOut();
    $("#examples-select").val("empty");
}

function confirm_selection(input_name) {
    let confirm = $("#confirm-input");
    confirm.fadeIn();
    if (input_name.search('.jpg|.png') != -1){
        confirm.children('h3').text("Use Image " + input_name);
        $("#btn-process").removeClass('disabled');
    }
    else {
        confirm.children('h3').text("Only accept image formats(.jpg/.png)");
        $("#btn-process").addClass('disabled');
    }
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