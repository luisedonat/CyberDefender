// ==========================================
// CYBER DEFENDER - A Cybersecurity Space Invaders Game
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// ==========================================
// AUDIO SYSTEM
// ==========================================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
}

function playSound(type) {
    if (!audioCtx) return;
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    switch(type) {
        case 'shoot':
            // Laser/pew sound - high pitched short beep
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(880, now);
            oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.1);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
            break;
            
        case 'enemyDestroyed':
            // Explosion sound - noise burst with pitch drop
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(400, now);
            oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.2);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
            break;
            
        case 'playerHit':
            // Damage sound - low rumble with distortion feel
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, now);
            oscillator.frequency.exponentialRampToValueAtTime(30, now + 0.4);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            oscillator.start(now);
            oscillator.stop(now + 0.4);
            
            // Add a second oscillator for richer damage sound
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(100, now);
            osc2.frequency.exponentialRampToValueAtTime(20, now + 0.3);
            gain2.gain.setValueAtTime(0.2, now);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc2.start(now);
            osc2.stop(now + 0.3);
            break;
            
        case 'gameOver':
            // Game over - descending tone
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(440, now);
            oscillator.frequency.exponentialRampToValueAtTime(55, now + 1);
            gainNode.gain.setValueAtTime(0.25, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);
            oscillator.start(now);
            oscillator.stop(now + 1);
            break;
            
        case 'levelComplete':
            // Victory jingle - ascending tones
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(523, now); // C5
            oscillator.frequency.setValueAtTime(659, now + 0.1); // E5
            oscillator.frequency.setValueAtTime(784, now + 0.2); // G5
            oscillator.frequency.setValueAtTime(1047, now + 0.3); // C6
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.setValueAtTime(0.15, now + 0.3);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            oscillator.start(now);
            oscillator.stop(now + 0.5);
            break;
            
        case 'correct':
            // Correct answer - happy ding
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, now);
            oscillator.frequency.setValueAtTime(1100, now + 0.1);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            break;
            
        case 'incorrect':
            // Wrong answer - buzzer
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, now);
            oscillator.frequency.setValueAtTime(100, now + 0.15);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            break;
    }
}

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
// CYBERSECURITY QUESTIONS - Categorized by threat type
// ==========================================
const questionsByCategory = {
    VIRUS: [
        {
            question: "What is a computer virus?",
            answers: [
                "A type of hardware failure",
                "An internet browser",
                "A program that replicates by inserting copies into other programs",
                "A cooling system for computers"
            ],
            correct: 2
        },
        {
            question: "How do computer viruses typically spread?",
            answers: [
                "Through WiFi signals only",
                "Through keyboard typing",
                "Through monitor screens",
                "Through infected files, email attachments, or downloads"
            ],
            correct: 3
        },
        {
            question: "What is the best protection against viruses?",
            answers: [
                "Turning off the computer",
                "Using antivirus software and keeping it updated",
                "Using a larger monitor",
                "Deleting all files"
            ],
            correct: 1
        },
        {
            question: "What was one of the first computer viruses called?",
            answers: [
                "Heart",
                "Lung",
                "Liver",
                "Brain"
            ],
            correct: 3
        }
    ],
    MALWARE: [
        {
            question: "What does 'malware' stand for?",
            answers: [
                "Male hardware",
                "Main software",
                "Malicious software",
                "Managed software"
            ],
            correct: 2
        },
        {
            question: "Which of these is NOT a type of malware?",
            answers: [
                "Ransomware",
                "Firmware",
                "Spyware",
                "Adware"
            ],
            correct: 1
        },
        {
            question: "What is 'ransomware'?",
            answers: [
                "Software that backs up files",
                "A type of antivirus",
                "A secure file sharing tool",
                "Malware that encrypts files and demands payment"
            ],
            correct: 3
        },
        {
            question: "How can you protect against malware?",
            answers: [
                "Keep software updated and avoid suspicious downloads",
                "Click on all email links to check them",
                "Download software from any website",
                "Share passwords with friends"
            ],
            correct: 0
        }
    ],
    TROJAN: [
        {
            question: "What is a 'Trojan horse' in computing?",
            answers: [
                "A fast computer processor",
                "A type of firewall",
                "An encryption method",
                "Malware disguised as legitimate software"
            ],
            correct: 3
        },
        {
            question: "Why is it called a 'Trojan horse'?",
            answers: [
                "It hides malicious code inside something that appears safe",
                "It was invented in Troy",
                "It runs very fast like a horse",
                "It makes horse sounds"
            ],
            correct: 0
        },
        {
            question: "How do Trojans typically infect computers?",
            answers: [
                "Through automatic system updates",
                "Through official app stores only",
                "By users downloading fake or infected software",
                "Through the power supply"
            ],
            correct: 2
        },
        {
            question: "What can a Trojan do once installed?",
            answers: [
                "Only display advertisements",
                "Speed up your computer",
                "Create backdoors, steal data, or give attackers control",
                "Improve internet connection"
            ],
            correct: 2
        }
    ],
    WORM: [
        {
            question: "How is a worm different from a virus?",
            answers: [
                "Worms are slower",
                "Worms only affect old computers",
                "Worms are helpful programs",
                "Worms can spread without user interaction"
            ],
            correct: 3
        },
        {
            question: "What do computer worms primarily exploit to spread?",
            answers: [
                "Network vulnerabilities and connections",
                "Keyboard inputs",
                "Monitor brightness",
                "Sound cards"
            ],
            correct: 0
        },
        {
            question: "What was the 'ILOVEYOU' worm known for?",
            answers: [
                "Spreading love messages",
                "Improving computer performance",
                "Being one of the most damaging worms, spreading via email",
                "Creating beautiful graphics"
            ],
            correct: 2
        },
        {
            question: "What is a 'botnet' often created by worms?",
            answers: [
                "A network of chatbots",
                "A helpful computer network",
                "An AI assistant",
                "A network of infected computers controlled remotely"
            ],
            correct: 3
        }
    ],
    SPYWARE: [
        {
            question: "What is 'spyware'?",
            answers: [
                "Anti-spy protection software",
                "A type of firewall",
                "Software that monitors user activity secretly",
                "Email encryption tool"
            ],
            correct: 2
        },
        {
            question: "What is 'keylogging'?",
            answers: [
                "Organizing keyboard shortcuts",
                "Locking keyboard keys",
                "A keyboard testing method",
                "Recording keystrokes to capture sensitive data"
            ],
            correct: 3
        },
        {
            question: "What information might spyware collect?",
            answers: [
                "Passwords, browsing history, and personal data",
                "Only your wallpaper settings",
                "Just your computer's color scheme",
                "Only the time and date"
            ],
            correct: 0
        },
        {
            question: "How can spyware get installed on your computer?",
            answers: [
                "Only through physical access",
                "Through official Windows updates",
                "Bundled with free software, phishing, or malicious websites",
                "By using too much RAM"
            ],
            correct: 2
        }
    ]
};

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
    gameState.respawnCount = {}; // Track respawn count per threat type
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
    
    // Level-based difficulty (3 levels total)
    // Level 1: Slow and easy
    // Level 2: Medium speed
    // Level 3: Fast and challenging
    const levelSettings = {
        1: { speed: 0.4, dropAmount: 12 },
        2: { speed: 0.6, dropAmount: 15 },
        3: { speed: 0.9, dropAmount: 18 }
    };
    
    const settings = levelSettings[gameState.level] || levelSettings[3];
    enemySpeed = settings.speed;
    enemyDropAmount = settings.dropAmount;
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
    playSound('shoot');
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
    
    // Enemy shooting - difficulty scales with level
    // Level 1: 0.5% chance, Level 2: 0.8% chance, Level 3: 1.2% chance
    const shootChance = 0.005 + (gameState.level - 1) * 0.0035;
    if (Math.random() < shootChance) {
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
                
                playSound('enemyDestroyed');
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
    
    playSound('playerHit');
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

function shuffleAnswers(answers, correctIndex) {
    // Create array of {answer, isCorrect} objects
    const answerObjects = answers.map((answer, index) => ({
        answer: answer,
        isCorrect: index === correctIndex
    }));
    
    // Fisher-Yates shuffle
    for (let i = answerObjects.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answerObjects[i], answerObjects[j]] = [answerObjects[j], answerObjects[i]];
    }
    
    // Find new correct index
    const newCorrectIndex = answerObjects.findIndex(obj => obj.isCorrect);
    const shuffledAnswers = answerObjects.map(obj => obj.answer);
    
    return { shuffledAnswers, correctIndex: newCorrectIndex };
}

function showQuestion(eliminatedThreatType) {
    gameState.isPaused = true;
    
    const modal = document.getElementById('questionModal');
    const questionText = document.getElementById('questionText');
    const answersContainer = document.getElementById('answersContainer');
    const feedback = document.getElementById('questionFeedback');
    
    // Store current threat type for potential respawn
    gameState.currentQuestionThreat = eliminatedThreatType;
    
    // Get random question from the matching category
    const categoryQuestions = questionsByCategory[eliminatedThreatType];
    const question = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
    
    // Shuffle answers randomly
    const { shuffledAnswers, correctIndex } = shuffleAnswers(question.answers, question.correct);
    
    // Show which threat type was eliminated
    const threatInfo = document.createElement('p');
    threatInfo.style.cssText = 'color: #ff00ff; font-size: 10px; margin-bottom: 15px;';
    threatInfo.textContent = `🎯 All ${eliminatedThreatType} threats eliminated!`;
    
    questionText.textContent = question.question;
    answersContainer.innerHTML = '';
    answersContainer.insertBefore(threatInfo, answersContainer.firstChild);
    feedback.textContent = '';
    feedback.className = 'feedback';
    
    shuffledAnswers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = `${String.fromCharCode(65 + index)}) ${answer}`;
        btn.addEventListener('click', () => handleAnswer(index, correctIndex, btn));
        answersContainer.appendChild(btn);
    });
    
    modal.classList.remove('hidden');
}

function respawnThreatType(threatTypeName) {
    // Find the threat type object
    const threatType = threatTypes.find(t => t.name === threatTypeName);
    if (!threatType) return;
    
    // Remove from eliminated types so question can trigger again
    eliminatedTypes.delete(threatTypeName);
    
    // Track respawn count for this threat type
    if (!gameState.respawnCount[threatTypeName]) {
        gameState.respawnCount[threatTypeName] = 0;
    }
    gameState.respawnCount[threatTypeName]++;
    
    // Find the row index for this threat type
    const rowIndex = threatTypes.findIndex(t => t.name === threatTypeName);
    
    // Respawn positions - each respawn appears 60px lower
    const startX = 150;
    const baseStartY = 50;
    const respawnPenalty = gameState.respawnCount[threatTypeName] * 60; // 60px lower each time
    const startY = baseStartY + respawnPenalty;
    const spacingX = 100;
    const spacingY = 55;
    const cols = 4;
    
    // Cap the respawn height so they don't spawn on top of the player
    const maxY = player.y - 150;
    const actualY = Math.min(startY + rowIndex * spacingY, maxY);
    
    // Respawn all 4 enemies of this type
    for (let col = 0; col < cols; col++) {
        enemies.push({
            x: startX + col * spacingX,
            y: actualY,
            width: 50,
            height: 35,
            type: threatType,
            alive: true
        });
    }
    
    updateThreatBar();
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
        playSound('correct');
        feedback.textContent = '✓ CORRECT! +50 BONUS POINTS - Defense secured!';
        feedback.className = 'feedback correct';
        gameState.score += 50;
        updateUI();
    } else {
        playSound('incorrect');
        const timesRespawned = (gameState.respawnCount[gameState.currentQuestionThreat] || 0) + 1;
        feedback.textContent = `✗ INCORRECT! ${gameState.currentQuestionThreat} threats return closer! (×${timesRespawned})`;
        feedback.className = 'feedback incorrect';
        // Respawn the threat type after a short delay
        setTimeout(() => {
            respawnThreatType(gameState.currentQuestionThreat);
        }, 1000);
    }
    
    // Continue game after delay
    setTimeout(() => {
        document.getElementById('questionModal').classList.add('hidden');
        gameState.isPaused = false;
        gameState.questionPending = false;
        
        // Check if wave is complete after question
        checkWaveComplete();
    }, 2500);
}

// ==========================================
// GAME FLOW
// ==========================================

function levelComplete() {
    gameState.isPaused = true;
    playSound('levelComplete');
    
    // Check if player completed all 3 levels
    if (gameState.level >= 3) {
        gameVictory();
        return;
    }
    
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

function gameVictory() {
    gameState.isRunning = false;
    
    document.getElementById('victoryScore').textContent = gameState.score;
    document.getElementById('victoryScreen').classList.remove('hidden');
}

function gameOver() {
    gameState.isRunning = false;
    playSound('gameOver');
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalLevel').textContent = gameState.level;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function startGame() {
    initAudio();
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('victoryScreen').classList.add('hidden');
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
document.getElementById('victoryRestartBtn').addEventListener('click', startGame);

// Initial draw
ctx.fillStyle = '#000510';
ctx.fillRect(0, 0, canvas.width, canvas.height);
