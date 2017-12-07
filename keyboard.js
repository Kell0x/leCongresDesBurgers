pressedKeys = [];

function keyUp(key) {
    pressedKeys[key] = false;
}

function keyDown(key) {
    pressedKeys[key] = true;
}

function blur() {
	pressedKeys = [];
}

function carDrive(car, keySet) {
	this.car = car;
	var keySet = keySet;

	this.action = function() {
		pressedKeys[keySet.left]
	}

	this.action = function() {
		//alert ("ff");
		if (car.demage) {
			return;
		}
	    if (pressedKeys[keySet.up] || pressedKeys[keySet.down]) {
	        if (pressedKeys[keySet.up]) {
	            this.car.forward();
	        }
	        if (pressedKeys[keySet.down]) {
	            this.car.back()
	        }
	    } else {
	        this.car.neutral();
	    }
	    if (pressedKeys[keySet.left]) {
	            this.car.turnLeft();
	    }
	    if (pressedKeys[keySet.right]) {
	        this.car.turnRight()
	    }
	    this.car.update();
	}

}

controlKeys = {
	AWDS : {
		left : 81,
		up : 90,
		right : 68,
		down : 83
	},
	Arrows : {
		left : 37,
		up : 38,
		right : 39,
		down : 40
	}

}
