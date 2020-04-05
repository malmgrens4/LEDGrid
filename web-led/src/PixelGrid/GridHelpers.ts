export const getNeighbors = (cells: string[], index: number, cols: number, rows: number) => {
    // check if at a natural boundary - then check if the
    let neighbors: number[] = []
    for (let i = -1; i <= 1; i++) {
        const {x, y} = {x: index % cols, y: Math.floor(index / cols)}
        console.log(x, y)
        if (!(y === 0 && i < 0) && !(y === rows - 1 && i > 0)) {
            for (let j = -1; j <= 1; j++) {
                if (!(x === 0 && j < 0) && !(x === cols - 1 && j > 0)) {
                    if (!(i === 0 && j === 0)) {
                        //If the grid is not a square the adjacent squares could cause a failure
                        try {
                            let neighbor = ((y + i) * rows) + (x + j)
                            if (cells[neighbor] === cells[index]) {
                                // the one would be replaced if weights were introduced
                                neighbors.push(neighbor)
                            }
                        } catch (err) {
                            console.error(err)
                        }
                    }
                }
            }
        }
    }
    return neighbors
}

export const getNeighborChain = (cells: string[], index: number, cols: number, rows: number) => {
    // go through each neighbor, if it's the same color push it onto the stack
    // when it's popped off the stack add it to the list of visited then that list is returned
    let visited: number[] = []
    let stack: number[] = []
    stack.push(index)
    while (stack.length > 0) {
        let current: number = stack.pop()!
        if (!visited.includes(current)) {
            visited.push(current)
            let color: string = cells[current]
            getNeighbors(cells, current, cols, rows).map((neighbor: number) => {
                if (cells[neighbor] === color) {
                    stack.push(neighbor)
                }
            })
        }
    }
    return visited
}
