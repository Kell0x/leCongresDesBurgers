function raceStatistic (carNumber, lines, laps, gameOver) {

	this.carNumber = carNumber;
	this.cars = carSet(carNumber, gameOver);
	this.lines = lines; //number of lines in lap
	this.laps = laps; //number of laps in race
	this.generalTimeString = "00:00.00";
	this.generalTime = 0;
	this.lastTime;
	this.bestLap = [0, 0];
	this.pause = false;

	function carSet(carNumber) {
		statisticList = [];
		for (var i = 0; i < carNumber; i++) {
			statisticList[i] = new statistic(lines, i, laps, gameOver);
		}
		return statisticList;
	}

	this.findBestLap = function () {
		for (var i in statisticList) {
			for (var j = 0; j < statisticList[i].lapsTime.length - 1; j++) {
				bestTime = statisticList[this.bestLap[0]].lapsTime[this.bestLap[1]][1];
				if (statisticList[i].lapsTime[j][1] < bestTime) {
					this.bestLap = [i, j];
				}
			}
		}
	}

	this.startRace = function () {
		this.lastTime = new Date();
		this.bestLap = [0, 0];
		this.pause = false;
		this.generalTime = 0;
		this.cars = carSet(this.carNumber);
	}

	this.carInLine = function (car, line) {
		this.findBestLap();
		this.cars[car].inLine(line);
		if (!this.pause) {
			this.generalTime += new Date() - this.lastTime;
		}
		this.lastTime = new Date();
		this.generalTimeString = millisecondsToMinutes(this.generalTime);
	}

	this.changePause = function () {
		for (var i in this.cars) {
			this.cars[i].changePause();
		}
		this.pause = !this.pause;
	}
}

function statistic (lines, carNumber, laps, gameOver) {

	this.laps = laps;
	var lap = -1;
	var lastLine = -1;
	this.makeLaps = 0;
	this.lapsTime = [];
	var lapTime;
	this.lastTime;
	var beginRaceTime;
	var lines = lines;
	this.pause = false;
	this.gameOver = gameOver;
	this.carNumber = carNumber;

	this.inLine = function (line) {
		if (line == 0) {
			if (lastLine == -1) {
				this.startLap ();
				lastLine = 0;
				lap = 0;
			} else if (lastLine == lines - 1) {
				this.endLap();
				lastLine = 0;
			}
		} else if (line == lastLine + 1) {
			lastLine = lastLine + 1;
		}
		this.updateTimer();
	}

	this.startLap = function() {
		beginLapTime = new Date();
		this.lapTime = 0;
		this.lastTime = new Date();
	}

	this.endLap = function () {
		this.updateLapCounter();
		this.checkGameOver();
	}

	this.updateLapCounter = function () {
		this.lapTime = 0;
		beginLapTime = new Date();
		lap++;
	}

	this.checkGameOver = function() {
		if (lap == this.laps) {
			this.gameOver(carNumber);
		}
	}

	this.updateTimer = function() {
		if (lap == -1) {
			this.lapsTime[0] = [millisecondsToMinutes (0), 0];
			return
		}
		if (!this.pause) {
			this.lapTime += new Date() - this.lastTime;
		}
		this.lastTime = new Date();
		this.lapsTime[lap] = [millisecondsToMinutes (this.lapTime), this.lapTime];
	}

	this.changePause = function () {
		this.pause = !this.pause;
	}
}

function millisecondsToMinutes (time) {
	var minutes = ~~(time / 1000 / 60);
	var seconds = ((time / 1000) - minutes * 60).toFixed(2);
	return doubleDigits(minutes) + ":" + doubleDigits(seconds);
}

function doubleDigits (number) {
	if (number < 10) {
		return "0" + number;
	}
	return number;
}
