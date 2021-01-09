class Ray {
    constructor(x, y, angle, id, parentAngle) {
        this.angle = angle;
        this.id = id;

        this.a = createVector(x, y);
        this.b = createVector(x + cos(angle), y + sin(angle));

        this.distance = null;
        this.parentAngle = parentAngle;
        this.angleOfWall;
        this.wallColor;
        this.side;
        this.wallSize;
    }

    update(x, y, angle, parentAngle) {
        this.angle = angle;
        this.parentAngle = parentAngle;
        this.a = createVector(x, y);
        this.b = createVector(x + cos(angle), y + sin(angle));
    }

    project() {
        if (this.side) {
            colorMode(RGB);
            fill(this.wallColor);
        } else {
            colorMode(HSB);
            fill(this.wallColor, 100, map(sqrt(this.distance) * 25, 0, 200, 100, 80));
        }
        const wallStripHeight = (this.wallSize / this.distance) * DIST_PROJ_PLANE;
        rect(WALL_STRIP_WIDTH * this.id + WALL_STRIP_WIDTH / 2, height / 2, WALL_STRIP_WIDTH, wallStripHeight);
    }
}