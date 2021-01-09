class Particle {
    constructor(x, y, fovangle, numrays) {
        this.pos = createVector(x, y);
        this.heading = 0;

        this.speed = 0;
        this.turnspeed = 0;

        this.SPEED = MOVEMENT_SPEED;
        this.TURNSPEED = TURNING_SPEED;

        this.dir = 0;  // PI / 2 or -PI / 2 so left or right
        this.mdir = 1;  // move direction
        this.tdir = 1;  // turn direction


        this.fovangle = fovangle;
        this.numrays = numrays;
        this.rayDensity = fovangle / numrays;

        this.rays = [];
        for (let i = 0; i < numrays; i++) {
            const rayAngle = (this.heading - fovangle / 2) + (this.rayDensity * i);
            const ray = new Ray(x, y, rayAngle, i);
            this.rays.push(ray);
        }
    }

    control() {
        if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
            this.mdir = 1;
            this.speed = this.SPEED;
        } else if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
            this.mdir = -1
            this.speed = this.SPEED;
        } else {
            this.speed = 0;
            this.mdir = 1;
        }

        if (keyIsDown(LEFT_ARROW)) {
            this.tdir = -1;
            this.turnspeed = this.TURNSPEED;
        } else if (keyIsDown(RIGHT_ARROW)) {
            this.tdir = 1;
            this.turnspeed = this.TURNSPEED;
        } else {
            this.turnspeed = 0;
        }

        if (keyIsDown(65)) {  // Left
            if (this.speed) {
                this.dir = this.mdir > 0 ? -PI / 2 + PI / 4 : 
                                           -PI / 2 + PI * 3 / 4;
            } else {
                this.dir = -PI / 2;
            }
            this.speed = this.SPEED;
        } else if (keyIsDown(68)) {  // Right
            if (this.speed) {
                this.dir = this.mdir > 0 ? PI / 2 - PI / 4 : 
                                           PI / 2 - PI * 3 / 4;
            } else {
                this.dir = PI / 2;
            }
            this.speed = this.SPEED;
        } else {
            this.dir = 0;
        }
    }

    update() {
        this.heading += this.turnspeed * this.tdir;
        // this.heading = this.heading % TWO_PI;
        // if (this.heading < 0) {
        //     this.heading += TWO_PI;
        // }
        const nextPos = this.pos.copy().add(p5.Vector.fromAngle(this.heading + this.dir).mult(this.speed * this.mdir));
        const pt = rayWalls({a: this.pos, b: nextPos}, walls);
        if (pt) {
            if (pt.dist(nextPos) > 4 * MAP_SCALE) {
                this.pos = nextPos;
            }
        } else {
            this.pos = nextPos;
        }

        this.rays.forEach((ray, index) => {
            const rayAngle = (this.heading - this.fovangle / 2) + (this.rayDensity * index);
            ray.update(this.pos.x, this.pos.y, rayAngle, this.heading);
        })
    }

    show() {
        for (let ray of this.rays) {
            line(ray.a.x, ray.a.y, ray.b.x, ray.b.y);
        }
        stroke(0, 100, 0);
        strokeWeight(2);
        line(this.pos.x, this.pos.y, this.pos.x + cos(this.heading) * 20, this.pos.y + sin(this.heading) * 20);
    }
}