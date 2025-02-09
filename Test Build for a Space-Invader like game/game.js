// Preload player and alien images
const playerImage = new Image();
const alienImages = [
    'images/alienGreen.png',
    'images/alienRed.png',
    'images/alienYellow.png',
    'images/alienExtra.png'
];

let loadedImages = 0;
const alienImageObjects = alienImages.map(src => {
    const img = new Image();
    img.src = src;
    img.onload = checkImagesLoaded;
    return img;
});

playerImage.src = 'images/player.png';
playerImage.onload = checkImagesLoaded;

let imagesLoaded = false;

function checkImagesLoaded() {
    loadedImages++;
    if (loadedImages === alienImageObjects.length + 1) { // +1 for the player image
        imagesLoaded = true;
        startGame(); // Start the game once all images are loaded
    }
}

// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set the canvas size
canvas.width = 800;
canvas.height = 600;

// Game variables
let playerX = canvas.width / 2 - 25;
let playerY = canvas.height - 40;
const playerWidth = 50;
const playerHeight = 30;
const playerSpeed = 7;
const bulletSpeed = 5;
let bullets = [];
let aliens = [];
let score = 0;
let level = 1;
let alienSpeed = 1;
let alienMoveInterval = 1000;
let alienMoveTimer = alienMoveInterval;

// Key press states
let leftArrowPressed = false;
let rightArrowPressed = false;
let spacePressed = false;

// Sounds
const shootSound = new Audio('sounds/shoot.mp3');
const alienHitSound = new Audio('sounds/alienHit.mp3');
const gameOverSound = new Audio('sounds/gameOver.mp3');
const levelUpSound = new Audio('sounds/levelUp.mp3');

// Handle audio loading errors
shootSound.addEventListener('error', (err) => { console.error('Error loading shoot sound:', err); });
alienHitSound.addEventListener('error', (err) => { console.error('Error loading alien hit sound:', err); });
gameOverSound.addEventListener('error', (err) => { console.error('Error loading game over sound:', err); });
levelUpSound.addEventListener('error', (err) => { console.error('Error loading level up sound:', err); });

// Player class
class Player {
    draw() {
        ctx.drawImage(playerImage, playerX, playerY, playerWidth, playerHeight);
    }
}

// Bullet class
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
    }

    draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move() {
        this.y -= bulletSpeed;
    }
}

// Alien class
class Alien {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.direction = 1;
        this.moveDown = false;
        this.image = image; // Use specific alien image
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    move() {
        if (this.moveDown) {
            this.y += 10; 
            this.moveDown = false;
        } else {
            this.x += this.direction * alienSpeed;
            if (this.x <= 0 || this.x + this.width >= canvas.width) {
                this.direction *= -1;
                this.moveDown = true;
            }
        }
    }
}

// Create aliens for the game
function createAliens() {
    const rows = 2 + level; // Start with fewer rows for testing
    const cols = 5; // Reduce the number of aliens in a row
    aliens = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const alienImage = alienImageObjects[(row + col) % alienImageObjects.length];
            const alien = new Alien(col * 60 + 50, row * 50 + 30, alienImage);
            aliens.push(alien);
        }
    }
}

// Collision detection between bullets and aliens
function detectCollisions() {
    const bulletsToRemove = [];
    const aliensToRemove = [];

    bullets.forEach((bullet, bulletIndex) => {
        aliens.forEach((alien, alienIndex) => {
            if (bullet.x < alien.x + alien.width &&
                bullet.x + bullet.width > alien.x &&
                bullet.y < alien.y + alien.height &&
                bullet.y + bullet.height > alien.y) {
                    bulletsToRemove.push(bulletIndex);
                    aliensToRemove.push(alienIndex);
                    alienHitSound.play();
                    score += 10;
                }
        });
    });

    // Remove collided bullets and aliens
    bulletsToRemove.reverse().forEach(index => bullets.splice(index, 1));
    aliensToRemove.reverse().forEach(index => aliens.splice(index, 1));
}

// Draw score and level
function drawScoreAndLevel() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
    ctx.fillText('Level: ' + level, canvas.width - 100, 20);
}

// Draw everything on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const player = new Player();
    player.draw();

    bullets.forEach((bullet, index) => {
        bullet.draw();
        bullet.move();
        if (bullet.y < 0) {
            bullets.splice(index, 1); // Remove bullet when off-screen
        }
    });

    aliens.forEach((alien) => {
        alien.draw();
        alien.move();
    });

    drawScoreAndLevel();
    detectCollisions();

    if (aliens.length === 0) {
        levelUpSound.play();
        level++;
        alienSpeed += 0.5;
        alienMoveInterval -= 100;
        if (alienMoveInterval < 200) alienMoveInterval = 200;
        createAliens();
    }

    // Check for game over condition
    if (aliens.some((alien) => alien.y + alien.height >= playerY)) {
        gameOver();
    }
}

// Move the player based on key presses
function movePlayer() {
    if (leftArrowPressed && playerX > 0) {
        playerX -= playerSpeed;
    }
    if (rightArrowPressed && playerX + playerWidth < canvas.width) {
        playerX += playerSpeed;
    }
    if (spacePressed && bullets.length < 5) {
        bullets.push(new Bullet(playerX + playerWidth / 2 - 2, playerY));
        shootSound.play();
        spacePressed = false;
    }
}

// Handle key events for player movement and shooting
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        leftArrowPressed = true;
    }
    if (event.key === 'ArrowRight') {
        rightArrowPressed = true;
    }
    if (event.key === ' ') {
        spacePressed = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') {
        leftArrowPressed = false;
    }
    if (event.key === 'ArrowRight') {
        rightArrowPressed = false;
    }
});

// Start the game loop
function startGame() {
    createAliens(); // Initialize aliens
    requestAnimationFrame(gameLoop); // Start the game loop with requestAnimationFrame
}

let lastTime = 0;
let gameOverFlag = false; // Add a flag to track the game over state

function gameLoop(timestamp) {
    if (gameOverFlag) return; // Stop the game loop if the game is over

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    movePlayer();
    draw(); // Draw game elements
    requestAnimationFrame(gameLoop); // Continue the loop
}

// Restart the game
function restartGame() {
    playerX = canvas.width / 2 - 25;
    playerY = canvas.height - 40;
    bullets = [];
    aliens = [];
    score = 0;
    level = 1;
    alienSpeed = 1;
    createAliens();
    startGame();
}

function gameOver() {
    gameOverFlag = true; // Set the flag to true when the game is over
    gameOverSound.play();
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 90, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Press R to Restart', canvas.width / 2 - 80, canvas.height / 2 + 40);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'r' || event.key === 'R') {
            restartGame();
        }
    });
}

// Start the game once all images are loaded
if (imagesLoaded) {
    startGame();
}
