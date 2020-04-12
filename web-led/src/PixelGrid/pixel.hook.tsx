import React, {useState} from 'react'

const initialCols = 11
const initialRows = 11
const initialCells: string[] = []

for (let i = 0; i < initialRows; i++) {
    for (let j = 0; j < initialCols; j++) {
        const color = '#000000'
        initialCells.push(color)
    }
}

const useCells = () => {
    const [cells, setCells] = useState<string[]>(initialCells)
    const [cols, setCols] = useState<number>(initialCols)
    const [rows, setRows] = useState<number>(initialRows)

    const clearCells = () => {
        setCells(initialCells)
    }

    return {cells, setCells, cols, setCols, rows, setRows, clearCells}
}

export default useCells