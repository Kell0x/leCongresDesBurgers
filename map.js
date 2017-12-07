function map (traceMap) {

	var trace = precomputingTrace(traceMap);
	this.lines = trace.length;
	this.cars = traceMap.cars;
	this.trace = traceMap;

	function precomputingTrace(traceMap) {
		var trace = [];
		for (var i = 1; i < traceMap.path.length; i++) {
			trace.push (area (traceMap.path[i - 1], traceMap.path[i]));
		}
		trace.push (area (traceMap.path[traceMap.path.length - 1],
			              traceMap.path[0]));
		return trace;
	}

	function area (begin, end) {
		var angle = Math.atan2 (end[1] - begin[1], end[0] - begin[0]);
		return {
			begin : [begin[0], begin[1]],
			end : [end[0], end[1]],
			angle : angle,
			sin : Math.sin (angle),
			cos : Math.cos (angle),
			radius : begin[2],
			sqrRadius : Math.pow (begin[2], 2),
			length : Math.sqrt (Math.pow (end[1] - begin[1], 2) +
				                Math.pow (end[0] - begin[0], 2))
		}
	}

	this.checkBorder = function (car) {
		var line = checkTrace(car);
		if (line == -1) {
			if (hollywood) {
				beginExplosion(car);
			}
	        car.linearVelocity[0] = 0;
	        car.acceleration[0] = 0;
	        car.linearVelocity[1] = 0;
	        car.acceleration[1] = 0;
	    }
	    return line;
	}

	function checkTrace(car) {
		for (var i in trace) {
			if (checkLine (i, car.position)) {
				return i;
			}
		}
		return -1;
	}

	function checkLine (lineIndex, position) {
		var modernPosition = turnAndTranslate(lineIndex, position);
		if (inRectangle (lineIndex, modernPosition) || inCircle (lineIndex, modernPosition)) {
			return true;
		}
		return false;
	}

	function inRectangle (lineIndex, position) {
		if (Math.abs (position[1]) < trace[lineIndex].radius &&
			position[0] > 0 && position[0] < trace[lineIndex].length) {
			return true;
		}
		return false;
	}

	function inCircle (lineIndex, position) {
		var sqrRadiusBegin = Math.pow (position[0], 2) + Math.pow (position[1], 2);
		var sqrRadiusEnd = Math.pow (position[1], 2) + Math.pow (position[0] - trace[lineIndex].length, 2);
		if ((lineIndex > 0 && sqrRadiusBegin < trace[lineIndex].sqrRadius) ||
			sqrRadiusEnd < trace[lineIndex].sqrRadius) {
			return true;
		}
		return false;
	}

	function turnAndTranslate(lineIndex, position) {
		return [
			trace[lineIndex].cos * (position[0] - trace[lineIndex].begin[0]) + trace[lineIndex].sin * (position[1] - trace[lineIndex].begin[1]),
			trace[lineIndex].sin * (- position[0] + trace[lineIndex].begin[0]) + trace[lineIndex].cos * (position[1] - trace[lineIndex].begin[1])
		];
	}

	this.draw = function (canvas) {
		drawBackground(canvas);
		drawBorder(canvas);
		drawTrack(canvas);
		drawDemarcation(canvas);
		drawFinish(canvas);
		drawTrees(canvas, this.trace.trees);
	}

	function drawBackground (canvas) {
		canvas.fillStyle = "#34a212";
		canvas.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	function drawBorder(canvas) {
		canvas.fillStyle = "#AAA";
		drawPath(canvas, 10)
	}

	function drawTrack(canvas) {
		canvas.fillStyle = "#373737";
		drawPath(canvas, 0);
	}

	function drawPath(canvas, width) {
		for (var i = 0; i < trace.length; i++) {
			canvas.save();
			canvas.translate (trace[i].begin[0], trace[i].begin[1]);
			canvas.rotate (trace[i].angle);
			drowCircle (canvas, 0, 0, trace[i].radius + width);
			drowCircle (canvas, trace[i].length, 0, trace[i].radius + width);
			canvas.fillRect (0, - trace[i].radius - width,
				             trace[i].length, 2 * (trace[i].radius + width));
			canvas.restore();
		}
	}

	function drawDemarcation(canvas) {
		canvas.fillStyle = "#EEE";
		var residue = 0;
		for (var i = 0; i < trace.length; i++) {
			canvas.save();
			canvas.translate (trace[i].begin[0], trace[i].begin[1]);
			canvas.rotate (trace[i].angle);
			residue = leaderCharacters(canvas, trace[i].length, residue)
			canvas.restore();
		}
	}

	function leaderCharacters(canvas, length, residue) {
		//drowCircle (canvas, 0, 0, 3);
		//drowCircle (canvas, trace[i].length, 0, 3);
		var strokeFill = 80;
		var strokePeriod = 140;
		var stroke = firstStroke(strokeFill, residue);
		while (stroke['finish'] < length) {
			canvas.fillRect (stroke.start, 2, stroke.finish - stroke.start, -4);
			stroke['start'] = stroke['finish'] + strokePeriod - strokeFill;
			stroke['finish'] += strokePeriod;
		}
		if (stroke['start'] < length) {
			canvas.fillRect (stroke.start, 2, length - stroke.start, -4);
			drowCircle (canvas, length, 0, 2);
		}
		return stroke['start'] - length;
	}

	function firstStroke(length, residue) {
		var start = 0;
		if (residue > 0) {
			start = residue;
			finish = length + residue;
		} else {
			finish = length + residue;
		}
		return {'start': start, 'finish': finish};
	}

	function drawFinish (canvas) {
		canvas.save();
		canvas.translate (trace[0].begin[0], trace[0].begin[1]);
		canvas.rotate (trace[0].angle);
		canvas.fillStyle = "#FFF";
		canvas.fillRect(0,  - trace[0].radius, 5, 2 * trace[0].radius);
		canvas.fillStyle = "#000";
		canvas.fillRect(5,  - trace[0].radius, 3, 2 * trace[0].radius);
		canvas.restore();
	}

	function drowCircle(canvas, x, y, radius) {
		canvas.beginPath();
		canvas.arc(x, y, radius, 0, Math.PI*2, false);
		canvas.closePath();
		canvas.fill();
	}

	function drawTrees(canvas, trees) {
		for (var i in trees) {
			drawTree(canvas, trees[i]);
		}
	}

	function drawTree(canvas, tree) {
		canvas.drawImage(treeImg, tree[0], tree[1]);
	}
}

Level1 = {
	path : [
		[230, 84, 60],
		[650, 100, 60],
		[700, 400, 60],
		[450, 500, 60],
		[500, 300, 60],
		[250, 230, 60],
		[250, 500, 60],
		[80, 500, 30],
		[80, 80, 60],
	],
	trees : [
	],

	cars : function () {
		return [
			new car ([200, 100], Math.PI / 2),
			new car ([200, 50], Math.PI / 2)
		]
	}


}
