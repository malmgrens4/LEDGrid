export const getNeighbors = (
  cells: string[],
  index: number,
  cols: number,
  rows: number
) => {
  // check if at a natural boundary - then check if the
  let neighbors: number[] = [];
  for (let i = -1; i <= 1; i++) {
    const { x, y } = { x: index % cols, y: Math.floor(index / cols) };
    console.log(x, y);
    if (!(y === 0 && i < 0) && !(y === rows - 1 && i > 0)) {
      for (let j = -1; j <= 1; j++) {
        if (!(x === 0 && j < 0) && !(x === cols - 1 && j > 0)) {
          if (!(i === 0 && j === 0)) {
            //If the grid is not a square the adjacent squares could cause a failure
            try {
              let neighbor = (y + i) * rows + (x + j);
              if (cells[neighbor] === cells[index]) {
                // the one would be replaced if weights were introduced
                neighbors.push(neighbor);
              }
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
    }
  }
  return neighbors;
};

export const getNeighborChain = (
  cells: string[],
  index: number,
  cols: number,
  rows: number
) => {
  // go through each neighbor, if it's the same color push it onto the stack
  // when it's popped off the stack add it to the list of visited then that list is returned
  let visited: number[] = [];
  let stack: number[] = [];
  stack.push(index);
  while (stack.length > 0) {
    let current: number = stack.pop()!;
    if (!visited.includes(current)) {
      visited.push(current);
      let color: string = cells[current];
      getNeighbors(cells, current, cols, rows).map((neighbor: number) => {
        if (cells[neighbor] === color) {
          stack.push(neighbor);
        }
      });
    }
  }
  return visited;
};

export const hexToRGB = (hex: string = "#000000") => {
  let r = 0;
  let g = 0;
  let b = 0;
  if (hex.length === 4) {
    hex = hex.substring(1);
  }
  if (hex.length === 3) {
    r = parseInt(hex[0], 16);
    g = parseInt(hex[1], 16);
    b = parseInt(hex[2], 16);
  }
  if (hex.length === 7) {
    hex = hex.substring(1);
  }
  if (hex.length === 6) {
    r = parseInt(hex[0] + hex[1], 16);
    g = parseInt(hex[2] + hex[3], 16);
    b = parseInt(hex[4] + hex[5], 16);
  }

  return { red: r, green: g, blue: b };
};

export const RGBToHex = (rgb: { red: number; blue: number; green: number }) => {
  const { red, green, blue } = rgb;
  let redHex = red.toString(16).padStart(2, "0");
  let greenHex = green.toString(16).padStart(2, "0");
  let blueHex = blue.toString(16).padStart(2, "0");
  return "#" + redHex + greenHex + blueHex;
};
