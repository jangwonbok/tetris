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
  const restartAnytimeBtn = document.getElementById('restart-anytime-btn');
  const highScoreEl = document.getElementById('high-score');
  const nextCanvas = document.getElementById('next-board');
  const nextCtx = nextCanvas.getContext('2d');
  const NEXT_CELL = 20;
  const boardWrapper = document.querySelector('.board-wrapper');
  const touchLayoutQuery = window.matchMedia('(pointer: coarse), (max-width: 700px)');

  // On touch layouts the board must fit exactly within whatever space is
  // left after the header/score bar/touch buttons, and CSS alone can't size
  // it reliably (board-wrapper's own box depends on the canvas, so aspect-
  // ratio + max-width create a circular reference) — measure directly instead.
  function fitBoardToViewport() {
    if (!touchLayoutQuery.matches) {
      canvas.style.width = '';
      canvas.style.height = '';
      return;
    }
    const availW = boardWrapper.clientWidth;
    const availH = boardWrapper.clientHeight;
    if (availW <= 0 || availH <= 0) return;
    const size = Math.min(availW, availH / 2);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size * 2}px`;
  }

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
  const HIGH_SCORE_KEY = 'tetris-high-score';

  let board = createEmptyBoard();
  let current = null;
  let nextType = randomPieceType();
  let score = 0;
  let level = 1;
  let highScore = null;
  let dropTimer = 0;
  let levelTimer = 0;
  let lastTime = 0;
  let gameOver = false;
  let rafId = null;

  // best score ever recorded in this browser, across all play sessions;
  // wrapped in try/catch since localStorage can throw (privacy mode, etc.)
  function loadHighScore() {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      const parsed = stored === null ? NaN : parseInt(stored, 10);
      return Number.isFinite(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function renderHighScore() {
    highScoreEl.textContent = highScore === null ? '-' : highScore;
  }

  function maybeUpdateHighScore() {
    if (highScore === null || score > highScore) {
      highScore = score;
      renderHighScore();
      try {
        localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
      } catch (e) {
        // ignore (e.g. privacy mode / storage disabled)
      }
    }
  }

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

  function rotatePiece(piece, direction) {
    if (piece.type === 'O') return piece;
    const rotated = piece.cells.map(({ x, y }) => (
      direction === -1 ? { x: y, y: -x } : { x: -y, y: x }
    ));
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
      maybeUpdateHighScore();
    }
  }

  function spawnPiece() {
    current = createPiece(nextType);
    nextType = randomPieceType();
    renderNextPreview();
    if (!isValidPosition(current)) {
      endGame();
    }
  }

  function renderNextPreview() {
    nextCtx.fillStyle = '#0f0f1a';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    const cells = SHAPES[nextType];
    const shapeW = (Math.max(...cells.map(([x]) => x)) + 1) * NEXT_CELL;
    const shapeH = (Math.max(...cells.map(([, y]) => y)) + 1) * NEXT_CELL;
    const offsetX = (nextCanvas.width - shapeW) / 2;
    const offsetY = (nextCanvas.height - shapeH) / 2;

    nextCtx.fillStyle = COLORS[nextType];
    cells.forEach(([x, y]) => {
      nextCtx.fillRect(offsetX + x * NEXT_CELL, offsetY + y * NEXT_CELL, NEXT_CELL - 1, NEXT_CELL - 1);
    });
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

  function tryRotate(direction = 1) {
    if (gameOver) return;
    const rotated = rotatePiece(current, direction);
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

  function bindPressButton(id, action) {
    const el = document.getElementById(id);
    const trigger = (e) => {
      e.preventDefault();
      handleTouchAction(action);
    };
    // touchstart fires immediately and, via preventDefault, suppresses the
    // trailing synthetic click so the action doesn't fire twice on touch devices
    el.addEventListener('touchstart', trigger, { passive: false });
    el.addEventListener('click', trigger);
  }

  bindPressButton('btn-left', () => tryMove(-1, 0));
  bindPressButton('btn-right', () => tryMove(1, 0));
  bindPressButton('btn-rotate-ccw', () => tryRotate(-1));
  bindPressButton('btn-rotate-cw', () => tryRotate(1));
  bindPressButton('btn-down', softDrop);
  bindPressButton('btn-drop', hardDrop);

  document.addEventListener('keydown', handleKeydown);
  restartBtn.addEventListener('click', startGame);
  restartAnytimeBtn.addEventListener('click', startGame);

  window.addEventListener('resize', fitBoardToViewport);
  window.addEventListener('orientationchange', fitBoardToViewport);

  highScore = loadHighScore();
  renderHighScore();

  fitBoardToViewport();
  startGame();
})();
