/*!

Flexible Bootstrap Carousel v0.4

Copyright (c) 2017 Dan Dev

Released under the MIT license
https://github.com/DanDevG/flexible-bootstrap-carousel/master/LICENSE.md

*/





/* global $ */
/* global CustomEvent */

$(window).load(function() {
	$(".carousel").on("aCarouselHasBeenAdjusted", function() {
		// do something
	});
	
	adjustAllCarousels();
	
	$(window).resize(function() {
		adjustAllCarousels();
	});
});

function adjustAllCarousels() {
	$(".carousel.flexible").each(function() {
		var items = 0;
		
		$(this).find(".img-responsive").each(function() {
			items++;
		});
		
		var item_width = ($(window).width() > 991 && $(window).width() < 1200) ? 300 : 319; 
		
		adjustCarousel($(this), items, item_width);
	});
}

function adjustCarousel(carousel, num_of_items, item_width) {
	var carousel_width = $("#quickstart-modal").width();
	var columns_in_item = Math.floor(carousel_width / item_width);
	
	if (columns_in_item > 3)
	{
		columns_in_item = 3;
	}
	else if (columns_in_item < 1)
	{
		columns_in_item = 1;
	}
	
	var number_of_items = Math.ceil(num_of_items / columns_in_item);
	var $items = $(carousel).find(".img-responsive");
	var length_of_$items = $items.length;
	
	$(carousel).find(".carousel-inner").html("");
	
	var current_item = 0;
	var number_of_columns = String(Math.round(12 / columns_in_item));
	
	for (var i = 0; i < number_of_items; i++)
	{
		var item = "<div class='item'><div class='row'>";
		
		var j = 0;
		
		for ( ; j < columns_in_item; j++)
		{
			var item_body = (current_item <= length_of_$items - 1) ? $($items[current_item]).clone().wrap("<p>").parent().html() : "";
			item += "<div class='col-xs-" + number_of_columns + "'>" + item_body + "</div>";
			
			current_item++;
		}
		
		item += "</div></div>";
		
		$(carousel).find(".carousel-inner").append(item);
		
		if (i == 0)
		{
			$(carousel).find(".carousel-inner .item").addClass("active");
		}
	}
	
	alignItemsInsideACarousel();
	
	var theCarousel = document.getElementById($(carousel).attr("id"));
	theCarouselHasBeenAdjusted(theCarousel);
}

function alignItemsInsideACarousel() {
	$(".carousel").each(function() {
		$(this).find(".carousel-inner .item").each(function() {
			var $items = $(this).children(".row").children("[class^='col-xs']");
			
			var number_of_items = $items.length;
		
			switch (number_of_items) {
				case 1:
					$items.eq(0).addClass("center");
					break;
				case 2:
					$items.eq(0).addClass("left");
					$items.eq(1).addClass("right");
					break;
				case 3:
					$items.eq(0).addClass("left");
					$items.eq(1).addClass("center");
					$items.eq(2).addClass("right");
			}
		});
		
	});
}

function theCarouselHasBeenAdjusted(carousel) {
	var evt = new CustomEvent("aCarouselHasBeenAdjusted", {});
	
	carousel.dispatchEvent(evt);
}