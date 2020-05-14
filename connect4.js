/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 1; // active player: 1 or 2
let board = []; // array of rows, each row is array of cells  (board[y][x])

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

const newGameButton = document.getElementById('new-game');
newGameButton.addEventListener('click', handleNewGame);


function makeBoard() {
  const colArray = [];

  const rowArray = []
  for(let i = 0; i < WIDTH; i++) {
    rowArray.push(null);
  }

  for(let j = 0; j < HEIGHT; j++){
    const cloneArr = [...rowArray];
    colArray.push(cloneArr);
  }

  return colArray;
}

/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {
  // Retrieve the html table in the DOM where the game board will be generated
  const htmlBoard = document.getElementById("board");

  // Create the first row of the game board assigning css stying attributes and an event listener for the entire table row
  const top = document.createElement("tr");
  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);         // Gameplay listener function

  // Fill the first row with table data elements
  for (let x = 0; x < WIDTH; x++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);
  }
  // Append the completed first row to the html document
  htmlBoard.append(top);


  // Append a new row to the game board with the quantity of tds subelements necessary to match the underlying dataset
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);           // Sets as unique identifier for each td cell in the table
      row.append(cell);
    }
    htmlBoard.append(row);
  }
}


/** findSpotForCol: given column x, return top empty y (null if filled) */
function findSpotForCol(x) {
  for (let index = HEIGHT - 1; index >= 0; index--) {
    if(board[index][x] === null) {
      return index;
    }
  }

  return null;
}


//** dropGamePiece: Animate game piece movement */
function dropGamePiece(y, x, div) {
  const endElement = document.getElementById(`${y}-${x}`);
  const posEnd = endElement.offsetTop;
  let posTop = 0;

  const intervalID = setInterval(movePiece, 5);

  function movePiece () {
    posTop += 4;
    if (posTop >= posEnd) {
      div.style.top = posEnd + 'px';
      clearInterval(intervalID);
      return;
    }
    div.style.top = posTop + 'px';
  }
}


/** placeInTable: update DOM to place piece into HTML table of board */
function placeInTable(y, x) {
  // Create a new div element to insert into the table representing the player's move
  const newDiv = document.createElement('div');
  newDiv.classList.add('piece');

  // Assign the piece a color depending on which player made the last move
  if (board[y][x] === 1) {
    newDiv.classList.add('p1');
  } else {
    newDiv.classList.add('p2');
  }

  // Assign appropriate size & set starting location
  newDiv.style.top = '0px';
  newDiv.style.width = '40px';
  newDiv.style.height = '40px';

  // Append the element into the appropriate table location defined by a string 'yLoc-xLoc' formatted as '0-0' ... 'n-n'
  const destCell = document.getElementById(`${y}-${x}`);
  destCell.append(newDiv);

  dropGamePiece(y, x, newDiv);
}


/** endGame: announce game end */
function endGame(msg) { 
  document.getElementById('column-top').removeEventListener('click', handleClick);
  setTimeout(() => alert(msg), 500);
}

function switchPlayers() {
  currPlayer = currPlayer === 1 ? 2 : 1;
  const playerElement = document.querySelector('#current-player span');
  playerElement.innerText = currPlayer;
  playerElement.classList.toggle('p1');
  playerElement.classList.toggle('p2');
}


/** handleClick: handle click of column top to play piece */
function handleClick(evt) {
  // get x from ID of clicked cell
  const x = +evt.target.id;

  // get next spot in column (if none, ignore click)
  const y = findSpotForCol(x);
  if (y === null) {
    return;
  }

  // place piece in board and add to HTML table
  board[y][x] = currPlayer;
  placeInTable(y, x);

  // check for win
  if (checkForWin()) {
    return endGame(`Player ${currPlayer} won!`);
  }

  // check for tie
  if (board[0].every(value => value > 0)) {
    return endGame(`Game Over - Tie!`);
  }

  switchPlayers();
}


/** checkForWin: check board cell-by-cell for "does a win start here?" */
function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer

    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  }

  // Note: The array being iterated over has the indicies [y,x] as follows:
  /*
  [0,0], [0,1], [0,2] ... [0,n]
  [1,0]
  [2,0]
  ...
  [n,0]
  */

  for (let y = 0; y < HEIGHT; y++) {                                              // Starting from [0, 0] in your matrix loop through every possible horizontal, vertical, diagonal down and right, and diagonal down and left combination on the board
    for (let x = 0; x < WIDTH; x++) {
      const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];                   // Create an array consisting of every location starting from your current x & y coordinates progressing horizontally to the right
      const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];                    // Create an array consisting of every location starting from your current x & y coordinates progressing vertically down
      const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];      // Create an array consisting of every location starting from your current x & y combining an horizontal motion to the right with a downward vertical motion
      const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];      // Create an array consisting of every location starting from your current x & y combining an horizontal motion to the left with a downward vertical motion

      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {            // Call the function above to check that every x & y coordinate is within the allowed range and is the current player.  If all 4 return true for any of the array combinations resulting in a completed game.
        return true;
      }
    }
  }
}

function handleNewGame() {
  const oldGameBoard = document.querySelectorAll('#board tr');

  for (let row of oldGameBoard) {
    row.remove();
  }

  currPlayer = 1;
  board = makeBoard();
  makeHtmlBoard();

  const playerElement = document.querySelector('#current-player span');
  playerElement.innerText = currPlayer; 
  if (playerElement.classList.contains('p1')) {
    return;
  }
  playerElement.classList.add('p1');
  playerElement.classList.remove('p2');
}


handleNewGame();