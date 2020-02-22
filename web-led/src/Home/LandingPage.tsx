import React, {useState} from 'react';
import {Grid} from '../Grid/Grid';
import {SketchPicker} from 'react-color'
import {makeStyles} from "@material-ui/styles";
import Paper from '@material-ui/core/Paper'
import Button from "@material-ui/core/Button";
import FormatColorFillIcon from '@material-ui/icons/FormatColorFill';
import BrushIcon from '@material-ui/icons/Brush';
import ColorizeIcon from '@material-ui/icons/Colorize';
import { Timebin } from '../Timebin/Timebin'

const useStyles = makeStyles({
    mainPage: {
        display: 'flex',
        height: '100%',
        width: '100%'
    },
    sidePanel: {
        alignContent: 'center',
        display: 'flex',
        borderRight: '2px solid',
        padding: '8px'
    },
    drawer: {
        display: 'flex',
        flex: '1 1 0',
        alignContent: 'center',
        flexFlow: 'column',
    },
    mainPanel: {
        display: 'flex',
        flex: '3 0 0',
        padding: '8px',
        flexFlow: 'column'
    },
    gridContainer: {},
    tools: {
        display: 'flex',
        flexFlow: 'column'
    }
})

const cols = 11
const rows = 11
const initialCells: string[] = []

for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        initialCells.push('#ff0000')
    }
}

const submitGridRequest = (curCells: string[]) => {
    const params = curCells.map(cell => cell.substring(1)).join(',')
    fetch(`http://192.168.0.228/colors/${params}`)
}

const getNeighborChain = (cells: string[], index: number) => {
    // go through each neighbor, if it's the same color push it onto the stack
    // when it's popped off the stack add it to the list of visited then that list is returned
    let visited: number[] = []
    let stack: number[] = []
    stack.push(index)
    while( stack.length > 0 ) {
        let current: number = stack.pop()!
        if(!visited.includes(current)) {
            visited.push(current)
            let color: string = cells[current]
            getNeighbors(cells, current).map((neighbor: number) => {
                if (cells[neighbor] === color) {
                    stack.push(neighbor)
                }
            })
        }
    }
    return visited

}

const getNeighbors = (cells: string[], index: number) => {
    // check if at a natural boundary - then check if the
    let neighbors: number[] = []
    for (let i = -1; i <= 1; i++) {
        const {x, y} = {x: index % cols, y: Math.floor(index / cols)}
        console.log(x, y)
        if(!(y === 0 && i < 0) && !(y === rows - 1 && i > 0)){
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

type tools = 'BRUSH' | 'BUCKET' | 'EYEDROP'

export const LandingPage = () => {
    const classes = useStyles()
    const [cells, setCells] = useState<string[]>(initialCells)
    const [color, setColor] = useState<string>('#00ff00')
    const [mouseDown, setMouseDown] = useState<boolean>(false)
    const [sideOpen, setSideOpen] = useState<boolean>(true)
    const [previous, setPrevious] = useState<string[][]>()
    const [tool, setTool] = useState<tools>('BRUSH')
    const [loop, setLoop] = useState<boolean>(false)

    const setCellColor = (index: number) => {
        setCells(oldCells => {
            const newCells = oldCells.slice();
            newCells[index] = color
            return newCells
        })
    }

    const setColorByCell = (index: number) => {
        setColor(cells[index])
    }


    const bucketPaint = (index: number) => {
        getNeighborChain(cells, index).map((cellIndex: number) => {setCellColor(cellIndex)})
    }

    const getOnClick = () => {
        switch(tool) {
            case "BRUSH":
                return setCellColor
            case "BUCKET":
                return bucketPaint
            case "EYEDROP":
                return setColorByCell
            default:
                return setCellColor
        }

    }

    return (
        <div className={classes.mainPage}>
            {sideOpen &&
            <Paper className={classes.sidePanel}>
                <div className={classes.drawer}>
                    <div style={{display: 'flex'}}>
                    <SketchPicker color={color} onChange={(newColor: any) => {
                        setColor(newColor.hex)
                    }}/>
                    <div className={classes.tools}>
                        <Button variant={tool === 'BUCKET' ? "contained" : "outlined"} onClick={() => setTool("BUCKET")}><FormatColorFillIcon/></Button>
                        <Button variant={tool === 'BRUSH' ? "contained" : "outlined"} onClick={() => setTool("BRUSH")}><BrushIcon/></Button>
                        <Button variant={tool === 'EYEDROP' ? "contained" : "outlined"} onClick={() => setTool("EYEDROP")}><ColorizeIcon/></Button>
                    </div>
                    </div>
                    <Button variant="outlined" color="primary" onClick={() => submitGridRequest(cells)}>Set LEDs</Button>
                    <Button variant="outlined" color="primary" onClick={() => setLoop(!loop)}>Loop {loop ? 'on' : 'off'}</Button>
                    <Timebin setState={() => {setCells(cells.slice())}} loop={loop} executeOnStart={() => {submitGridRequest(cells.slice())}}/>

                </div>
            </Paper>
            }
            <Paper className={classes.mainPanel} onMouseDown={() => {
                setMouseDown(true)
            }} onMouseUp={() => setMouseDown(false)}>
                <Grid cols={cols} rows={rows} cells={cells} onCellClick={getOnClick()} mouseDown={mouseDown}/>
            </Paper>
        </div>
    )

}