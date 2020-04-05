import React, {useState} from 'react'

const initialCols = 11
const initialRows = 11
const initialCells: string[] = []

for (let i = 0; i < initialRows; i++) {
    for (let j = 0; j < initialCols; j++) {
        const color = '#000'
        initialCells.push(color)
    }
}

const usePixel = () => {
    const [cells, setCells] = useState<string[]>(initialCells)
    const [cols, setCols] = useState<number>(initialCols)
    const [rows, setRows] = useState<number>(initialRows)

    return {cells, setCells, cols, setCols, rows, setRows}
}

export default usePixel