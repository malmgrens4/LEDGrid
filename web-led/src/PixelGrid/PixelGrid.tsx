import React, {useEffect, useState, useRef} from 'react';
import {makeStyles} from '@material-ui/styles'
import { useEventListener } from "../EventListenerHook/eventListener";
import Autosizer from 'react-virtualized-auto-sizer'

const useStyles = makeStyles({
    grid: {
        border: '1px solid blue',
        display: 'flex',
        flex: '1',
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
        border: '1px solid'
    },
    cellContent: {
        display: 'flex',
        alignSelf: 'center',
    }
})

type PixelGrid = {
    cols: number
    rows: number
    cells: string[]
    onCellClick: (index: number) => void
    onCellEnter: (index: number) => void
    onCellUp: (index: number) => void
    onCellDown: (index: number) => void
    mouseDown: boolean
}

export const PixelGrid = ({cols, rows, cells, onCellClick, onCellEnter, onCellUp, onCellDown}: PixelGrid) => {
    const classes = useStyles()

    const [width, setWidth] = useState<string>('800px')
    const [height, setHeight] = useState<string>('800px')

    useEffect(() => {
        resize()
    }, [])

    const resize = () => {
        const gridEl = document.getElementById("grid")
        const elWidth = gridEl!.offsetWidth
        const elHeight = gridEl!.offsetHeight
        setWidth(Math.min(elWidth, elHeight) + 'px')
        setHeight(Math.min(elWidth, elHeight) + 'px')
    }

    useEventListener('resize', resize)

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
                <div className={classes.cellContent}></div>
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
        <div id="grid" style={{height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start'}}>
                <div style={{height, width, display: 'flex', flexFlow: 'column'}}>
                    {getGrid()}
                </div>
        </div>
    )
}