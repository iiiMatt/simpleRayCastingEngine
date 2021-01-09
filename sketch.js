let FOV_ANGLE;  // Field of view angle
let NUM_RAYS;  // Number of rays, depends on the width and the WALL_STRIP_WIDTH
let MAP_SCALE;  // Scale of the minimap
let MAP_X;  // Where the minimap is position in the x direction
let MAP_Y;  // Where the minimap is position in the y direction
let MAP_WIDTH;  // minimap width
let MAP_HEIGHT;  // minimap height
let DIST_PROJ_PLANE;  // distance to the projected plane
let WALL_STRIP_WIDTH;  // Width of one wall-strip
let WALL_SIZE;  // How big the walls are. The greater the wall size is the smaller the map looks
let SHOW_MAP;  // if true, then shows the minimap
let MOVEMENT_SPEED;  // How fast the player moves
let TURNING_SPEED;  // How fast the player turns


let pressing;
let pressStart;
let pressEnd;
let Mode;


let particle;
let walls = [];
let points = [];
let removeLine;



function setup() {
    createCanvas(innerWidth, innerHeight);

    // CONSTANTS
    FOV_ANGLE = radians(60);
    WALL_STRIP_WIDTH = 4;
    NUM_RAYS = width / WALL_STRIP_WIDTH;
    MAP_SCALE = 0.4;
    MAP_X = 10;
    MAP_Y = 10;
    MAP_WIDTH = width * MAP_SCALE;
    MAP_HEIGHT = height * MAP_SCALE;
    DIST_PROJ_PLANE = width / 2 / tan(FOV_ANGLE / 2);
    WALL_SIZE = 30;
    SHOW_MAP = true;
    MOVEMENT_SPEED =  2 * MAP_SCALE;
    TURNING_SPEED = 0.03;
    

    pressing = false;
    mode = "line";


    // Walls at the four sides of the minimap
    walls.push(new Wall(MAP_X, MAP_Y, MAP_X, MAP_Y + MAP_HEIGHT, color(200, 150), true));
    walls.push(new Wall(MAP_X, MAP_Y, MAP_X + MAP_WIDTH, MAP_Y, color(200, 150), true));
    walls.push(new Wall(MAP_X, MAP_Y + MAP_HEIGHT, MAP_X + MAP_WIDTH, MAP_Y + MAP_HEIGHT, color(200, 150), true));
    walls.push(new Wall(MAP_X + MAP_WIDTH, MAP_Y, MAP_X + MAP_WIDTH, MAP_Y + MAP_HEIGHT, color(200, 150), true));

    // Creating a particle
    particle = new Particle((MAP_X + MAP_WIDTH) / 2, (MAP_Y + MAP_HEIGHT) / 2, FOV_ANGLE, NUM_RAYS);
}


function update() {

    // Controlling and updating the particles position
    particle.control();
    particle.update();

    // Getting the points where the rays hit walls
    points = particleWalls(particle, walls);

    if (SHOW_MAP) {
        if (pressing) {
            pressEnd = createVector(mouseX, mouseY);
            if (mode == "line") {
                if (pressEnd.x > MAP_X && pressEnd.x < MAP_X + MAP_WIDTH &&
                    pressEnd.y > MAP_Y && pressEnd.y < MAP_Y + MAP_HEIGHT) {
                        walls[walls.length - 1].b = pressEnd;
                }
            } else if (mode == "box") {
                if (pressEnd.x > MAP_X && pressEnd.x < MAP_X + MAP_WIDTH &&
                    pressEnd.y > MAP_Y && pressEnd.y < MAP_Y + MAP_HEIGHT) {
                        walls[walls.length - 1].b.y = pressEnd.y;

                        walls[walls.length - 2].b.x = pressEnd.x;

                        walls[walls.length - 3].a.y = pressEnd.y;
                        walls[walls.length - 3].b = pressEnd;

                        walls[walls.length - 4].a.x = pressEnd.x;
                        walls[walls.length - 4].b = pressEnd;
                }
            } else if (mode == "remove") {
                if (pressEnd.x > MAP_X && pressEnd.x < MAP_X + MAP_WIDTH &&
                    pressEnd.y > MAP_Y && pressEnd.y < MAP_Y + MAP_HEIGHT) {
                        removeLine.b = pressEnd;
                        for (let wall of walls) {
                            if (removeWall(removeLine, wall)) {
                                wall.toRemove = true;
                            } else {
                                wall.toRemove = false;
                            }
                        }
                }
            }
        } else {
            pressStart = null;
            pressEnd = null;
        }
    }
}


function draw() {
    update();
    background(190);
    
    rectMode(CORNER);
    noStroke();
    fill(102, 200, 0);  // Ground
    rect(0, height / 2,  width, height / 2);
    fill(51, 153, 255);  // Sky
    rect(0, 0,  width, height / 2);
    
    fill(255);
    rectMode(CENTER);
    for (let ray of particle.rays) {
        ray.project();
    }
    colorMode(RGB);
    

    // Rendering the map
    if (SHOW_MAP) {
        fill(255)
        noStroke();
        rectMode(CORNER);
        rect(MAP_X, MAP_Y, MAP_WIDTH, MAP_HEIGHT);

        
        strokeWeight(1);
        stroke("crimson");
        for (let pt of points) { // Rendering the rays
            line(particle.pos.x, particle.pos.y, pt.x, pt.y);
        }


        stroke(0);
        strokeWeight(1);
        for (let wall of walls) {  // Rendering the walls
            wall.show();
        }

        particle.show(); // Showing the particle (it's basically just a line)

        if (removeLine) {
            strokeWeight(3);
            stroke(255, 0, 0);
            removeLine.show();
        }
    }
}


// Returns a ray-wall collision point
function rayWall(ray, wall) {

    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = ray.a.x;
    const y3 = ray.a.y;
    const x4 = ray.b.x;
    const y4 = ray.b.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    const t =  ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    if (0 < t && t < 1 && 0 < u) {
        return createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    }
}

// Returns the point of the nearest ray-wall collision point
function rayWalls(ray, walls) {
    let closestPoint = null;
    let closestDist = Infinity;
    for (let wall of walls) {
        let point_ = rayWall(ray, wall);
        if (point_) {
            let dist_ = ray.a.dist(point_);
            if (dist_ < closestDist) {
                closestDist = dist_;
                closestPoint = point_;

                // Passing in the walls attributes into the ray
                ray.angleOfWall = wall.angle;
                ray.wallColor = wall.wallColor;
                ray.side = wall.side;
                ray.wallSize = wall.wallSize;
            }
        }
    }
    ray.distance = closestDist / MAP_SCALE;
    return closestPoint;
}


// Returns all the points where a ray hits a wall
function particleWalls(particle, walls) {
    const points = [];
    for (let ray of particle.rays) {
        const pt = rayWalls(ray, walls);
        if (pt) {
            points.push(pt);
        }
    }
    return points;
}


if (SHOW_MAP) {
    function mousePressed() {
        pressing = true;
        pressStart = createVector(mouseX, mouseY);
        if (pressStart.x > MAP_X && pressStart.x < MAP_X + MAP_WIDTH &&
            pressStart.y > MAP_Y && pressStart.y < MAP_Y + MAP_HEIGHT) {
                if (mode == "line") {
                    walls.push(new Wall(pressStart.x, pressStart.y, pressStart.x, pressStart.y));
                } else if (mode == "box") {
                    walls.push(new Wall(pressStart.x, pressStart.y, pressStart.x, pressStart.y));
                    walls.push(new Wall(pressStart.x, pressStart.y, pressStart.x, pressStart.y));
                    walls.push(new Wall(pressStart.x, pressStart.y, pressStart.x, pressStart.y));
                    walls.push(new Wall(pressStart.x, pressStart.y, pressStart.x, pressStart.y));
                } else if (mode == "remove") {
                    removeLine = new Wall(pressStart.x, pressStart.y, pressStart.x, pressStart.y);
                }
        } else {
            pressing = false;
        }

    }
    
    
    function mouseReleased() {
        pressing = false;
        removeLine = false;
        for (let i = walls.length - 1; i > -1; i--) {
            if (walls[i].toRemove) {
                walls.splice(i, 1)
            }
        }
    }


    function keyPressed() {
        if (key == "m") {
            SHOW_MAP = !SHOW_MAP;
        }

        if (key == "c") {
            walls = [];
            walls.push(new Wall(MAP_X, MAP_Y, MAP_X, MAP_Y + MAP_HEIGHT, color(200, 150), true));
            walls.push(new Wall(MAP_X, MAP_Y, MAP_X + MAP_WIDTH, MAP_Y, color(200, 150), true));
            walls.push(new Wall(MAP_X, MAP_Y + MAP_HEIGHT, MAP_X + MAP_WIDTH, MAP_Y + MAP_HEIGHT, color(200, 150), true));
            walls.push(new Wall(MAP_X + MAP_WIDTH, MAP_Y, MAP_X + MAP_WIDTH, MAP_Y + MAP_HEIGHT, color(200, 150), true));
        }

        if (key == "l") {
            mode = "line";
        } else if (key == "b") {
            mode = "box";
        } else if (key == "r") {
            mode = "remove"
        }
    }
}

function removeWall(removeLine, wall) {

    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = removeLine.a.x;
    const y3 = removeLine.a.y;
    const x4 = removeLine.b.x;
    const y4 = removeLine.b.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    const t =  ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    if (0 < t && t < 1 && 0 < u && u < 1) {
        return createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    }
}