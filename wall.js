class Wall {
    constructor(x1, y1, x2, y2, wallColor = random(360), side = false) {
        this.a = createVector(x1, y1);
        this.b = createVector(x2, y2);
        this.angle = this.a.angleBetween(this.b);
        this.wallColor = wallColor;
        this.side = side;
        this.toRemove = false;
        this.wallSize = 30;
    }

    show() {
        line(this.a.x, this.a.y, this.b.x, this.b.y);
    }
}