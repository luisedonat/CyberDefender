// ==========================================
// CYBER DEFENDER - A Cybersecurity Space Invaders Game
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// ==========================================
// GAME STATE
// ==========================================
const gameState = {
    score: 0,
    lives: 3,
    level: 1,
    isRunning: false,
    isPaused: false,
    threatsDestroyed: 0,
    questionPending: false
};

// ==========================================
// CYBERSECURITY QUESTIONS
// ==========================================
const questions = [
    {
        question: "What does 'phishing' refer to in cybersecurity?",
        answers: [
            "A type of fishing game",
            "Fraudulent attempts to obtain sensitive information",
            "A network scanning tool",
            "A firewall configuration"
        ],
        correct: 1
    },
    {
        question: "What is a 'firewall' used for?",
        answers: [
            "Cooling down servers",
            "Blocking unauthorized network access",
            "Encrypting passwords",
            "Backing up data"
        ],
        correct: 1
    },
    {
        question: "What does 'malware' stand for?",
        answers: [
            "Malicious software",
            "Male hardware",
            "Main software",
            "Managed software"
        ],
        correct: 0
    },
    {
        question: "What is 'ransomware'?",
        answers: [
            "Software that backs up files",
            "Malware that encrypts files and demands payment",
            "A type of antivirus",
            "A secure file sharing tool"
        ],
        correct: 1
    },
    {
        question: "What is 'two-factor authentication' (2FA)?",
        answers: [
            "Using two passwords",
            "Logging in from two devices",
            "Requiring two forms of verification to access an account",
            "Having two user accounts"
        ],
        correct: 2
    },
    {
        question: "What is a 'DDoS attack'?",
        answers: [
            "Direct Download Service",
            "Distributed Denial of Service attack",
            "Data Deletion on Server",
            "Digital Document System"
        ],
        correct: 1
    },
    {
        question: "What is 'encryption'?",
        answers: [
            "Deleting sensitive data",
            "Converting data into a coded format",
            "Compressing files",
            "Copying files to a backup"
        ],
        correct: 1
    },
    {
        question: "What is a 'VPN' used for?",
        answers: [
            "Speeding up internet connection",
            "Creating a secure, encrypted connection over the internet",
            "Blocking advertisements",
            "Increasing storage space"
        ],
        correct: 1
    },
    {
        question: "What is 'social engineering' in cybersecurity?",
        answers: [
            "Building social media apps",
            "Manipulating people to reveal confidential information",
            "Engineering social networks",
            "Creating user profiles"
        ],
        correct: 1
    },
    {
        question: "What is a 'Trojan horse' in computing?",
        answers: [
            "A fast computer processor",
            "Malware disguised as legitimate software",
            "A type of firewall",
            "An encryption method"
        ],
        correct: 1
    },
    {
        question: "What does 'SQL injection' attack target?",
        answers: [
            "Email servers",
            "Web databases",
            "Hardware components",
            "Network cables"
        ],
        correct: 1
    },
    {
        question: "What is a 'zero-day vulnerability'?",
        answers: [
            "A bug that was fixed today",
            "An unknown security flaw with no patch available",
            "A vulnerability that lasts zero days",
            "A testing period for software"
        ],
        correct: 1
    },
    {
        question: "What is 'spyware'?",
        answers: [
            "Software that monitors user activity secretly",
            "Anti-spy protection software",
            "A type of firewall",
            "Email encryption tool"
        ],
        correct: 0
    },
    {
        question: "What is a 'botnet'?",
        answers: [
            "A network of chatbots",
            "A network of infected computers controlled remotely",
            "A robot network cable",
            "An AI assistant"
        ],
        correct: 1
    },
    {
        question: "What is 'keylogging'?",
        answers: [
            "Organizing keyboard shortcuts",
            "Recording keystrokes to capture sensitive data",
            "Locking keyboard keys",
            "A keyboard testing method"
        ],
        correct: 1
    },
    {
        question: "What is the purpose of a 'honeypot' in security?",
        answers: [
            "To store passwords",
            "To attract and detect attackers",
            "To encrypt files",
            "To speed up networks"
        ],
        correct: 1
    },
    {
        question: "What is 'brute force attack'?",
        answers: [
            "Physical attack on servers",
            "Trying all possible password combinations",
            "Forcing software updates",
            "Breaking hardware"
        ],
        correct: 1
    },
    {
        question: "What does 'HTTPS' provide compared to 'HTTP'?",
        answers: [
            "Faster loading",
            "Encrypted communication",
            "Better graphics",
            "More storage"
        ],
        correct: 1
    },
    {
        question: "What is a 'man-in-the-middle' attack?",
        answers: [
            "An attack from the server room",
            "Intercepting communication between two parties",
            "A physical security breach",
            "A type of virus"
        ],
        correct: 1
    },
    {
        question: "What is 'patch management'?",
        answers: [
            "Sewing computer cables",
            "Regularly updating software to fix vulnerabilities",
            "Managing network patches",
            "Creating software patches for games"
        ],
        correct: 1
    }
];

// ==========================================
// THREAT TYPES (Enemies) - 5 types
// ==========================================
const threatTypes = [
    { name: 'VIRUS', color: '#ff0000', points: 100, symbol: '🦠' },
    { name: 'MALWARE', color: '#ff6600', points: 150, symbol: '💀' },
    { name: 'TROJAN', color: '#ff00ff', points: 200, symbol: '🐴' },
    { name: 'WORM', color: '#ffff00', points: 125, symbol: '🐛' },
    { name: 'SPYWARE', color: '#00ffff', points: 175, symbol: '👁️' }
];

// Track which threat types have been eliminated this wave
let eliminatedTypes = new Set();

// ==========================================
// GAME OBJECTS
// ==========================================

// Player (Firewall)
const player = {
    x: canvas.width / 2 - 30,
    y: canvas.height - 70,
    width: 60,
    height: 40,
    speed: 7,
    color: '#00ff00'
};

// Bullets (Data Packets)
let bullets = [];
const bulletSpeed = 10;

// Enemies (Threats)
let enemies = [];
let enemyBullets = [];
const enemyBulletSpeed = 2;

// Enemy movement
let enemyDirection = 1;
let enemySpeed = 0.5;
let enemyDropAmount = 15;

// Particles for effects
let particles = [];

// ==========================================
// INPUT HANDLING
// ==========================================
const keys = {
    left: false,
    right: false,
    space: false
};

let canShoot = true;
const shootCooldown = 250;

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === ' ') {
        e.preventDefault();
        keys.space = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === ' ') keys.space = false;
});

// ==========================================
// GAME INITIALIZATION
// ==========================================
function initGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.threatsDestroyed = 0;
    gameState.questionPending = false;
    eliminatedTypes = new Set();
    
    player.x = canvas.width / 2 - 30;
    bullets = [];
    enemyBullets = [];
    particles = [];
    
    createEnemyWave();
    updateUI();
}

function createEnemyWave() {
    enemies = [];
    eliminatedTypes = new Set();
    
    // 5 threat types, 4 of each = 5 rows, 4 columns
    const rows = 5;
    const cols = 4;
    const startX = 150;
    const startY = 50;
    const spacingX = 100;
    const spacingY = 55;
    
    enemySpeed = 0.5 + (gameState.level * 0.15);
    enemyDirection = 1;
    
    for (let row = 0; row < rows; row++) {
        const threatType = threatTypes[row];
        for (let col = 0; col < cols; col++) {
            enemies.push({
                x: startX + col * spacingX,
                y: startY + row * spacingY,
                width: 50,
                height: 35,
                type: threatType,
                alive: true
            });
        }
    }
    
    updateThreatBar();
}

// ==========================================
// DRAWING FUNCTIONS
// ==========================================

function drawPlayer() {
    // Main body (firewall shape)
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    
    // Draw shield shape
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + 15);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x, player.y + 15);
    ctx.closePath();
    ctx.fill();
    
    // Inner details
    ctx.fillStyle = '#003300';
    ctx.fillRect(player.x + 10, player.y + 15, player.width - 20, 15);
    
    // Shield icon
    ctx.fillStyle = '#00ff00';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🛡️', player.x + player.width / 2, player.y + 28);
    
    ctx.shadowBlur = 0;
}

function drawBullet(bullet) {
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffff';
    
    // Draw packet shape
    ctx.beginPath();
    ctx.moveTo(bullet.x, bullet.y - 10);
    ctx.lineTo(bullet.x + 5, bullet.y);
    ctx.lineTo(bullet.x, bullet.y + 5);
    ctx.lineTo(bullet.x - 5, bullet.y);
    ctx.closePath();
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function drawEnemy(enemy) {
    if (!enemy.alive) return;
    
    ctx.fillStyle = enemy.type.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = enemy.type.color;
    
    // Draw threat body
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Draw border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Draw symbol
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(enemy.type.symbol, enemy.x + enemy.width / 2, enemy.y + 25);
    
    ctx.shadowBlur = 0;
}

function drawEnemyBullet(bullet) {
    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff0000';
    
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function drawParticles() {
    particles.forEach((particle, index) => {
        particle.life -= 0.02;
        if (particle.life <= 0) {
            particles.splice(index, 1);
            return;
        }
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: Math.random() * 4 + 2,
            color: color,
            life: 1
        });
    }
}

function drawBackground() {
    // Draw matrix-style falling code effect
    ctx.fillStyle = 'rgba(0, 255, 0, 0.03)';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = (Date.now() / 10 + i * 50) % canvas.height;
        ctx.fillText(Math.random() > 0.5 ? '0' : '1', x, y);
    }
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

// ==========================================
// GAME LOGIC
// ==========================================

function updatePlayer() {
    if (keys.left && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.right && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys.space && canShoot) {
        shoot();
    }
}

function shoot() {
    bullets.push({
        x: player.x + player.width / 2,
        y: player.y
    });
    canShoot = false;
    setTimeout(() => canShoot = true, shootCooldown);
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

function updateEnemies() {
    let hitEdge = false;
    let lowestY = 0;
    
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        enemy.x += enemySpeed * enemyDirection;
        
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            hitEdge = true;
        }
        
        if (enemy.y + enemy.height > lowestY) {
            lowestY = enemy.y + enemy.height;
        }
    });
    
    if (hitEdge) {
        enemyDirection *= -1;
        enemies.forEach(enemy => {
            if (enemy.alive) {
                enemy.y += enemyDropAmount;
            }
        });
    }
    
    // Check if enemies reached the player
    if (lowestY >= player.y - 20) {
        gameOver();
    }
    
    // Enemy shooting
    if (Math.random() < 0.02 * (1 + gameState.level * 0.1)) {
        const aliveEnemies = enemies.filter(e => e.alive);
        if (aliveEnemies.length > 0) {
            const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
            enemyBullets.push({
                x: shooter.x + shooter.width / 2,
                y: shooter.y + shooter.height
            });
        }
    }
}

function updateEnemyBullets() {
    enemyBullets.forEach((bullet, index) => {
        bullet.y += enemyBulletSpeed + (gameState.level * 0.2);
        
        if (bullet.y > canvas.height) {
            enemyBullets.splice(index, 1);
            return;
        }
        
        // Check collision with player
        if (bullet.x > player.x && 
            bullet.x < player.x + player.width &&
            bullet.y > player.y && 
            bullet.y < player.y + player.height) {
            
            enemyBullets.splice(index, 1);
            playerHit();
        }
    });
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (!enemy.alive) return;
            
            if (bullet.x > enemy.x && 
                bullet.x < enemy.x + enemy.width &&
                bullet.y > enemy.y && 
                bullet.y < enemy.y + enemy.height) {
                
                // Hit!
                enemy.alive = false;
                bullets.splice(bulletIndex, 1);
                
                gameState.score += enemy.type.points;
                gameState.threatsDestroyed++;
                
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.type.color);
                updateUI();
                updateThreatBar();
                
                // Check if all enemies of this type are eliminated
                const typeName = enemy.type.name;
                const remainingOfType = enemies.filter(e => e.alive && e.type.name === typeName).length;
                
                if (remainingOfType === 0 && !eliminatedTypes.has(typeName) && !gameState.questionPending) {
                    eliminatedTypes.add(typeName);
                    gameState.questionPending = true;
                    setTimeout(() => showQuestion(typeName), 500);
                }
            }
        });
    });
}

function playerHit() {
    gameState.lives--;
    updateUI();
    
    createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#ff0000');
    
    if (gameState.lives <= 0) {
        gameOver();
    }
}

function checkWaveComplete() {
    const aliveEnemies = enemies.filter(e => e.alive);
    if (aliveEnemies.length === 0 && !gameState.questionPending) {
        levelComplete();
    }
}

// ==========================================
// UI UPDATES
// ==========================================

function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
    
    let hearts = '';
    for (let i = 0; i < gameState.lives; i++) {
        hearts += '❤️';
    }
    for (let i = gameState.lives; i < 3; i++) {
        hearts += '🖤';
    }
    document.getElementById('lives').textContent = hearts;
}

function updateThreatBar() {
    const totalEnemies = enemies.length;
    const aliveEnemies = enemies.filter(e => e.alive).length;
    const percentage = (aliveEnemies / totalEnemies) * 100;
    document.getElementById('threatLevel').style.width = percentage + '%';
}

// ==========================================
// QUESTION SYSTEM
// ==========================================

function showQuestion(eliminatedThreatType) {
    gameState.isPaused = true;
    
    const modal = document.getElementById('questionModal');
    const questionText = document.getElementById('questionText');
    const answersContainer = document.getElementById('answersContainer');
    const feedback = document.getElementById('questionFeedback');
    
    // Get random question
    const question = questions[Math.floor(Math.random() * questions.length)];
    
    // Show which threat type was eliminated
    const threatInfo = document.createElement('p');
    threatInfo.style.cssText = 'color: #ff00ff; font-size: 10px; margin-bottom: 15px;';
    threatInfo.textContent = `🎯 All ${eliminatedThreatType} threats eliminated!`;
    
    questionText.textContent = question.question;
    answersContainer.innerHTML = '';
    answersContainer.insertBefore(threatInfo, answersContainer.firstChild);
    feedback.textContent = '';
    feedback.className = 'feedback';
    
    question.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = `${String.fromCharCode(65 + index)}) ${answer}`;
        btn.addEventListener('click', () => handleAnswer(index, question.correct, btn));
        answersContainer.appendChild(btn);
    });
    
    modal.classList.remove('hidden');
}

function handleAnswer(selected, correct, button) {
    const feedback = document.getElementById('questionFeedback');
    const buttons = document.querySelectorAll('.answer-btn');
    
    buttons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === correct) {
            btn.classList.add('correct');
        } else if (btn === button && selected !== correct) {
            btn.classList.add('incorrect');
        }
    });
    
    if (selected === correct) {
        feedback.textContent = '✓ CORRECT! +50 BONUS POINTS';
        feedback.className = 'feedback correct';
        gameState.score += 50;
        updateUI();
    } else {
        feedback.textContent = '✗ INCORRECT! The right answer is highlighted.';
        feedback.className = 'feedback incorrect';
    }
    
    // Continue game after delay
    setTimeout(() => {
        document.getElementById('questionModal').classList.add('hidden');
        gameState.isPaused = false;
        gameState.questionPending = false;
        
        // Check if wave is complete after question
        checkWaveComplete();
    }, 2000);
}

// ==========================================
// GAME FLOW
// ==========================================

function levelComplete() {
    gameState.isPaused = true;
    
    const screen = document.getElementById('levelCompleteScreen');
    screen.classList.remove('hidden');
    
    // Reset loading animation
    const progress = screen.querySelector('.loading-progress');
    progress.style.animation = 'none';
    progress.offsetHeight; // Trigger reflow
    progress.style.animation = 'loading 2s ease-in-out forwards';
    
    setTimeout(() => {
        screen.classList.add('hidden');
        gameState.level++;
        createEnemyWave();
        bullets = [];
        enemyBullets = [];
        updateUI();
        gameState.isPaused = false;
    }, 2500);
}

function gameOver() {
    gameState.isRunning = false;
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalLevel').textContent = gameState.level;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    initGame();
    gameState.isRunning = true;
    gameLoop();
}

// ==========================================
// MAIN GAME LOOP
// ==========================================

function gameLoop() {
    if (!gameState.isRunning) return;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 5, 16, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    
    if (!gameState.isPaused) {
        updatePlayer();
        updateBullets();
        updateEnemies();
        updateEnemyBullets();
        checkCollisions();
    }
    
    // Draw everything
    drawParticles();
    bullets.forEach(drawBullet);
    enemies.forEach(drawEnemy);
    enemyBullets.forEach(drawEnemyBullet);
    drawPlayer();
    
    requestAnimationFrame(gameLoop);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Initial draw
ctx.fillStyle = '#000510';
ctx.fillRect(0, 0, canvas.width, canvas.height);
