$(document).ready(function () {
    dashboard_init();
    set_draggable();

    /* show UI kits */
    $('#uikits_sidebar').click(function () {
        let kits = $('#show_kits');
        kits.animate({
            width: 'toggle'
        });
    });
});


var input_img_path = $('#inputImgPath').attr('data-value');
var result_path = $('#resultPath').attr('data-value');
var method = $('#method').attr('data-value');

var det_json_result = '';
var scale = 0.6;
var img_dict = {};
var classes = [];
var count_class = {};
var num_class = 0;
var index_global = 0;               // useful when adding new compos by clicking kit images
var existing_methods = [method];


function dashboard_init() {

    var output_root = '../' + result_path + '/';
    // var output_root = '../data/outputs/uied/example2/';
    var clip_root = output_root + 'clips/';
    console.log(output_root);

    /* load canvas main board */
    var canvas_init = function(){
        $.ajaxSettings.async = false;
        $.getJSON(output_root + 'compo.json',function(result){
            det_json_result = result;
            let html = "";

            // put components on the center of dashboard
            let offset_top = 0;
            let offset_left = 0;
            if (result['compos'][0]['class'] == 'Background'){
                offset_top = Math.round(($(window).height() - result['compos'][0]['height']*scale - $('#board').offset()['top'])/2);
                offset_left = Math.round(($('#board').width() - result['compos'][0]['width']*scale - $('#board').offset()['left'])/2);
            }

            // put resulting compos on dashboard
            for (let i = 0; i < result["compos"].length; i++) {
                let c = result["compos"][i]["class"];
                let idx = result["compos"][i]["id"];
                index_global ++;
                img_dict[c+idx] = result["compos"][i];
                if(c != 'Background'){
                    var clip_path = clip_root + c + "/" +idx+ ".jpg";
                }
                else {
                    var clip_path = clip_root+'bkg.png';
                }

                // add UI kits lists
                if(c in count_class){
                    $("#"+c).append('<li class="list-group-item"><img src='+clip_path+'></li>');
                    count_class[c] ++;
                }
                else{
                    $('#menu-uikits').append('<li class="components" data-type="'+ num_class + '"><a href="javascript:void(0)">' + c + '</a></li>');
                    $('.pic').append('<ul id="' + c + '" class="list-group list-group-flush"></ul>');
                    $("#"+c).append('<li class="list-group-item"><img src='+clip_path+'></li>');
                    num_class ++;
                    classes.push(c);
                    count_class[c] = 0;
                }

                // add image on sketch board
                let x = result["compos"][i]["row_min"];
                let y = result["compos"][i]["column_min"];
                let id = 'draggable_'+c+'_'+idx;
                x += offset_top;
                y += offset_left;
                html += '<div id="'+id+'" class="draggable" style="top: '+x+'px; left: '+y +'px; ">';
                html += '   <div href="javascript:void(0)" class="right-sidebar-toggle" data-sidebar-id="main-right-sidebar">';
                // html += '		<a class="objects" data-toggle="tooltip" data-placement="top" title="'+c+': '+width+'x'+height+'">';
                html += '			<img class="image" src="'+ clip_path + '" id="'+id+'header">';
                // html += '		</a>';
                html += '   </div>';
                html += '</div>';
            }
            $(".box").append(html);
        });
    };

    /* left sidebar */
    /* 1. UI components collection kit */
    /* 2. Models preview and selection */
    var left_sidebar_init = function () {

        /* UI kits */
        var components_init = function(){
            $("#menu-uikits").eq(0).addClass('active-page');
            $(".pic>ul").eq(0).addClass("on");
            $("#name").text(classes[0]);

            // UI kit list
            $(".components").click(function () {
                $(this).addClass("active-page").siblings().removeClass('active-page');
                $(".pic>ul").removeClass('on').eq($(this).attr('data-type')).addClass("on");
                document.getElementById("name").innerHTML = $(this).text();
            });

            // allow tooltip
            $(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });

        };

        var model_previews_init = function(){
            let preview_list_img = '<li class="list-group-item my-preview-list my-preview-list-active text-center" datatype="img">' +
                '<h5>' + method.toUpperCase() + '</h5>' +
                '<img title="' + method +'" class="my-preview-img my-preview-img-active" ' +
                'src="' + '../' + result_path + '/result.jpg"></li>';
            $('#menu-models').prepend(preview_list_img);

            $('.my-preview-list').hover(function () {
                $(this).css('background', 'rgba(51, 122, 183, 0.3)');
            }, function () {
                $(this).css('background', '');
            });

            $('.my-preview-list').click(function () {
                $('.my-preview-list-active').removeClass('my-preview-list-active');
                $(this).addClass('my-preview-list-active');

                // clear dashboard area
                if ($(this).attr('datatype') == 'img'){
                    // $('.box').html('');
                    let img = $(this).children('img');
                    result_path = img.attr('src').repeat('result.jpg', '');
                    method = img.attr('title');

                    // dashboard_init();
                    // set_draggable();
                }
                else if($(this).attr('datatype') == 'more'){
                    show_pop_up();
                }

                // add additional models
                // dashboard_init('../data/outputs/uied/example2/');
                // set_draggable();
            });

        };

        components_init();
        model_previews_init();
    };

    /* right sidebar */
    /* 1. Compo return to original position */
    /* 2. Apply new shpe to compo */
    /* 3. Delete compo */
    /* 4. Add compo selected in the UI kit */
    var right_sidebar_init = function () {

        // click image in UI kits and display in right sidebar
        $(".pic li img").click(function(){
            var imgsrc = $(this).attr('src');
            var imgsrc_split = imgsrc.split('/');

            if(imgsrc_split[imgsrc_split.length - 1].split('.')[0] == 'bkg'){
                var img_info = img_dict['Background0'];
                $('#add').hide();
            }
            else{
                var img_info = img_dict[imgsrc_split[imgsrc_split.length - 2]+imgsrc_split[imgsrc_split.length - 1].split('.')[0]];
                $('#add').show();
            }

            var c = img_info["class"];
            var height = img_info["height"];
            var width = img_info["width"];
            document.getElementById("right-sidebar-img-component").src = imgsrc;
            document.getElementById("right-sidebar-type-component").innerHTML = c;
            $("#right-sidebar-width-component").attr("placeholder",width);
            $("#right-sidebar-height-component").attr("placeholder",height);
            $("#right-sidebar-top-component").attr("placeholder",0);
            $("#right-sidebar-left-component").attr("placeholder",0);
            $("#main-right-sidebar").removeClass("visible");
            $("#main-right-sidebar-component").addClass("visible");
        });

        var close = function(){
            $(".right-sidebar-close").click(function () {
                $("#main-right-sidebar").removeClass("visible");
                $("#main-right-sidebar-component").removeClass("visible");
            });
        };

        var return_compo = function(){
            $("#return").click(function () {
                var id = document.getElementsByClassName("active-component")[0].getAttribute("id");
                var img_info = img_dict[id.split('_')[1]+id.split('_')[2]];
                var height = img_info["height"];
                var width = img_info["width"];
                var top = img_info["row_min"];
                var left = img_info["column_min"];
                $("#right-sidebar-width").attr("placeholder",width);
                $("#right-sidebar-height").attr("placeholder",height);
                $("#right-sidebar-top").attr("placeholder",top);
                $("#right-sidebar-left").attr("placeholder",left);
                $("#"+id).css("top", top+'px');
                $("#"+id).css("left", left+'px');
                $("#"+id+"header").css("height", height+'px');
                $("#"+id+"header").css("width", width+'px');
            });
        };

        var delete_cmpo = function(){
            $("#delete").click(function () {
                document.getElementsByClassName("box")[0].removeChild(document.getElementsByClassName("active-component")[0]);
                $("#main-right-sidebar").removeClass("visible");
                $("#main-right-sidebar-component").removeClass("visible");
            });
        };

        var apply_compo = function(){
            $("#apply").click(function () {
                var width = $('#right-sidebar-width').val();
                var height = $('#right-sidebar-height').val();
                var top = $('#right-sidebar-top').val();
                var left = $('#right-sidebar-left').val();
                if (width == ""){width = $('#right-sidebar-width').attr("placeholder");}
                if (height == ""){height = $('#right-sidebar-height').attr("placeholder");}
                if (top == ""){top = $('#right-sidebar-top').attr("placeholder");}
                if (left == ""){left = $('#right-sidebar-left').attr("placeholder");}
                $("#right-sidebar-width").val("");
                $("#right-sidebar-height").val("");
                $("#right-sidebar-top").val("");
                $("#right-sidebar-left").val("");
                $("#right-sidebar-width").attr("placeholder",width);
                $("#right-sidebar-height").attr("placeholder",height);
                $("#right-sidebar-top").attr("placeholder",top);
                $("#right-sidebar-left").attr("placeholder",left);
                var id = document.getElementsByClassName("active-component")[0].getAttribute("id");
                $("#"+id).css("top", top+'px');
                $("#"+id).css("left", left+'px');
                $("#"+id+"header").css("height", height+'px');
                $("#"+id+"header").css("width", width+'px');
            });
        };

        var add_new_compo = function(){
            $("#add").click(function(){
                let type = $('#right-sidebar-type-component').text();
                let width = $('#right-sidebar-width-component').attr("placeholder");
                let height = $('#right-sidebar-height-component').attr("placeholder");
                let top = $('#right-sidebar-top-component').attr("placeholder");
                let left = $('#right-sidebar-left-component').attr("placeholder");
                $("#right-sidebar-width").val("");
                $("#right-sidebar-height").val("");
                $("#right-sidebar-top").val("");
                $("#right-sidebar-left").val("");
                $("#right-sidebar-width").attr("placeholder",width);
                $("#right-sidebar-height").attr("placeholder",height);
                $("#right-sidebar-top").attr("placeholder",top);
                $("#right-sidebar-left").attr("placeholder",left);
                document.getElementById("right-sidebar-type").innerHTML = type;
                document.getElementById("right-sidebar-img").src = document.getElementById("right-sidebar-img-component").src;
                $("#main-right-sidebar").addClass("visible");
                $("#main-right-sidebar-component").removeClass("visible");

                count_class[type] ++;

                let id = 'draggable_'+type+'_'+index_global;
                let html = "";
                html += '<div id="'+id+'" class="draggable" style="top:'+top+' px; left: '+left+'px">';
                html += '   <div href="javascript:void(0)" class="right-sidebar-toggle" data-sidebar-id="main-right-sidebar">';
                html += '	    <img class="image" src="'+document.getElementById("right-sidebar-img-component").src+'" id="'+id+'header" style="height:'+height+'px; width:'+width+'px;">'
                html += '   </div>';
                html += '</div>';
                $(".box").append(html);

                $('#'+id).addClass("active-component").siblings().removeClass('active-component');
                drag_and_click(scale);

                img_dict[type+index_global] = {
                    "column_min": 0,
                    "id": index_global,
                    "height": height,
                    "width": width,
                    "column_max": 0,
                    "row_max": 0,
                    "row_min": 0,
                    "class": type,
                };
                index_global ++;
            });
        };

        close();
        return_compo();
        delete_cmpo();
        apply_compo();
        add_new_compo();
    };

    canvas_init();
    left_sidebar_init();
    right_sidebar_init();
}

function drag_and_click(s){
    var click = {x: 0,y: 0};
    $('.draggable').draggable({
        cursor: "move",
        start: function(event) {
            click.x = event.clientX;
            click.y = event.clientY;
            var id = $(this).attr('id');
            var type = id.split("_")[1];
            var element = document.getElementById(id);
            var width = element.offsetWidth;
            var height = element.offsetHeight;
            var top = element.offsetTop;
            var left = element.offsetLeft;
            var imgsrc = document.getElementById(id+'header').src;
            document.getElementById("right-sidebar-img").src = imgsrc;
            document.getElementById("right-sidebar-type").innerHTML = type;
            $("#right-sidebar-width").attr("placeholder",width);
            $("#right-sidebar-height").attr("placeholder",height);
            $("#right-sidebar-top").attr("placeholder",top);
            $("#right-sidebar-left").attr("placeholder",left);
            $("#main-right-sidebar").addClass("visible");
            $("#main-right-sidebar-component").removeClass("visible");
            $(this).addClass("active-component").siblings().removeClass('active-component');
        },
        drag: function(event, ui) {
            var zoom = s;
            var original = ui.originalPosition;
            ui.position = {
                left: (event.clientX - click.x + original.left) / zoom,
                top:  (event.clientY - click.y + original.top ) / zoom
            };
            var id = $(this).attr('id');
            var type = id.split("_")[1];
            var element = document.getElementById(id);
            var width = element.offsetWidth;
            var height = element.offsetHeight;
            var top = element.offsetTop;
            var left = element.offsetLeft;
            var imgsrc = document.getElementById(id+'header').src;
            document.getElementById("right-sidebar-img").src = imgsrc;
            document.getElementById("right-sidebar-type").innerHTML = type;
            $("#right-sidebar-width").attr("placeholder",width);
            $("#right-sidebar-height").attr("placeholder",height);
            $("#right-sidebar-top").attr("placeholder",top);
            $("#right-sidebar-left").attr("placeholder",left);
            $("#main-right-sidebar").addClass("visible");
            $("#main-right-sidebar-component").removeClass("visible");
        },
        stop: function(event, ui){
            $("#main-right-sidebar").addClass("visible");
            $("#main-right-sidebar-component").removeClass("visible");
        }
    });

    /* Click function */
    $('.draggable').on('click', function(){
        if ($("#main-right-sidebar").hasClass("visible")){
            $("#main-right-sidebar").removeClass("visible");
            $("#main-right-sidebar-component").removeClass("visible");
        }else{
            var id = $(this).attr('id');
            var type = id.split("_")[1];
            var element = document.getElementById(id);
            var width = element.offsetWidth;
            var height = element.offsetHeight;
            var top = element.offsetTop;
            var left = element.offsetLeft;
            var imgsrc = document.getElementById(id+'header').src;
            document.getElementById("right-sidebar-img").src = imgsrc;
            document.getElementById("right-sidebar-type").innerHTML = type;
            $("#right-sidebar-width").attr("placeholder",width);
            $("#right-sidebar-height").attr("placeholder",height);
            $("#right-sidebar-top").attr("placeholder",top);
            $("#right-sidebar-left").attr("placeholder",left);
            $("#main-right-sidebar").toggleClass("visible");
            $("#main-right-sidebar-component").removeClass("visible");
            $(this).addClass("active-component").siblings().removeClass('active-component');
        }
    });
}

function set_draggable(){
    // Scale
    resize(scale);
    // Draggable and Clickable
    drag_and_click(scale);
    // attach keyDown event
    document.addEventListener("keydown", keyDownHandler, false);

    function keyDownHandler(e) {
        var keyCode = e.keyCode;
        var myNode = document.getElementsByClassName("active1");
        // if DELETE or BACKSPACE
        if (keyCode == 8 || keyCode == 46) {
            document.getElementsByClassName("box")[0].removeChild(document.getElementsByClassName("active-component")[0]);
            $("#main-right-sidebar").removeClass("visible");
        }else if (keyCode == 187){
            scale += 0.1;
            resize(scale);
            drag_and_click(scale)
        }else if (keyCode == 189){
            scale -= 0.1;
            resize(scale);
            drag_and_click(scale)
        };
    };
    function resize(scale){
        document.getElementsByClassName("box")[0].style.transform = "scale("+scale+")"
    }

}


/* actions of Model previews */


/* add additional model pop-up page */
// close popup while clicking outside
function show_pop_up(){
    $('#add_proc_btn').removeClass('disabled');
    $('#add_proc_status').text('');
    $('.pop-up').show();
}

function close_pop_up() {
    $('.pop-up').hide();
}

$(document).click(function (event) {
    let popup = $('.pop-up');
    if (event.target == popup[0] || event.target == $('.my-preview-list')[0]){
        $('.pop-up').hide();
    }
});

$('#add_proc_btn').click(function () {
    $('#add_proc_btn').addClass('disabled');
    $('#add_proc_status').text('Processing ...');

    method = $("#add_method_select option:selected").attr('value');
    console.log(input_img_path);
    $.ajax({
        url: '/' + method,
        type: 'get',
        async: true,
        data:{
            image_path: input_img_path
        },
        success: function (response) {
            if (response.code == 1){
                result_path = response.result_path;
                alert('success ' + input_img_path + ' ' + result_path);

                $('#add_proc_btn').removeClass('disabled');
                $('#add_proc_status').text(method.toUpperCase() + ' Processing Done');

                $('.my-preview-list-active').removeClass('my-preview-list-active');
                $('.my-preview-img-active').removeClass('my-preview-img-active');

                // let preview_list_img = '<li class="list-group-item my-preview-list my-preview-list-active text-center" datatype="img">' +
                //     '<h5>' + method.toUpperCase() + '</h5>' +
                //     '<img title="' + method +'" class="my-preview-img my-preview-img-active" ' +
                //     'src="' + '../' + result_path + '/result.jpg"></li>';
                //
                // $('#menu-models').prepend(preview_list_img);

                dashboard_init();
                set_draggable();
                close_pop_up();
            }
            else {
                alert('Failed');
            }
        }
    });

    return false;
});
