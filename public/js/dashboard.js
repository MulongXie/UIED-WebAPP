$(document).ready(function () {

    /* Processing Result Passed from Sever */
    var input_img_path = $('#inputImgPath').attr('data-value');
    var result_path = $('#resultPath').attr('data-value');
    var method = $('#method').attr('data-value');

    // var input_img_path = 'public/images/screen/2.jpg';
    // var result_path = 'output_root=data/outputs/uied/image_2';
    // var method = 'uied';

    var scale = 0.6;    // Size of shown image on the dashboard

    /*--------------------------------------------------------------
	# Initialize the Dashboard and Put the Detection Result on It
	--------------------------------------------------------------*/
    var det_json_result = '';
    var img_dict = {};
    var classes = [];
    var count_class = {};
    var num_class = 0;
    var index_global = 0;
    function dashboard_init() {
        var output_root = '../' + result_path + '/';
        // var output_root = '../data/outputs/uied/example2/';
        var clip_root = output_root + 'clips/';
        console.log(output_root);

        /* load canvas main board */
        var canvas_init = function(update_kits=true){
            $.ajaxSettings.async = false;
            $.getJSON(output_root + 'compo.json',function(result){
                det_json_result = result;
                let html = "";

                // put components on the center of dashboard
                let offset_top = 0;
                let offset_left = 0;
                if (result['compos'][0]['class'] == 'Background'){
                    let total_height = result['compos'][0]['height'];
                    let total_width = result['compos'][0]['width'];
                    // scale the result as 0.9 height of vertical height of the window
                    scale = $(window).height() / total_height * 0.9;

                    offset_top = Math.round(($(window).height() - total_height*scale - $('#board').offset()['top'])/2);
                    offset_left = Math.round(($('#board').width() - total_width*scale - $('#board').offset()['left'])/2);

                    console.log(offset_top);
                    console.log(offset_left);
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

                    if(update_kits){
                        // add UI kits lists
                        if(c in count_class){
                            $("#"+c).append('<li class="list-group-item"><img src='+clip_path+'></li>');
                            count_class[c] ++;
                        }
                        else{
                            $('#menu-uikits').append('<li class="components animation" data-type="'+ num_class + '"><a href="javascript:void(0)">' + c + '</a></li>');
                            $('.pic').append('<ul id="' + c + '" class="list-group list-group-flush"></ul>');
                            $("#"+c).append('<li class="list-group-item"><img src='+clip_path+'></li>');
                            num_class ++;
                            classes.push(c);
                            count_class[c] = 0;
                        }
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
                let preview_list_img = '<li class="list-group-item my-preview-list my-preview-list-img my-preview-list-active text-center" datatype="img">' +
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

                    // refresh sketch board to display target model
                    if ($(this).attr('datatype') == 'img'){
                        let img = $(this).children('img');
                        // click different method preview than current one
                        if (method != img.attr('title')){
                            result_path = img.attr('src').repeat('result.jpg', '');
                            method = img.attr('title');

                            $('.box').html('');
                            canvas_init(false);
                            set_draggable();
                        }
                    }
                    // popup more methods selection
                    // else if($(this).attr('datatype') == 'more'){
                    //     show_pop_up();
                    // }
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
                $("#right-sidebar-img-component").attr('src', imgsrc);
                $("#right-sidebar-type-component").html(c);
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


    /*--------------------------------------------------------------
	# Enable the Drag and Drop Function
	--------------------------------------------------------------*/
    function drag_and_click(s){
        /* Drag function */
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
        let prev_id = '';
        $('.draggable').on('click', function(){
            var id = $(this).attr('id');

            if (prev_id == id){
                $("#main-right-sidebar").toggleClass("visible");
            }
            else{
                prev_id = id;
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
                $(this).addClass("active-component").siblings().removeClass('active-component');
                $("#main-right-sidebar").addClass("visible");
            }
            $("#main-right-sidebar-component").removeClass("visible");
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

    dashboard_init();
    set_draggable();


    /*--------------------------------------------------------------
	# Processing by New model
	--------------------------------------------------------------*/
    var existing_methods = [method];
    $('#modal_proc_btn_new_img').hide();
    $('#modal_proc_btn_new_model').show();

    $('#modal_proc_btn_new_model').click(function () {
        let new_method = $("#add_method_select option:selected").attr('value');

        console.log(input_img_path);

        if (new_method == 'empty'){
            alert("Please select a new detection method")
        }
        else if(existing_methods.includes(new_method)){
            alert(new_method.toUpperCase() + ' is Existing');
        }
        else{
            existing_methods.push(new_method);
            method = new_method;
            $('#modal_proc_btn_new_model').prop('disabled', true);
            $('#modal_proc_status').text('Processing ...').slideDown();
            $.ajax({
                url: '/process',
                type: 'post',
                async: true,
                data:{
                    method: method,
                    input_img: input_img_path,
                    input_type: 'image'
                },
                success: function (response) {
                    if (response.code == 1){
                        result_path = response.result_path;
                        alert('Processing Success!');

                        $('#modal_proc_btn_new_model').prop('disabled', false);
                        $('#modal_proc_status').text(method.toUpperCase() + ' Processing Done');

                        $('.my-preview-list-active').removeClass('my-preview-list-active');
                        $('.my-preview-img-active').removeClass('my-preview-img-active');

                        $('.box').html('');
                        dashboard_init();
                        set_draggable();
                    }
                    else {
                        alert('Failed');
                    }
                }
            });
        }
        return false;
    });

    $('#add_method_select').on('change', function () {
        let selected_method = $("#add_method_select option:selected").attr('value');
        let params = $("#uied-parameter");
        if (selected_method == 'uied'){
            params.slideDown();
        }
        else {
            params.slideUp();
        }
    });

    $('.slider').on('input', function () {
        $('#' + $(this).attr('id') + '-show').text($(this).val());
    });

    $('#uikits_sidebar').click(function () {
        let kits = $('#show_kits');
        kits.animate({
            width: 'toggle'
        });
    });


    /*--------------------------------------------------------------
	# Upload New Image
	--------------------------------------------------------------*/
    /* Upload */
    var canvas_loaded = false;
    $('#avatarInput').on('change', function(){
        this.$avatarModal = $("body").find('#modal-new-img');

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
        console.log(files);
        if (files.length > 0) {
            $('#btn-upload-process').prop('disabled', false);
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
        });
    });

    /* Button for processing new image rather than new model for the same img*/
    $('#btn-upload-process').click(function () {
        // Switch processing button
        $('#modal_proc_btn_new_model').hide();
        $('#modal_proc_btn_new_img').show();
    });

    /* Go back when cancel */
    $('#modal-new-model').on('hide.bs.modal', function () {
        console.log('hidden');
        $('#modal_proc_btn_new_img').hide();
        $('#modal_proc_btn_new_model').show();
    });


    /*--------------------------------------------------------------
    # Process New Image
    --------------------------------------------------------------*/
    /* Reinitiate all global variables */
    function init_whole_dashboard() {
        // Dashboard initiation
        det_json_result = '';
        img_dict = {};
        classes = [];
        count_class = {};
        num_class = 0;
        index_global = 0;

        $('#menu-uikits').html('');
        $('#name').html('');
        $('.pic').html('');
        $('.box').html('');
        $('.my-preview-list-img').remove();
    }

    $('#modal_proc_btn_new_img').click(function () {
        let input_img = $(".display-pic").attr('src');
        let selected_method = $("#add_method_select option:selected").attr('value');

        if (selected_method == 'empty'){
            alert("Please select a new detection method")
        }
        else{
            $('#modal_proc_btn_new_img').prop('disabled', true);
            $('#modal_proc_status').text('Processing ...').slideDown();
            $.ajax({
                url: '/process',
                type: 'post',
                async: true,
                data:{
                    method: selected_method,
                    input_img: input_img,
                    input_type: 'base64'
                },
                success: function (response) {
                    if (response.code == 1){
                        alert('Processing Success!');
                        $('#modal_proc_btn_new_img').prop('disabled', false);
                        $('#modal_proc_status').text(method.toUpperCase() + ' Processing Done');

                        // Reload new result
                        let url = '/dashboard?method=' + selected_method + '&input_img=' + response.upload_path + '&output_root=' + response.result_path;
                        console.log(url);
                        $(location).attr('href', url);

                        // Reload new result without page jumping
                        // Reset global variables
                        // input_img_path = response.upload_path;
                        // result_path = response.result_path;
                        // method = selected_method;
                        // existing_methods = [method];
                        // $('#inputImgPath').attr('data-value', input_img_path);
                        // $('#resultPath').attr('data-value', result_path);
                        // $('#method').attr('data-value', method);
                        // $('.my-preview-list-active').removeClass('my-preview-list-active');
                        // $('.my-preview-img-active').removeClass('my-preview-img-active');
                        // Reset whole dashboard
                        // init_whole_dashboard();
                        // dashboard_init();
                        // set_draggable();
                    }
                    else {
                        alert('Failed');
                    }
                }
            });
        }
        return false;
    });


    /*--------------------------------------------------------------
    # Export Result
    --------------------------------------------------------------*/
    function get_result_json() {
        let bkg = $('#draggable_Background_0');
        let offset_top = parseInt(bkg.css('top'));
        let offset_left = parseInt(bkg.css('left'));

        console.log(offset_top, offset_left);

        let compos = $('.box').children();
        let compos_json = {'compos':[]};
        let idx = 0;
        for (let i = 0; i < compos.length; i ++){
            let compo = $("#" + compos[i].id);
            let top = parseInt(compo.css('top')) - offset_top;
            let left = parseInt(compo.css('left')) - offset_left;
            if (top < 0 || left < 0) continue;
            let c = {'id': i,
                'class': compo.attr('id').split('_')[1],
                'row_min': top,
                'column_min': left,
                'width': compo.width(),
                'height': compo.height()
            };
            compos_json['compos'].push(c);
            idx += 1;
            // console.log(c)
        }
        return compos_json;
    }

    $('#btn-export').click(function () {
        let json = get_result_json();
        // console.log(encodeURIComponent(JSON.stringify(json)));
        $(this).attr('href', 'data:application/json,' + encodeURIComponent(JSON.stringify(json, null, '\t')))
    })
});
