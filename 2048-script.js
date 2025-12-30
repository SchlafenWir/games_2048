class Game2048 {
    constructor() {
        this.size = 4;
        this.board = [];
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.gameWon = false;
        this.gameOver = false;
        this.isPaused = false;
        this.gameTheme = this.loadTheme();
        this.soundEnabled = this.loadSoundSetting();
        this.moveCount = 0;
        this.startTime = null; // 初始为空，只有在游戏开始时才设置
        this.gameTimer = null;
        this.pauseStartTime = null; // 记录暂停开始时间
        this.totalPauseTime = 0; // 记录累计暂停时间（毫秒）
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupAudio();
        
        // 初始化游戏板但不添加随机方块
        this.initBoard();
    }

    initializeElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.finalScoreElement = document.getElementById('finalScore');
        
        this.newGameBtn = document.getElementById('newGameBtn');
        this.tryAgainBtn = document.getElementById('tryAgainBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.soundToggle = document.getElementById('soundToggle');
        this.gameStats = document.getElementById('gameStats');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.howToPlayBtn = document.getElementById('howToPlayBtn');
        this.instructionsModal = document.getElementById('instructionsModal');
        this.closeInstructionsBtn = document.getElementById('closeInstructions');
        this.startGameBtn = document.getElementById('startGameBtn');
        
        this.upBtn = document.getElementById('upBtn');
        this.downBtn = document.getElementById('downBtn');
        this.leftBtn = document.getElementById('leftBtn');
        this.rightBtn = document.getElementById('rightBtn');
    }

    initBoard() {
        // 创建空的游戏板
        this.board = [];
        for (let i = 0; i < this.size; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.board[i][j] = 0;
            }
        }
        
        this.updateDisplay();
        this.applyTheme();
    }
    
    initGame() {
        this.board = [];
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.isPaused = false;
        this.moveCount = 0;
        this.startTime = Date.now();
        this.pauseStartTime = null; // 重置暂停开始时间
        this.totalPauseTime = 0; // 重置累计暂停时间
        
        // 创建空的游戏板
        for (let i = 0; i < this.size; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.board[i][j] = 0;
            }
        }
        
        // 添加两个初始方块
        this.addRandomTile();
        this.addRandomTile();
        
        this.updateDisplay();
        this.hideGameOverOverlay();
        this.hidePauseOverlay(); // 隐藏暂停界面
        this.updatePauseButton();
        this.applyTheme();
        this.startGameTimer();
    }

    addRandomTile() {
        const emptyTiles = [];
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    emptyTiles.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyTiles.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyTiles.length);
            const { row, col } = emptyTiles[randomIndex];
            
            // 90%概率生成2，10%概率生成4
            this.board[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        if (this.gameOver || this.isPaused) return;
        
        const previousBoard = JSON.parse(JSON.stringify(this.board));
        let moved = false;
        
        switch (direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        if (moved) {
            this.moveCount++;
            this.playSound('move');
            this.addRandomTile();
            this.updateDisplay();
            
            if (this.checkWin()) {
                this.gameWon = true;
                this.playSound('win');
                this.showWinMessage();
            }
            
            if (this.checkGameOver()) {
                this.gameOver = true;
                this.playSound('gameOver');
                this.showGameOver();
            }
        }
    }

    moveUp() {
        let moved = false;
        
        for (let col = 0; col < this.size; col++) {
            const column = [];
            for (let row = 0; row < this.size; row++) {
                column.push(this.board[row][col]);
            }
            
            const mergedColumn = this.mergeLine(column);
            
            for (let row = 0; row < this.size; row++) {
                if (this.board[row][col] !== mergedColumn[row]) {
                    moved = true;
                }
                this.board[row][col] = mergedColumn[row];
            }
        }
        
        return moved;
    }

    moveDown() {
        let moved = false;
        
        for (let col = 0; col < this.size; col++) {
            const column = [];
            for (let row = this.size - 1; row >= 0; row--) {
                column.push(this.board[row][col]);
            }
            
            const mergedColumn = this.mergeLine(column);
            
            for (let row = this.size - 1, i = 0; row >= 0; row--, i++) {
                if (this.board[row][col] !== mergedColumn[i]) {
                    moved = true;
                }
                this.board[row][col] = mergedColumn[i];
            }
        }
        
        return moved;
    }

    moveLeft() {
        let moved = false;
        
        for (let row = 0; row < this.size; row++) {
            const line = this.board[row];
            const mergedLine = this.mergeLine(line);
            
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] !== mergedLine[col]) {
                    moved = true;
                }
                this.board[row][col] = mergedLine[col];
            }
        }
        
        return moved;
    }

    moveRight() {
        let moved = false;
        
        for (let row = 0; row < this.size; row++) {
            const line = [];
            for (let col = this.size - 1; col >= 0; col--) {
                line.push(this.board[row][col]);
            }
            
            const mergedLine = this.mergeLine(line);
            
            for (let col = this.size - 1, i = 0; col >= 0; col--, i++) {
                if (this.board[row][col] !== mergedLine[i]) {
                    moved = true;
                }
                this.board[row][col] = mergedLine[i];
            }
        }
        
        return moved;
    }

    mergeLine(line) {
        // 移除0
        const filtered = line.filter(val => val !== 0);
        
        // 合并相同的数字
        const merged = [];
        for (let i = 0; i < filtered.length; i++) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                const mergedValue = filtered[i] * 2;
                merged.push(mergedValue);
                this.score += mergedValue;
                i++; // 跳过下一个元素
            } else {
                merged.push(filtered[i]);
            }
        }
        
        // 填充到4个位置
        while (merged.length < this.size) {
            merged.push(0);
        }
        
        return merged;
    }

    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }

    checkGameOver() {
        // 检查是否还有空格
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // 检查是否还能合并
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.board[i][j];
                
                // 检查右边
                if (j < this.size - 1 && current === this.board[i][j + 1]) {
                    return false;
                }
                
                // 检查下面
                if (i < this.size - 1 && current === this.board[i + 1][j]) {
                    return false;
                }
            }
        }
        
        return true;
    }

    updateDisplay() {
        // 更新游戏板
        const tiles = this.gameBoard.querySelectorAll('.tile');
        tiles.forEach((tile, index) => {
            const row = Math.floor(index / this.size);
            const col = index % this.size;
            const value = this.board[row][col];
            
            tile.textContent = value === 0 ? '' : value;
            tile.className = 'tile';
            
            if (value !== 0) {
                tile.classList.add(`tile-${value}`);
                this.animateTile(tile, row, col);
            } else {
                tile.classList.add('empty');
            }
        });
        
        // 更新分数
        this.scoreElement.textContent = this.score;
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        this.highScoreElement.textContent = this.highScore;
        
        // 更新游戏统计
        this.updateGameStats();
    }

    showGameOver() {
        this.stopGameTimer();
        this.finalScoreElement.textContent = this.score;
        this.gameOverOverlay.classList.add('show');
    }

    hideGameOverOverlay() {
        this.gameOverOverlay.classList.remove('show');
    }

    showWinMessage() {
        const playAgain = confirm('恭喜！你达到了 2048！继续游戏以获得更高分数！\n\n点击确定继续游戏，点击取消开始新游戏。');
        if (!playAgain) {
            this.initGame();
        }
    }

    pauseGame() {
        this.isPaused = !this.isPaused;
        this.updatePauseButton();
        
        if (this.isPaused) {
            this.showPauseOverlay();
            this.pauseStartTime = Date.now(); // 记录暂停开始时间
            this.stopGameTimer(); // 暂停时停止计时器
        } else {
            this.hidePauseOverlay();
            if (this.pauseStartTime !== null) {
                // 计算暂停时长并累加到总暂停时间
                this.totalPauseTime += Date.now() - this.pauseStartTime;
                this.pauseStartTime = null;
            }
            this.startGameTimer(); // 恢复时重新启动计时器
        }
    }

    updatePauseButton() {
        this.pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
    }

    showPauseOverlay() {
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (pauseOverlay) {
            pauseOverlay.classList.add('show');
        }
    }

    hidePauseOverlay() {
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (pauseOverlay) {
            pauseOverlay.classList.remove('show');
        }
    }

    showInstructionsModal() {
        const modal = document.getElementById('instructionsModal');
        if (modal) {
            // 根据游戏状态设置按钮文本
            const startGameBtn = document.getElementById('startGameBtn');
            if (startGameBtn) {
                // 如果游戏已开始（有过移动）或者游戏暂停，显示"继续游戏"
                if (this.moveCount > 0 || this.isPaused) {
                    startGameBtn.textContent = '继续游戏 ▶️';
                } else {
                    // 游戏未开始的情况
                    startGameBtn.textContent = '开始游戏 🎲';
                }
            }
            
            modal.classList.add('show');
        }
    }

    hideInstructionsModal() {
        const modal = document.getElementById('instructionsModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    toggleTheme() {
        this.gameTheme = this.gameTheme === 'light' ? 'dark' : 'light';
        this.saveTheme();
        this.applyTheme();
    }

    applyTheme() {
        document.body.className = this.gameTheme === 'dark' ? 'dark-theme' : '';
        this.updateThemeButton();
    }

    updateThemeButton() {
        this.themeToggle.textContent = this.gameTheme === 'light' ? '🌙' : '☀️';
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveSoundSetting();
        this.updateSoundButton();
    }

    updateSoundButton() {
        this.soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
    }

    updateGameStats() {
        if (this.gameStats) {
            let minutes = 0;
            let seconds = 0;
            
            // 只有当游戏开始计时时才计算时间
            if (this.startTime !== null) {
                let actualPlayTime = 0;
                
                if (this.isPaused && this.pauseStartTime !== null) {
                    // 暂停时：计算到暂停开始时的游戏时间
                    actualPlayTime = Math.floor((this.pauseStartTime - this.startTime - this.totalPauseTime) / 1000);
                } else {
                    // 进行中时：计算当前实际游戏时间
                    actualPlayTime = Math.floor((Date.now() - this.startTime - this.totalPauseTime) / 1000);
                }
                
                minutes = Math.floor(actualPlayTime / 60);
                seconds = actualPlayTime % 60;
                
                // 确保时间不为负数
                if (minutes < 0) minutes = 0;
                if (seconds < 0) seconds = 0;
            }
            
            this.gameStats.textContent = `移动: ${this.moveCount} | 时间: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    startGameTimer() {
        // 清除之前的定时器
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        // 只有游戏未结束时才开始计时
        if (!this.gameWon && !this.gameOver) {
            this.gameTimer = setInterval(() => {
                this.updateGameStats();
            }, 1000);
        }
    }

    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    animateTile(tile, row, col) {
        tile.style.animation = 'none';
        setTimeout(() => {
            tile.style.animation = `tileAppear 0.3s ease-in-out`;
        }, 10);
    }

    setupAudio() {
        this.audioContext = null;
        this.sounds = {};
        this.audioInitialized = false;
    }

    initializeAudio() {
        if (this.audioInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.sounds = {
                move: this.createBeepSound(200, 0.1),
                merge: this.createBeepSound(400, 0.2),
                win: this.createBeepSound(800, 0.5),
                gameOver: this.createBeepSound(150, 0.3)
            };
            this.audioInitialized = true;
        } catch (e) {
            console.log('Audio not supported');
            this.audioInitialized = false;
        }
    }

    createBeepSound(frequency, duration) {
        return () => {
            if (!this.soundEnabled || !this.audioContext) return;
            
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            } catch (e) {
                console.log('Audio not supported');
            }
        };
    }

    playSound(soundName) {
        if (!this.soundEnabled) return;
        if (!this.audioInitialized) {
            this.initializeAudio();
        }
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    loadTheme() {
        return localStorage.getItem('2048-theme') || 'light';
    }

    saveTheme() {
        localStorage.setItem('2048-theme', this.gameTheme);
    }

    loadSoundSetting() {
        return localStorage.getItem('2048-sound') !== 'false';
    }

    saveSoundSetting() {
        localStorage.setItem('2048-sound', this.soundEnabled.toString());
    }

    loadHighScore() {
        const stored = localStorage.getItem('2048-high-score');
        const score = parseInt(stored) || 0;
        // 确保最高分不会显示为奇奇怪怪的值
        return score > 0 ? score : 0;
    }

    saveHighScore() {
        localStorage.setItem('2048-high-score', this.highScore.toString());
    }

    setupEventListeners() {
        // 初始化音频上下文（用户交互后）
        const initAudio = () => {
            if (!this.audioInitialized) {
                this.initializeAudio();
            }
        };

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            // 如果游戏暂停，只允许特定操作，不允许空格键继续游戏
            if (this.isPaused) {
                // 暂停时阻止所有键盘操作，防止空格键触发浏览器滚动
                e.preventDefault();
                return;
            }
            
            // 初始化音频
            initAudio();
            
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
                case ' ': // 空格键暂停
                    e.preventDefault();
                    this.pauseGame();
                    break;
            }
        });
        
        // 游戏说明弹窗事件
        this.howToPlayBtn.addEventListener('click', () => {
            this.showInstructionsModal();
        });
        
        this.closeInstructionsBtn.addEventListener('click', () => {
            this.hideInstructionsModal();
        });
        
        this.instructionsModal.addEventListener('click', (e) => {
            // 点击遮罩关闭弹窗
            if (e.target === this.instructionsModal) {
                this.hideInstructionsModal();
            }
        });
        
        this.startGameBtn.addEventListener('click', () => {
            this.hideInstructionsModal();
            
            // 如果游戏尚未开始，初始化游戏
            if (this.startTime === null) {
                this.initGame();
            } else if (this.isPaused) {
                // 如果游戏暂停，恢复游戏
                this.pauseGame();
            }
            // 如果游戏正在进行且未暂停，则什么都不做（只是关闭说明）
        });
        
        // 按钮事件
        this.newGameBtn.addEventListener('click', () => {
            this.initGame();
        });
        
        this.tryAgainBtn.addEventListener('click', () => {
            this.initGame();
        });
        
        this.resumeBtn.addEventListener('click', () => {
            this.pauseGame();
        });
        
        // 新增功能按钮事件
        this.pauseBtn.addEventListener('click', () => {
            this.pauseGame();
        });
        
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        this.soundToggle.addEventListener('click', () => {
            this.toggleSound();
        });
        
        // 移动端控制按钮
        this.upBtn.addEventListener('click', () => this.move('up'));
        this.downBtn.addEventListener('click', () => this.move('down'));
        this.leftBtn.addEventListener('click', () => this.move('left'));
        this.rightBtn.addEventListener('click', () => this.move('right'));
    }
}

// 游戏说明弹窗 - 修改为使用自定义弹窗
function showInstructions() {
    // 查找Game2048实例
    if (window.gameInstance) {
        window.gameInstance.showInstructionsModal();
    } else {
        // 如果找不到实例，使用默认方式
        const instructions = `
游戏说明：

1. 目标：创建带有数字2048的方块！

2. 操作方式：
   • 使用方向键（↑↓←→）移动方块
   • 按空格键可以快速暂停/继续游戏
   • 在移动设备上可以使用屏幕下方的虚拟按钮

3. 游戏规则：
   • 每次移动后，会在空白处随机出现一个2或4
   • 当两个相同数字的方块碰撞时，它们会合并成一个
   • 合并后的方块数字是原来数字的两倍
   • 当无法移动时游戏结束

4. 得分：每次合并都会获得分数，合并后的数字就是获得的分数

5. 特色功能：
   • 支持明暗主题切换
   • 可开启/关闭音效
   • 实时统计移动次数和游戏时间

祝您游戏愉快！
        `;
        alert(instructions);
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 将游戏实例保存到全局变量
    window.gameInstance = new Game2048();
});