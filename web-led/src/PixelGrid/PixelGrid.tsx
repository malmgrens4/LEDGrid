import React, {useState} from 'react';
import {makeStyles} from '@material-ui/styles'
import { useEventListener } from "../EventListenerHook/eventListener";
import Autosizer from 'react-virtualized-auto-sizer'

const useStyles = makeStyles({
    grid: {
        border: '1px solid pink',
        display: 'flex',
        flexFlow: 'column',
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
    const resize = (event: any) => {
        console.log(event)
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
        <Autosizer>
            {({height, width}) => (
                <div className={classes.grid} style={{height: Math.min(height, width), width: Math.min(height, width)}}>
                    {getGrid()}
                </div>
            )}
        </Autosizer>
    )
}