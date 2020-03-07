import React from 'react'
import {makeStyles} from "@material-ui/styles";


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
        flex: '1 0 0',
        userSelect: 'none',
    },
    cellContent: {
        display: 'flex',
        alignSelf: 'center',
    }
})

type JustGrid = {
    cells: string[]
    cols: number
    rows: number
}

export const JustGrid = ({cells, cols, rows}: JustGrid) => {
    const classes = useStyles()

    const getRow = (rowIndex: number) => {
        let rowCells = []
        for (let i = 0; i < cols; i++) {
            let cellIndex = (rowIndex * cols) + i
            let color = cells[cellIndex]
            rowCells.push(<div className={classes.cell} key={cellIndex} style={{backgroundColor: `${color}`}}></div>)
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