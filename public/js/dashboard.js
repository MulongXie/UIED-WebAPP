$(document).ready(function() {

    var scale = 0.6;
    var img_dict = {};
    var classes = [];
    var count_class = {};
    var num_class = 0;

    var output_root = '../' + $('#resultPath').attr('data-value') + '/';
    // var output_root = '../data/outputs/uied/example2/';
    var clip_root = output_root + 'clips/';
    console.log(output_root);

    /* load canvas */
    var canvas_init = function(){
        $.ajaxSettings.async = false;
        $.getJSON(output_root + 'compo.json',function(result){
            let html = "";

            console.log($(window).height());
            console.log(result['compos'][0]['width']*scale);
            console.log(result['compos'][0]['height']*scale);
            console.log($('.box').offset());
            let offset_top = 0;
            let offset_left = 0;
            if (result['compos'][0]['class'] == 'Background'){
                offset_top = Math.round(($(window).height() - result['compos'][0]['height']*scale - $('#board').offset()['top'])/2);
                offset_left = Math.round(($('#board').width() - result['compos'][0]['width']*scale - $('#board').offset()['left'])/2);
                // offset_left = Math.round(($('#board').width() - 270 - $('#board').offset()['left'])/2);
            }


            /* get detection results */
            for (let i = 0; i < result["compos"].length; i++) {
                let c = result["compos"][i]["class"];
                let idx = result["compos"][i]["id"];
                if(c != 'Background'){
                    var clip_path = clip_root + c + "/" +idx+ ".jpg";
                }
                else {
                    var clip_path = clip_root+'bkg.jpg';
                }
                img_dict[c+idx] =result["compos"][i];

                /* add UI kits lists */
                if(c in count_class){
                    count_class[c] = 0;
                    $("#"+c).append('<li class="list-group-item"><img src='+clip_path+'></li>');
                }
                else{
                    $('#menu-uikits').append('<li class="components" data-type="'+ num_class + '"><a href="javascript:void(0)">' + c + '</a></li>')
                    $('.pic').append('<ul id="' + c + '" class="list-group list-group-flush"></ul>');
                    $("#"+c).append('<li class="list-group-item"><img src='+clip_path+'></li>');
                    num_class ++;
                    classes.push(c);
                    count_class[c] ++;
                }

                /* add image on sketch board */
                let height = result["compos"][i]["height"];
                let width = result["compos"][i]["width"];
                let x = result["compos"][i]["row_min"];
                let y = result["compos"][i]["column_min"];
                let id = 'draggable_'+c+'_'+idx;

                // alert($(window).height() - height)

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

    /* sidebar components collection kit */
    var components_init = function(){
        $("#menu-uikits").eq(0).addClass('active-page');
        $(".pic>ul").eq(0).addClass("on");
        $("#name").text(classes[0]);

        $(".components").click(function () {
            $(this).addClass("active-page").siblings().removeClass('active-page');
            $(".pic>ul").removeClass('on').eq($(this).attr('data-type')).addClass("on");
            document.getElementById("name").innerHTML = $(this).text();
        });
    };

    /* component image click function */
    var component_img_init = function(){
        $(".pic li img").click(function(){
            var imgsrc = $(this).attr('src');
            var img_info = img_dict[imgsrc.split('/')[2]+imgsrc.split('/')[3].split('.')[0]];
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
    };


    /* allow tooltip */
	$(function () {
		$('[data-toggle="tooltip"]').tooltip();
    });

    /* right sidebar close click function */
    var sidebar_init = function(){
        $(".right-sidebar-close").click(function () {
            $("#main-right-sidebar").removeClass("visible");
            $("#main-right-sidebar-component").removeClass("visible");
        });
    };

    /* return click function */
    var return_init = function(){
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

    /* delete click function */
    var delete_init = function(){
        $("#delete").click(function () {
            document.getElementsByClassName("box")[0].removeChild(document.getElementsByClassName("active-component")[0]);
            $("#main-right-sidebar").removeClass("visible");
            $("#main-right-sidebar-component").removeClass("visible");
        });
    };

    /* apply click function */
    var apply_init = function(){
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

    /* add image click function */
    // var add_img_init = function(){
    //     $("#add").click(function(){
    //         var type = $('#right-sidebar-type-component').text();
    //         var width = $('#right-sidebar-width-component').val();
    //         var height = $('#right-sidebar-height-component').val();
    //         var top = $('#right-sidebar-top-component').val();
    //         var left = $('#right-sidebar-left-component').val();
    //         if (width == ""){width = $('#right-sidebar-width-component').attr("placeholder");}
    //         if (height == ""){height = $('#right-sidebar-height-component').attr("placeholder");}
    //         if (top == ""){top = $('#right-sidebar-top-component').attr("placeholder");}
    //         if (left == ""){left = $('#right-sidebar-left-component').attr("placeholder");}
    //         $("#right-sidebar-width").val("");
    //         $("#right-sidebar-height").val("");
    //         $("#right-sidebar-top").val("");
    //         $("#right-sidebar-left").val("");
    //         $("#right-sidebar-width").attr("placeholder",width);
    //         $("#right-sidebar-height").attr("placeholder",height);
    //         $("#right-sidebar-top").attr("placeholder",top);
    //         $("#right-sidebar-left").attr("placeholder",left);
    //         document.getElementById("right-sidebar-type").innerHTML = type;
    //         document.getElementById("right-sidebar-img").src = document.getElementById("right-sidebar-img-component").src;
    //         $("#main-right-sidebar").addClass("visible");
    //         $("#main-right-sidebar-component").removeClass("visible");
    //
    //         count_dict[type] ++;
    //         let id = 'draggable_'+type+'_'+count_dict[type];
    //         let html = "";
    //         html += '<div id="'+id+'" class="draggable" style="top:'+top+' px; left: '+left+'px">';
    //         html += '   <div href="javascript:void(0)" class="right-sidebar-toggle" data-sidebar-id="main-right-sidebar">';
    //         html += '	    <img class="image" src="'+document.getElementById("right-sidebar-img-component").src+'" id="'+id+'header" style="height:'+height+'px; width:'+width+'px;">'
    //         html += '   </div>'
		// 	html += '</div>'
    //         $(".box").append(html);
    //
    //         $('#'+id).addClass("active-component").siblings().removeClass('active-component');
    //         drag_and_click(scale);
    //
    //         img_dict[type+count_dict[type]] = {
    //             "column_min": 0,
    //             "id": count_dict[type],
    //             "height": height,
    //             "width": width,
    //             "column_max": 0,
    //             "row_max": 0,
    //             "row_min": 0,
    //             "class": type,
    //         };
    //     });
    // };

    canvas_init()
    components_init()
    sidebar_init()
    return_init()
    delete_init()
    apply_init()
    component_img_init()
    // add_img_init()
    
});


$('#uikits_sidebar').click(function () {
    let kits = $('#show_kits');
    kits.animate({
        width: 'toggle'
    });
});