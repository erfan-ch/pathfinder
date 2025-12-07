"use strict";

const board = document.getElementById("board");
const clearPathBtn = document.getElementById("clearPath");
const clearBoardBtn = document.getElementById("clearBoard");
let cells;
let matrix;
const navOptions = document.querySelectorAll(".nav-menu>li>a");
const visualizeBtn = document.getElementById("visualize");
let dropOptions = null;
let pixelSize = 22;
let speed = "normal";
let algorithm = "BFS";
let row, col;
let surroundingWall = null;
const generateMazeBtn = document.getElementById("generateMazeBtn");
let source_Cordinate;
let target_Cordinate;

const renderBoard = function (cellWidth = 22) {
  matrix = [];
  const root = document.documentElement;
  root.style.setProperty("--cell-width", `${cellWidth}px`);
  row = Math.floor(board.clientHeight / cellWidth);
  col = Math.floor(board.clientWidth / cellWidth);
  board.innerHTML = "";
  cells = [];

  for (let i = 0; i < row; i++) {
    const rowArr = [];
    const rowElement = document.createElement("div");
    rowElement.classList.add("row");
    rowElement.setAttribute("id", `${i}`);

    for (let j = 0; j < col; j++) {
      const colElement = document.createElement("div");
      colElement.classList.add("col");
      colElement.setAttribute("id", `${i}-${j}`);
      cells.push(colElement);
      rowArr.push(colElement);
      rowElement.appendChild(colElement);
    }
    matrix.push(rowArr);
    board.appendChild(rowElement);
  }
  source_Cordinate = set("source");
  target_Cordinate = set("target");
};

renderBoard();

const removeActive = function (elements, parent = false) {
  elements.forEach((element) => {
    if (parent) element = element.parentElement;
    element.classList.remove("active");
  });
};

const toggleDropOption = function (target) {
  dropOptions.forEach((dropOption) => {
    dropOption.addEventListener("click", () => {
      removeActive(dropOptions);
      dropOption.classList.add("active");
      if (target === "pixel") {
        pixelSize = Number(dropOption.textContent.replace("px", ""));
        renderBoard(pixelSize);
        addEventToCells();
      } else if (target === "speed") {
        speed = dropOption.textContent;
      } else {
        algorithm = dropOption.textContent.split(" ")[0];
        visualizeBtn.textContent = `visualize ${algorithm}`;
      }
      removeActive(navOptions, true);
    });
  });
};

navOptions.forEach((navOption) => {
  navOption.addEventListener("click", (e) => {
    const li = navOption.parentElement;
    if (li.classList.contains("active")) {
      li.classList.remove("active");
      return;
    }
    removeActive(navOptions, true);
    li.classList.add("active");
    if (li.classList.contains("drop-box")) {
      dropOptions = li.querySelectorAll(".drop-menu>li");
      toggleDropOption(navOption.textContent);
    }
  });
});

document.addEventListener("click", (e) => {
  const navMenu = document.querySelector(".nav-menu");
  if (!navMenu.contains(e.target)) {
    removeActive(navOptions, true);
  }
});

// Board interaction

const falseDraggable = function () {
  cells.forEach((cell) => {
    cell.setAttribute("draggable", "false");
  });
};

function isValid(x, y) {
  return x >= 0 && y >= 0 && x < row && y < col;
}

function set(classname, x = -1, y = -1) {
  if (isValid(x, y)) {
    matrix[x][y].classList.add(classname);
  } else {
    x = Math.floor(Math.random() * row);
    y = Math.floor(Math.random() * col);
    matrix[x][y].classList.add(classname);
  }
  return { x, y };
}

let isDrawing = false;
let isDragging = false;
let dragPoint = null;

const pointerdown = function (e) {
  e.preventDefault();
  falseDraggable();
  if (e.target.classList.contains("source")) {
    dragPoint = "source";
    isDragging = true;
  } else if (e.target.classList.contains("target")) {
    dragPoint = "target";
    isDragging = true;
  } else {
    isDrawing = true;
  }
  console.log("row: ", row);
  console.log("col: ", col);
};

const pointermove = function (e) {
  e.preventDefault();
  falseDraggable();
  if (isDrawing) {
    e.target.classList.add("wall");
  } else if (dragPoint && isDragging) {
    cells.forEach((cell) => {
      cell.classList.remove(`${dragPoint}`);
    });
    e.target.classList.add(`${dragPoint}`);
    const cordinate = e.target.id.split("-");

    if (dragPoint === "source") {
      source_Cordinate.x = +cordinate[0];
      source_Cordinate.y = +cordinate[1];
    } else if (dragPoint === "target") {
      target_Cordinate.x = +cordinate[0];
      target_Cordinate.y = +cordinate[1];
    }
  }
};

const pointerup = function () {
  isDragging = false;
  isDrawing = false;
  dragPoint = null;
};
board.addEventListener("pointerup", pointerup);

const addEventToCells = function () {
  cells.forEach((cell) => {
    cell.addEventListener("pointerdown", pointerdown);
    cell.addEventListener("pointermove", pointermove);
    cell.addEventListener("click", (e) => {
      if (isDragging) return;
      e.target.classList.toggle("wall");
    });
  });
};

addEventToCells();

const clearPath = function () {
  cells.forEach((cell) => {
    cell.classList.remove("path");
    cell.classList.remove("visited");
  });
};

const clearBoard = function () {
  cells.forEach((cell) => {
    cell.classList.remove("wall");
    cell.classList.remove("visited");
    cell.classList.remove("path");
  });
};

clearPathBtn.addEventListener("click", clearPath);
clearBoardBtn.addEventListener("click", clearBoard);

// ===========================================
// ============= Generate Maze ===============
// ===========================================

let wallToAnimate;

function generateMaze(
  rowStart,
  rowEnd,
  colStart,
  colEnd,
  surroundingWall,
  orientation
) {
  if (rowStart > rowEnd || colStart > colEnd) return;
  if (!surroundingWall) {
    for (let i = 0; i < col; i++) {
      if (
        !matrix[0][i].classList.contains("source") &&
        !matrix[0][i].classList.contains("target")
      )
        wallToAnimate.push(matrix[0][i]);
      if (
        !matrix[row - 1][i].classList.contains("source") &&
        !matrix[row - 1][i].classList.contains("target")
      )
        wallToAnimate.push(matrix[row - 1][i]);
    }

    for (let i = 0; i < row; i++) {
      if (
        !matrix[i][0].classList.contains("source") &&
        !matrix[i][0].classList.contains("target")
      )
        wallToAnimate.push(matrix[i][0]);
      if (
        !matrix[i][col - 1].classList.contains("source") &&
        !matrix[i][col - 1].classList.contains("target")
      )
        wallToAnimate.push(matrix[i][col - 1]);
    }

    surroundingWall = true;
  }

  if (orientation === "horizontal") {
    let possibleRows = [];
    for (let i = rowStart; i <= rowEnd; i += 2) {
      possibleRows.push(i);
    }

    let possibleCols = [];
    for (let i = colStart - 1; i <= colEnd + 1; i += 2) {
      if (i > 0 && i < col - 1) possibleCols.push(i);
    }

    const currentRow =
      possibleRows[Math.floor(Math.random() * possibleRows.length)];
    const randomCol =
      possibleCols[Math.floor(Math.random() * possibleCols.length)];

    for (let i = colStart - 1; i <= colEnd + 1; i++) {
      const cell = matrix[currentRow][i];
      if (
        !cell ||
        i === randomCol ||
        cell.classList.contains("source") ||
        cell.classList.contains("target")
      ) {
        continue;
      }

      wallToAnimate.push(cell);
    }
    //upper subdivision
    generateMaze(
      rowStart,
      currentRow - 2,
      colStart,
      colEnd,
      surroundingWall,
      currentRow - 2 - rowStart > colEnd - colStart ? "horizontal" : "vertical"
    );

    //bottom subdivision
    generateMaze(
      currentRow + 2,
      rowEnd,
      colStart,
      colEnd,
      surroundingWall,
      rowEnd - currentRow + 2 > colEnd - colStart ? "horizontal" : "vertical"
    );
  } else {
    let possibleCols = [];
    for (let i = colStart; i <= colEnd; i += 2) {
      possibleCols.push(i);
    }

    let possibleRows = [];
    for (let i = rowStart - 1; i <= rowEnd + 1; i += 2) {
      if (i > 0 && i < row - 1) possibleRows.push(i);
    }

    const currentCol =
      possibleCols[Math.floor(Math.random() * possibleCols.length)];
    const randomRow =
      possibleRows[Math.floor(Math.random() * possibleRows.length)];

    for (let i = rowStart - 1; i <= rowEnd + 1; i++) {
      if (!matrix[i]) continue;
      const cell = matrix[i][currentCol];

      if (
        i === randomRow ||
        cell.classList.contains("source") ||
        cell.classList.contains("target")
      )
        continue;

      wallToAnimate.push(cell);
    }

    generateMaze(
      rowStart,
      rowEnd,
      colStart,
      currentCol - 2,
      surroundingWall,
      rowEnd - rowStart > currentCol - 2 - colStart ? "horizontal" : "vertical"
    );
    generateMaze(
      rowStart,
      rowEnd,
      currentCol + 2,
      colEnd,
      surroundingWall,
      rowEnd - rowStart > colEnd - currentCol + 2 ? "horizontal" : "vertical"
    );
  }
}

generateMazeBtn.addEventListener("click", () => {
  wallToAnimate = [];
  generateMaze(0, row - 1, 0, col - 1, false, "horizontal");
  animate(wallToAnimate, "wall");
});

// ===========================================
// ============= path finding🏁 ==============
// ===========================================

let visitedCell;
let pathToAnimate;

const BFS = function () {
  const queue = [];
  const visited = new Set();
  const parent = new Map();

  queue.push(source_Cordinate);
  visited.add(`${source_Cordinate.x}-${source_Cordinate.y}`);

  while (queue.length > 0) {
    const current = queue.shift();
    visitedCell.push(matrix[current.x][current.y]);

    if (current.x === target_Cordinate.x && current.y === target_Cordinate.y) {
      getPath(parent, target_Cordinate);
      return;
    }

    const neighbours = [
      { x: current.x - 1, y: current.y }, // up
      { x: current.x, y: current.y + 1 }, // right
      { x: current.x + 1, y: current.y }, // bottom
      { x: current.x, y: current.y - 1 }, // left
    ];

    for (const neighbour of neighbours) {
      const key = `${neighbour.x}-${neighbour.y}`;
      if (
        isValid(neighbour.x, neighbour.y) &&
        !visited.has(key) &&
        !matrix[neighbour.x][neighbour.y].classList.contains("wall")
      ) {
        queue.push(neighbour);
        visited.add(key);
        parent.set(key, current); // child, parent
      }
    }
  }
};

const animate = function (elements, className) {
  let delay = 6;
  if (className === "path") delay *= 3.5;
  for (let i = 0; i < elements.length; i++) {
    setTimeout(() => {
      elements[i].classList.remove("visited");
      elements[i].classList.add(className);
      if (i === elements.length - 1 && className === "visited") {
        animate(pathToAnimate, "path");
      }
    }, delay * i);
  }
};

const getPath = function (parent, target) {
  if (!target) return;
  pathToAnimate.push(matrix[target.x][target.y]);

  const p = parent.get(`${target.x}-${target.y}`);
  getPath(parent, p);
};

visualizeBtn.addEventListener("click", () => {
  visitedCell = [];
  pathToAnimate = [];
  BFS();
  animate(visitedCell, "visited");
});
