
function addButton (start, size, action) {
	buttons.push({
		 start : start, 
		 size : size, 
		 action : action});
}

buttons =[];

function mouseClick (event) {
	buttonClick(event.offsetX, event.offsetY);
}

function buttonClick (x, y) {
	for (var i in buttons) {
		var start = buttons[i].start;
		var size = buttons[i].size;
		if (x > start[0] && x < start[0] + size[0]) {
			if (y > start[1] && y < start[1] + size[1]) {
				buttons[i].action.onClick();
			}
		}
	}
}