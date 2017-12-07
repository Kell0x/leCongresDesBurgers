function panel (statisticSet, canvas) {
	var statisticSet = statisticSet;
	var canvas = canvas;
	var canvasWidth = canvas.canvas.clientWidth;
	var canvasHeight = canvas.canvas.clientHeight;
	var pauseLabel = "  PAUSE";

	this.draw = function () {
		canvas.save();
		canvas.fillStyle = "#444";
		canvas.translate (canvasWidth - 200, 0);
		canvas.fillRect(0, 0, 200, canvasHeight);
		drawBorder();
		drawTimer();
		drawGameControl();
		canvas.restore();
	}

	function drawBorder () {
		canvas.beginPath();
		canvas.lineWidth = 10;
		canvas.strokeStyle = "#222";
		canvas.moveTo(0, 0);
		canvas.lineTo(0, canvasHeight);
		canvas.stroke();
	}

	function drawTimer() {
		canvas.font = "14pt Arial";
		canvas.fillStyle = "#888";
		canvas.fillRect(10, 10, 180, 203);
		drawTimerGrid();
		drawPilotNames();
		canvas.fillStyle = "#f00";
		for (var i in statisticSet.cars) {
			for (var j in statisticSet.cars[i].lapsTime) {
				if (j == statisticSet.cars[i].lapsTime.length - 1) {
					canvas.fillStyle = "#a00";
				} else if (statisticSet.bestLap[0] == i && statisticSet.bestLap[1] == j) {
					canvas.fillStyle = "#080";
				} else {
					canvas.fillStyle = "#000";
				}
				if (j < statisticSet.laps) {
					canvas.fillText(statisticSet.cars[i].lapsTime[j][0], 32 + i * 80, 50 + j * 20);
				}
			}
		}
		drawGeneralTimer();
	}

	function drawTimerGrid() {
		canvas.beginPath ();
		canvas.strokeStyle = "#000";
		canvas.lineWidth = 1;
		canvas.moveTo (10, 33);
		canvas.lineTo (190, 33);
		canvas.moveTo (30, 10);
		canvas.lineTo (30, 213);
		canvas.moveTo (110, 10);
		canvas.lineTo (110, 213);
		canvas.stroke ();
		drawLapNumbers ();
	}

	function drawPilotNames() {
		canvas.fillText("F. Massa", 30, 27);
		canvas.fillText("S. Vettel", 115, 27);
	}

	function drawLapNumbers () {
		canvas.fillStyle = "#222";
		for (var i = 0; i < statisticSet.laps; i++) {
			canvas.fillText(i, 15, 50 + i * 20);
		}
	}

	function drawGeneralTimer () {
		drawGeneralTimerArea();
		showGeneralTimer();
	}

	function drawGeneralTimerArea () {
		canvas.fillStyle ="#222"
		canvas.fillRect(37, 227, 126, 46);
		canvas.fillStyle ="#bbb"
		canvas.fillRect(40, 230, 120, 40);
	}

	function showGeneralTimer() {
		canvas.fillStyle ="#222"
		canvas.font = "20pt Arial";
		canvas.fillText (statisticSet.generalTimeString, 45, 260)
	}

	function drawGameControl () {
		//hollywoodCheck ();
		newGame ();
		pauseView ();
	}

	//function hollywoodCheck () {
	//	canvas.fillStyle ="#222"
	//	canvas.fillRect(32, 396, 16, 16);
	//	canvas.fillStyle ="#bbb"
	//	canvas.fillRect(34, 398, 12, 12);
	//	if (hollywood) {
	//		canvas.beginPath ();
	//		canvas.strokeStyle = "#222";
	//		canvas.lineWidth = 2;
	//		canvas.moveTo (35, 399);
	//		canvas.lineTo (45, 409);
	//		canvas.moveTo (35, 409);
	//		canvas.lineTo (45, 399);
	//		canvas.stroke ();
	//	}
	//	canvas.fillStyle ="#080"
	//	canvas.font = "13pt Arial";
	//	canvas.fillText("HOLLYWOOD", 60, 410);
	//	canvas.fillText("MODE", 60, 429);
	//}

	function newGame() {
		canvas.fillStyle ="#222"
		canvas.fillRect(32, 447, 136, 46);
		canvas.fillStyle ="#bbb"
		canvas.fillRect(35, 450, 130, 40);
		canvas.fillStyle ="#222"
		canvas.font = "20pt Arial";
		canvas.fillText("START", 50, 480);
	}

	function pauseView () {
		canvas.fillStyle ="#222"
		canvas.fillRect(32, 527, 136, 46);
		canvas.fillStyle ="#bbb"
		canvas.fillRect(35, 530, 130, 40);
		canvas.fillStyle ="#222"
		canvas.font = "20pt Arial";
		canvas.fillText(pauseLabel, 40, 560);
	}

	this.pauseClick = function () {
		this.pauseAction();
		this.pauseDraw();
	}

	this.pauseAction = function () {
		statisticSet.changePause();
	}

	this.pauseDraw = function () {
		if (!pause) {
			pauseLabel = "RESUME";
		} else {
			pauseLabel = "  PAUSE";
		}
	}

}



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


(function(){
 	hollywoodButton();
 	startButton();
 	pauseButton()
})();

function pauseButton () {
	var start = [1000 - 168, 527];
	var size = [136, 46];
	action = {
		onClick : pauseClick
	};
	addButton(start, size, action);
}

function pauseClick () {
	leftPanel.pauseClick();
	gameChangePause();
}

function startButton () {
	var start = [1000 - 168, 447];
	var size = [136, 46];
	action = {
		onClick : function () {startRace()}
	};
	addButton(start, size, action);
}

function hollywoodButton () {
	var start = [1000 -168, 396];
	var size = [16, 16];
	action = {
		onClick : function () {hollywoodMdoe()}
	};
	addButton(start, size, action);
}
