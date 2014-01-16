'use strict';

(function($){
	$.fn.searchEmptyArea = function(width, height) {
		var $area = $(this);
		var step = 10;
		var maxX = $area.width() / step;
		var maxY = $area.height() / step;
		var w = Math.ceil(width / step);
		var h = Math.ceil(height / step);
		var map = [];
		for (var x = 0; x < maxX; x++) {
			map[x] = [];
			for (var y = 0; y < maxY; y++) {
				map[x][y] = 0;
			}
		}
		$area.find('.diagram-elem').each(function(key, table){
			var table = $(table);
			var left = Math.floor(table.position().left / step);
			var top = Math.floor(table.position().top / step);
			var right = Math.ceil((table.position().left+ table.outerWidth()) / step);
			var bottom = Math.ceil((table.position().top + table.outerHeight()) / step);

			for (var x = Math.max(left - Math.ceil(width / step), 0); x < right; x++) {
				for (var y = Math.max(top - Math.ceil(height / step), 0); y < bottom; y++) {
					map[x][y]++;
				}
			}
		});

		for (var pos = 0; ; pos++) {
			if (pos <= maxY) {
				for (var y = 0; y < pos; y++) {
					if (map[pos][y] === 0) {
						return {x: pos*step, y: y*step};
					}
				}
			}
			if (pos <= maxX) {
				for (var x = 0; x <= pos; x++) {
					if (map[x][pos] === 0) {
						return {x: x*step, y: pos*step};
					}
				}
			}
			if (pos > maxX && pos > maxY) {
				break;
			}
		}
		return {x: 0, y: 0};
	};

})(jQuery);
