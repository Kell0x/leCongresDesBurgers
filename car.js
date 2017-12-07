function car (position, direction) {

    var MAX_LINEAR_VELOCITY = 5;
    var ACCELERATION_FORWARD = 0.3;
    var ACCELERATION_BACK = 0.05;
    var DIRECTION_CHANGE = 0.06;
    var SIDESLIP = 0;
    var SMOOTHING = -0.05;
    var RESISTANSE = 1;

    this.demage = false;
    this.position = position;
    this.moveDirection = 0;
    this.carDirection = direction;
    this.linearVelocity = [0, 0];
    this.angularVelocity = 0;
    this.acceleration = [0];

    this.me = this;
    this.carControl = function() {
        forward = function () {return this.forward.call(this.me)};
        neutral = function () {return this.neutral.call(this.me)};
        back = function () {return this.back.call(this.me)};
        turnLeft = function () {return this.turnLeft.call(this.me)};
        turnRight = function () {return this.turnRight.call(this.me)};
    }

    this.forward = function () {
        this.acceleration = [ACCELERATION_FORWARD * Math.sin(this.carDirection),
                             -ACCELERATION_FORWARD * Math.cos(this.carDirection)];
    }

    this.neutral = function () {
        this.acceleration = [0, 0];
    }

    this.back = function () {
        this.acceleration = [-ACCELERATION_BACK * Math.sin(this.carDirection), 
                             ACCELERATION_BACK * Math.cos(this.carDirection)];
    }

    this.turnLeft = function () {
        this.carDirection = 
            normalizeAngle (this.carDirection - DIRECTION_CHANGE);
    }

    this.turnRight = function () {
        this.carDirection = 
            normalizeAngle (this.carDirection + DIRECTION_CHANGE);

    }

    function normalizeAngle(angle) {
        if (angle > Math.PI) {
            return angle - 2 * Math.PI;
        } else 
        if (angle < - Math.PI) {
            return angle + 2 * Math.PI;
        }
        return angle;
    }

    this.update = function () {
        this.updateDirection();
        this.updatePosition();
        this.velocityByDirectionCorrection();
    }

    this.updateDirection = function () {
        this.linearVelocity = [(this.linearVelocity[0] + this.acceleration[0]) * RESISTANSE , 
                               (this.linearVelocity[1] + this.acceleration[1]) * RESISTANSE];
        this.linearVelocity[0] = limitModulus(this.linearVelocity[0], MAX_LINEAR_VELOCITY);
        this.linearVelocity[1] = limitModulus(this.linearVelocity[1], MAX_LINEAR_VELOCITY);
    }

    function limitModulus(value, limit) {
        if (value > MAX_LINEAR_VELOCITY) {
            return MAX_LINEAR_VELOCITY;
        } else if (value < - MAX_LINEAR_VELOCITY) {
            return - MAX_LINEAR_VELOCITY;
        }
        return value;
    }

    this.updatePosition = function () {
        this.position[0] = this.position[0] + this.linearVelocity[0];
        this.position[1] = this.position[1] + this.linearVelocity[1];
    }

    this.velocityByDirectionCorrection = function () {
        var velocityDirection = this.getVelocityDirection();
        var sideslipAngle = normalizeAngle(velocityDirection - this.carDirection);
        this.linearVelocity = rotate (this.linearVelocity, sideslipAngle * SMOOTHING);
    }

    this.getVelocityDirection = function (){
        return Math.atan2(this.linearVelocity[1], this.linearVelocity[0]) + Math.PI / 2;
    }

    function rotate (position, angle) {
        return [
                position[0] * Math.cos(angle) - position[1] * Math.sin(angle),
                position[0] * Math.sin(angle) + position[1] * Math.cos(angle)
        ];  
    }

}