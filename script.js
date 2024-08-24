const GRID_SIZE = 100;
const CELL_SIZE = 7;
const WINDOW_SIZE = GRID_SIZE * CELL_SIZE;
const PHEROMONE_DECAY = 0.01;
const PHEROMONE_INTENSITY = 255;
const DEFAULT_SPEED = 10;
const REPRODUCTION_INTERVAL = 5000;
let NEW_ANTS_COUNT = 1;

const BACKGROUND_COLOR = '#000000';
const ANT_COLOR = '#FF0000';
const QUEEN_COLOR = '#FFA500';

class Ant {
    constructor(x, y, isQueen = false) {
        this.x = x;
        this.y = y;
        this.isQueen = isQueen;
    }

    move() {
        const directions = [
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 }
        ];
        const { dx, dy } = directions[Math.floor(Math.random() * directions.length)];
        this.x = (this.x + dx + GRID_SIZE) % GRID_SIZE;
        this.y = (this.y + dy + GRID_SIZE) % GRID_SIZE;
    }

    reproduce(ants) {
        if (this.isQueen) {
            for (let i = 0; i < NEW_ANTS_COUNT; i++) {
                const newAntX = (this.x + (Math.random() < 0.5 ? -1 : 1) + GRID_SIZE) % GRID_SIZE;
                const newAntY = (this.y + (Math.random() < 0.5 ? -1 : 1) + GRID_SIZE) % GRID_SIZE;
                ants.push(new Ant(newAntX, newAntY));
            }
        }
    }
}

const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
canvas.width = WINDOW_SIZE;
canvas.height = WINDOW_SIZE;

let pheromoneGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
let ants = [new Ant(Math.floor(GRID_SIZE / 2), Math.floor(GRID_SIZE / 2), true)];
ants.push(new Ant(Math.floor(GRID_SIZE / 2) + 1, Math.floor(GRID_SIZE / 2)));

let running = false;
let speed = DEFAULT_SPEED;
let timePassed = 0;
let lastReproductionTime = Date.now();
let lastUpdateTime = Date.now();

function initializeSimulation() {
    pheromoneGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    ants = [new Ant(Math.floor(GRID_SIZE / 2), Math.floor(GRID_SIZE / 2), true)];
    ants.push(new Ant(Math.floor(GRID_SIZE / 2) + 1, Math.floor(GRID_SIZE / 2)));
    running = false;
    speed = DEFAULT_SPEED;
    timePassed = 0;
    lastReproductionTime = Date.now();
    lastUpdateTime = Date.now();
}

function drawGrid() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const intensity = Math.floor(pheromoneGrid[y][x]);
            ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
}

function drawAnts() {
    for (const ant of ants) {
        ctx.fillStyle = ant.isQueen ? QUEEN_COLOR : ANT_COLOR;
        ctx.fillRect(ant.x * CELL_SIZE, ant.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
}

function update() {
    if (!running) return;

    const currentTime = Date.now();
    const elapsedTime = currentTime - lastUpdateTime;
    lastUpdateTime = currentTime;
    timePassed += elapsedTime * (speed / DEFAULT_SPEED);

    document.getElementById('antCount').innerText = `No. of Ants: ${ants.length}`;
    document.getElementById('timePassed').innerText = `Time Passed: ${(timePassed / 1000).toFixed(1)}s`;

    for (const ant of ants) {
        ant.move();
        pheromoneGrid[ant.y][ant.x] = Math.min(PHEROMONE_INTENSITY, pheromoneGrid[ant.y][ant.x] + PHEROMONE_INTENSITY);
    }

    if (currentTime - lastReproductionTime >= REPRODUCTION_INTERVAL) {
        lastReproductionTime = currentTime;
        for (const ant of ants) {
            ant.reproduce(ants);
        }
    }

    // Decay pheromones
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            pheromoneGrid[y][x] = Math.max(0, pheromoneGrid[y][x] * (1 - PHEROMONE_DECAY));
        }
    }

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    
    if (!document.getElementById('onlyPheromones').checked) {
        drawAnts();
    }

    setTimeout(update, 1000 / speed);
}

document.getElementById('startButton').addEventListener('click', () => {
    running = true;
    update();
});

document.getElementById('stopButton').addEventListener('click', () => {
    running = false;
});

document.getElementById('fastForwardButton').addEventListener('click', () => {
    speed += 5;
});

document.getElementById('resetSpeedButton').addEventListener('click', () => {
    speed = DEFAULT_SPEED;
});

document.getElementById('increaseReproductionButton').addEventListener('click', () => {
    NEW_ANTS_COUNT += 2;
});

document.getElementById('onlyPheromones').addEventListener('change', () => {
    if (!document.getElementById('onlyPheromones').checked) {
        drawAnts();
    }
});

document.getElementById('finalResetButton').addEventListener('click', () => {
    initializeSimulation();
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById('antCount').innerText = `No. of Ants: ${ants.length}`;
    document.getElementById('timePassed').innerText = `Time Passed: ${(timePassed / 1000).toFixed(1)}s`;
});
