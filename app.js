"use strict";

const board = document.getElementById("board");
let cells;
const matrix = [];
const navOptions = document.querySelectorAll(".nav-menu>li>a");
const visualizeBtn = document.getElementById("visualize");
let dropOptions = null;
let pixelSize = 22;
let speed = "normal";
let algorithm = "BFS";
let row, col;
let surroundingWall = null;

const renderBoard = function (cellWidth = 22) {
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

const isValid = function (x, y) {
  return x >= 0 && y >= 0 && x < row && y < col;
};

const set = function (classname, x = -1, y = -1) {
  if (isValid(x, y)) {
    matrix[x][y].classList.add(classname);
  } else {
    x = Math.floor(Math.random() * row);
    y = Math.floor(Math.random() * col);
    matrix[x][y].classList.add(classname);
  }
  return { x, y };
};

let source_Cordinate = set("source");
let target_Cordinate = set("target");

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
  console.log("row: ",row);
  console.log("col: ",col);
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
cells.forEach((cell) => {
  cell.addEventListener("pointerdown", pointerdown);
  cell.addEventListener("pointermove", pointermove);
  cell.addEventListener("click", (e) => {
    if (isDragging) return;
    e.target.classList.toggle("wall");
  });
});

const clearPath = function () {
  cells.forEach((cell) => {
    cell.classList.remove("path");
  });
};

const clearWall = function () {
  cells.forEach((cell) => {
    cell.classList.remove("wall");
  });
};

// ===========================================
// ============= Generate Maze ===============
// ===========================================

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
        matrix[0][i].classList.add("wall");
      if (
        !matrix[row - 1][i].classList.contains("source") &&
        !matrix[row - 1][i].classList.contains("target")
      )
        matrix[row - 1][i].classList.add("wall");
    }

    for (let i = 0; i < row; i++) {
      if (
        !matrix[i][0].classList.contains("source") &&
        !matrix[i][0].classList.contains("target")
      )
        matrix[i][0].classList.add("wall");
      if (
        !matrix[i][col - 1].classList.contains("source") &&
        !matrix[i][col - 1].classList.contains("target")
      )
        matrix[i][col - 1].classList.add("wall");
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

      cell.classList.add("wall");
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

      cell.classList.add("wall");
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

generateMaze(0, row - 1, 0, col - 1, false, "horizontal");

// ===========================================
// ============= path finding🏁 ==============
// ===========================================



