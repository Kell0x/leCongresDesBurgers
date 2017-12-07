function resultScreen (context) {

	var context = context;
	this.isOver = false;
	this.winner = null;

	this.gameOver = function (carId) {
		this.winner = carId;
		this.isOver = true;
	}

	this.drow = function () {
		if (this.isOver) {
			context.fillStyle ="#222";
			context.font = "50pt Arial";
			context.fillText ("Pilot " + this.winner + " wins!", 250, 290)
		}
	}
}