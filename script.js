(() => {
  const COLS = 10;
  const ROWS = 20;
  const CELL = 30;

  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const levelEl = document.getElementById('level');
  const overlay = document.getElementById('game-over-overlay');
  const restartBtn = document.getElementById('restart-btn');

  const COLORS = {
    I: '#00e0e0',
    O: '#e0e000',
    T: '#a000e0',
    S: '#00e000',
    Z: '#e00000',
    J: '#0000e0',
    L: '#e0a000',
  };

  const SHAPES = {
    I: [
      [0, 0], [1, 0], [2, 0], [3, 0],
    ],
    O: [
      [0, 0], [1, 0], [0, 1], [1, 1],
    ],
    T: [
      [0, 0], [1, 0], [2, 0], [1, 1],
    ],
    S: [
      [1, 0], [2, 0], [0, 1], [1, 1],
    ],
    Z: [
      [0, 0], [1, 0], [1, 1], [2, 1],
    ],
    J: [
      [0, 0], [0, 1], [1, 1], [2, 1],
    ],
    L: [
      [2, 0], [0, 1], [1, 1], [2, 1],
    ],
  };

  const PIECE_TYPES = Object.keys(SHAPES);
  const BASE_DROP_INTERVAL = 800;
  const MIN_DROP_INTERVAL = 100;
  const SPEED_STEP_PER_LEVEL = 70;
  const LEVEL_UP_INTERVAL = 30000;

  let board = createEmptyBoard();
  let current = null;
  let score = 0;
  let level = 1;
  let dropTimer = 0;
  let levelTimer = 0;
  let lastTime = 0;
  let gameOver = false;
  let rafId = null;

  function currentDropInterval() {
    return Math.max(MIN_DROP_INTERVAL, BASE_DROP_INTERVAL - (level - 1) * SPEED_STEP_PER_LEVEL);
  }

  function createEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function randomPieceType() {
    return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  }

  function createPiece(type) {
    const cells = SHAPES[type].map(([x, y]) => ({ x, y }));
    return {
      type,
      cells,
      x: Math.floor(COLS / 2) - 1,
      y: 0,
    };
  }

  function getCellPositions(piece) {
    return piece.cells.map((c) => ({ x: piece.x + c.x, y: piece.y + c.y }));
  }

  function isValidPosition(piece) {
    return getCellPositions(piece).every(({ x, y }) => {
      if (x < 0 || x >= COLS || y >= ROWS) return false;
      if (y < 0) return true;
      return board[y][x] === null;
    });
  }

  function rotatePiece(piece) {
    if (piece.type === 'O') return piece;
    const rotated = piece.cells.map(({ x, y }) => ({ x: -y, y: x }));
    const minX = Math.min(...rotated.map((c) => c.x));
    const minY = Math.min(...rotated.map((c) => c.y));
    const normalized = rotated.map((c) => ({ x: c.x - minX, y: c.y - minY }));
    return { ...piece, cells: normalized };
  }

  function lockPiece(piece) {
    getCellPositions(piece).forEach(({ x, y }) => {
      if (y >= 0) board[y][x] = piece.type;
    });
  }

  function clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y].every((cell) => cell !== null)) {
        board.splice(y, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++;
        y++;
      }
    }
    if (cleared > 0) {
      score += cleared * 100;
      scoreEl.textContent = score;
    }
  }

  function spawnPiece() {
    current = createPiece(randomPieceType());
    if (!isValidPosition(current)) {
      endGame();
    }
  }

  function endGame() {
    gameOver = true;
    overlay.classList.remove('hidden');
    if (rafId) cancelAnimationFrame(rafId);
  }

  function tryMove(dx, dy) {
    if (gameOver) return false;
    const moved = { ...current, x: current.x + dx, y: current.y + dy };
    if (isValidPosition(moved)) {
      current = moved;
      return true;
    }
    return false;
  }

  function tryRotate() {
    if (gameOver) return;
    const rotated = rotatePiece(current);
    const attempt = { ...rotated, x: current.x, y: current.y };
    if (isValidPosition(attempt)) {
      current = attempt;
    }
  }

  function softDrop() {
    if (!tryMove(0, 1)) {
      lockPiece(current);
      clearLines();
      spawnPiece();
    }
    dropTimer = 0;
  }

  function hardDrop() {
    if (gameOver) return;
    while (tryMove(0, 1)) {
      // fall until blocked
    }
    lockPiece(current);
    clearLines();
    spawnPiece();
    dropTimer = 0;
  }

  function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
  }

  function render() {
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = board[y][x];
        if (cell) drawCell(x, y, COLORS[cell]);
      }
    }

    if (current) {
      getCellPositions(current).forEach(({ x, y }) => {
        if (y >= 0) drawCell(x, y, COLORS[current.type]);
      });
    }
  }

  function loop(timestamp) {
    if (gameOver) return;
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    dropTimer += delta;
    if (dropTimer >= currentDropInterval()) {
      softDrop();
    }

    levelTimer += delta;
    if (levelTimer >= LEVEL_UP_INTERVAL) {
      levelTimer -= LEVEL_UP_INTERVAL;
      level++;
      levelEl.textContent = level;
    }

    render();
    rafId = requestAnimationFrame(loop);
  }

  function handleKeydown(e) {
    if (gameOver) return;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        tryMove(-1, 0);
        break;
      case 'ArrowRight':
        e.preventDefault();
        tryMove(1, 0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        softDrop();
        break;
      case 'ArrowUp':
        e.preventDefault();
        tryRotate();
        break;
      case ' ':
        e.preventDefault();
        hardDrop();
        break;
      default:
        return;
    }
    render();
  }

  function startGame() {
    board = createEmptyBoard();
    score = 0;
    scoreEl.textContent = score;
    level = 1;
    levelEl.textContent = level;
    gameOver = false;
    dropTimer = 0;
    levelTimer = 0;
    lastTime = 0;
    overlay.classList.add('hidden');
    spawnPiece();
    render();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  function handleTouchAction(action) {
    if (gameOver) return;
    action();
    render();
  }

  document.getElementById('btn-left').addEventListener('click', () => handleTouchAction(() => tryMove(-1, 0)));
  document.getElementById('btn-right').addEventListener('click', () => handleTouchAction(() => tryMove(1, 0)));
  document.getElementById('btn-rotate').addEventListener('click', () => handleTouchAction(tryRotate));
  document.getElementById('btn-down').addEventListener('click', () => handleTouchAction(softDrop));
  document.getElementById('btn-drop').addEventListener('click', () => handleTouchAction(hardDrop));

  document.addEventListener('keydown', handleKeydown);
  restartBtn.addEventListener('click', startGame);

  startGame();
})();
