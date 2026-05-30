(() => {
  const state = {
    board: Array(9).fill(""),
    currentPlayer: "X",
    mode: "human",
    winner: null,
    winningLine: [],
    draw: false,
    scores: {
      X: 0,
      O: 0,
      draw: 0
    }
  };

  const WINNING_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  const boardElement = document.getElementById("board");
  const turnLabel = document.getElementById("turnLabel");
  const statusText = document.getElementById("statusText");
  const scoreX = document.getElementById("scoreX");
  const scoreO = document.getElementById("scoreO");
  const scoreDraw = document.getElementById("scoreDraw");
  const restartButton = document.getElementById("restartButton");
  const resetScoreButton = document.getElementById("resetScoreButton");
  const twoPlayerModeButton = document.getElementById("twoPlayerMode");
  const computerModeButton = document.getElementById("computerMode");

  function init() {
    renderBoard();
    bindEvents();
    updateUI();
  }

  function renderBoard() {
    boardElement.innerHTML = "";

    state.board.forEach((value, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cell";
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-label", `Cell ${index + 1}`);
      button.dataset.index = String(index);
      button.textContent = value;

      if (value === "X") {
        button.classList.add("x");
      }

      if (value === "O") {
        button.classList.add("o");
      }

      if (state.winningLine.includes(index)) {
        button.classList.add("win");
      }

      if (state.winner || state.draw || value) {
        button.disabled = true;
      }

      boardElement.appendChild(button);
    });
  }

  function bindEvents() {
    boardElement.addEventListener("click", handleBoardClick);
    restartButton.addEventListener("click", restartRound);
    resetScoreButton.addEventListener("click", resetScores);
    twoPlayerModeButton.addEventListener("click", () => setMode("human"));
    computerModeButton.addEventListener("click", () => setMode("computer"));
    document.addEventListener("keydown", handleKeydown);
  }

  function handleBoardClick(event) {
    const cell = event.target.closest(".cell");
    if (!cell || cell.disabled) {
      return;
    }

    if (state.mode === "computer" && state.currentPlayer === "O") {
      return;
    }

    playMove(Number(cell.dataset.index));
  }

  function handleKeydown(event) {
    if (event.key === "r" || event.key === "R") {
      restartRound();
      return;
    }

    if (event.key >= "1" && event.key <= "9") {
      const index = Number(event.key) - 1;
      if (!state.board[index] && !state.winner && !state.draw) {
        playMove(index);
      }
    }
  }

  function playMove(index) {
    if (state.board[index] || state.winner || state.draw) {
      return;
    }

    state.board[index] = state.currentPlayer;
    const result = evaluateBoard();

    if (result.winner) {
      state.winner = result.winner;
      state.winningLine = result.line;
      state.scores[result.winner] += 1;
      state.draw = false;
      statusText.textContent = `Player ${result.winner} wins the round.`;
    } else if (result.draw) {
      state.draw = true;
      state.scores.draw += 1;
      statusText.textContent = "Round ended in a draw.";
    } else {
      state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";
      statusText.textContent = `Player ${state.currentPlayer}'s turn.`;
    }

    updateUI();

    if (state.mode === "computer" && !state.winner && !state.draw && state.currentPlayer === "O") {
      window.setTimeout(playComputerMove, 260);
    }
  }

  function playComputerMove() {
    if (state.winner || state.draw || state.currentPlayer !== "O") {
      return;
    }

    const move = findBestMove();
    if (move === null) {
      return;
    }

    playMove(move);
  }

  function findBestMove() {
    let bestScore = -Infinity;
    let bestMove = null;

    state.board.forEach((value, index) => {
      if (value) {
        return;
      }

      state.board[index] = "O";
      const score = minimax(state.board, 0, false);
      state.board[index] = "";

      if (score > bestScore) {
        bestScore = score;
        bestMove = index;
      }
    });

    return bestMove;
  }

  function minimax(board, depth, isMaximizing) {
    const outcome = evaluateBoard(board);

    if (outcome.winner === "O") {
      return 10 - depth;
    }

    if (outcome.winner === "X") {
      return depth - 10;
    }

    if (outcome.draw) {
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      board.forEach((value, index) => {
        if (value) {
          return;
        }

        board[index] = "O";
        const score = minimax(board, depth + 1, false);
        board[index] = "";
        bestScore = Math.max(bestScore, score);
      });
      return bestScore;
    }

    let bestScore = Infinity;
    board.forEach((value, index) => {
      if (value) {
        return;
      }

      board[index] = "X";
      const score = minimax(board, depth + 1, true);
      board[index] = "";
      bestScore = Math.min(bestScore, score);
    });
    return bestScore;
  }

  function evaluateBoard(board = state.board) {
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      const first = board[a];
      if (first && first === board[b] && first === board[c]) {
        return { winner: first, line };
      }
    }

    if (board.every(Boolean)) {
      return { draw: true };
    }

    return { winner: null, draw: false, line: [] };
  }

  function restartRound() {
    state.board = Array(9).fill("");
    state.currentPlayer = "X";
    state.winner = null;
    state.winningLine = [];
    state.draw = false;
    statusText.textContent = "Player X starts.";
    updateUI();
  }

  function setMode(mode) {
    state.mode = mode;
    if (mode === "computer" && state.currentPlayer === "O" && !state.winner && !state.draw) {
      window.setTimeout(playComputerMove, 260);
    }
    updateUI();
  }

  function resetScores() {
    state.scores = {
      X: 0,
      O: 0,
      draw: 0
    };
    restartRound();
  }

  function updateUI() {
    renderBoard();
    turnLabel.textContent = state.winner ? `Winner ${state.winner}` : state.draw ? "Draw" : state.currentPlayer;
    turnLabel.classList.toggle("turn-active", !state.draw && !state.winner);
    turnLabel.classList.toggle("draw-state", state.draw);
    turnLabel.classList.toggle("winner-state", Boolean(state.winner));
    twoPlayerModeButton.classList.toggle("active", state.mode === "human");
    computerModeButton.classList.toggle("active", state.mode === "computer");
    twoPlayerModeButton.setAttribute("aria-pressed", String(state.mode === "human"));
    computerModeButton.setAttribute("aria-pressed", String(state.mode === "computer"));
    scoreX.textContent = String(state.scores.X);
    scoreO.textContent = String(state.scores.O);
    scoreDraw.textContent = String(state.scores.draw);

    if (state.winner) {
      statusText.textContent = `Player ${state.winner} wins the round.`;
    } else if (state.draw) {
      statusText.textContent = "Round ended in a draw.";
    } else if (state.mode === "computer") {
      statusText.textContent = state.currentPlayer === "X" ? "Your turn against the computer." : "Computer is thinking...";
    }
  }

  init();
})();
