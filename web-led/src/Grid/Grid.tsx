import React from 'react';
import {makeStyles} from '@material-ui/styles'

const useStyles = makeStyles({
    grid: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexFlow: 'column',
        flex: '1 1 0'
    },
    row: {
        display: 'flex',
        flex: '1 1 0'
    },
    cell: {
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        flex: '1 1 0',
        userSelect: 'none',
    },
    cellContent: {
        display: 'flex',
        alignSelf: 'center',
        border: '2px solid black'
    }
})

type Grid = {
    cols: number
    rows: number
    cells: string[]
    onCellClick: (index: number) => void
    onCellEnter: (index: number) => void
    onCellUp: (index: number) => void
    onCellDown: (index: number) => void
    mouseDown: boolean
}

export const Grid = ({cols, rows, cells, onCellClick, onCellEnter, onCellUp, onCellDown}: Grid) => {
    const classes = useStyles()

    // Go through each col in a row
    const getRow = (rowIndex: number) => {
        let rowCells = []
        for (let i = 0; i < cols; i++) {
            let cellIndex = (rowIndex * cols) + i
            let color = cells[cellIndex]
            rowCells.push(<div className={classes.cell} key={cellIndex} style={{backgroundColor: `${color}`}}
                               onMouseDown={() => {
                                   onCellDown(cellIndex)
                               }}

                               onMouseUp={() => {
                                   onCellUp(cellIndex)
                               }}
                               onClick={() => onCellClick(cellIndex)}
                               onMouseEnter={() => {
                                   onCellEnter(cellIndex)
                               }}>
                <div className={classes.cellContent}>{cellIndex}</div>
            </div>)
        }
        return rowCells
    }

    // Get each row
    const getGrid = () => {
        let grid = []
        for (let i = 0; i < rows; i++) {
            grid.push(<div key={`row ${i}`} className={classes.row}>{getRow(i)}</div>)
        }
        return grid
    }

    return (
        <div className={classes.grid}>
            {getGrid()}
        </div>
    )
}