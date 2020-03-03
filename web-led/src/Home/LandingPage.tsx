import React, {useEffect, useState} from 'react';
import { PixelGrid } from '../PixelGrid/PixelGrid';
import Grid from '@material-ui/core/Grid'
import {SketchPicker} from 'react-color'
import {makeStyles} from "@material-ui/styles";
import Paper from '@material-ui/core/Paper'
import Button from "@material-ui/core/Button";
import FormatColorFillIcon from '@material-ui/icons/FormatColorFill';
import BrushIcon from '@material-ui/icons/Brush';
import ColorizeIcon from '@material-ui/icons/Colorize';
import {Timebin} from '../Timebin/Timebin'
import {useEventListener} from "../EventListenerHook/eventListener";
import {JustGrid} from "../JustGrid/JustGrid";

const useStyles = makeStyles({
    mainPage: {
        display: 'flex',
        height: '100%',
        width: '100%',
    },
    sidePanel: {
        alignContent: 'center',
        display: 'flex',
        borderRight: '2px solid',
        padding: '8px',
    },
    drawer: {
        display: 'flex',
        flex: '1 0 0',
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
        initialCells.push('#000000')
    }
}

const url = 'http://72.217.68.14:25566/colors'

const submitGridRequest = (curCells: string[]) => {
    const params = curCells.map(cell => cell.substring(1)).join(',')
    fetch(`${url}/${params}`)
}

const getNeighborChain = (cells: string[], index: number) => {
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

type tools = 'BRUSH' | 'BUCKET' | 'EYEDROP'

export const LandingPage = () => {
    const classes = useStyles()
    const [cells, setCells] = useState<string[]>(initialCells)
    const [color, setColor] = useState<string>('#00ff00')
    const [mouseDown, setMouseDown] = useState<boolean>(false)
    const [sideOpen, setSideOpen] = useState<boolean>(true)
    const [tool, setTool] = useState<tools>('BRUSH')
    const [loop, setLoop] = useState<boolean>(false)
    const [cellHistory, setCellHistory] = useState<string[][]>([])
    // The current drawing - in the case of dragging this will be the indexes being affected.
    const [undoStack, setUndoStack] = useState<any[]>([])
    const [redoStack, setRedoStack] = useState<any[]>([])
    const [currentImage, setCurrentImage] = useState<number[]>([])
    const [dragging, setDragging] = useState<boolean>()
    const [showShortcuts, setShowShortcuts] = useState<boolean>(false)
    // so when I start dragging I want to have a snapshot of the cells so my undo isn't just a series of individual cells but the whole stroke
    // So when the drag starts I need an event - when does the drag start?
    // As soon as it leaves the first cell clicked with the mouse still down
    // Then when someone undoes it I need to add a redo that reflects the current state (a callback that can setTheCells)

    const keyDown = (event: KeyboardEvent) => {
        console.log(`${event.ctrlKey} ${event.key}`)
        //CTRL-Z
        const ctrl = event.metaKey || event.ctrlKey
        const key = event.key

        if (ctrl) {
            setShowShortcuts(true)
        }

        if ((ctrl && event.shiftKey && key === 'z') || (ctrl && key === 'y')) {
            redo()
        } else if (ctrl && key === 'z') {
            console.log('undo')
            undo()
        } else if (event.shiftKey) {
            //grab object mode
        } else if (key === 'm') {
            setTool('BRUSH')
        } else if (key === 'b') {
            setTool('BUCKET')
        } else if (key === 'e') {
            setTool('EYEDROP')
        }
    }

    const keyUp = (event: KeyboardEvent) => {
        const ctrl = event.metaKey || event.ctrlKey
        console.log("key up")
        if (!ctrl) {
            setShowShortcuts(false)
        }
    }


    useEventListener('keydown', keyDown)
    useEventListener('keyup', keyUp)

    const undo = () => {
        // if we want to redo well be returning to the current state
        if (undoStack.length > 0) {
            setRedoStack(stack => {
                const newRedoStack = stack.slice()
                newRedoStack.push(() => setCells(cells.slice()))
                return newRedoStack
            })

            setUndoStack(stack => {
                const newUndoStack = stack.slice()
                newUndoStack.pop()()
                return newUndoStack
            })
        }

    }

    const redo = () => {
        // if we want to redo well be returning to the current state
        if (redoStack.length > 0) {
            setUndoStack(stack => {
                const newUndoStack = stack.slice()
                newUndoStack.push(() => setCells(cells.slice()))
                return newUndoStack
            })

            setRedoStack(stack => {
                const newRedoStack = stack.slice()
                newRedoStack.pop()()
                return newRedoStack
            })
        }

    }

    const setCellColor = (index: number) => {
        setCells(oldCells => {
            const newCells = oldCells.slice();
            newCells[index] = color
            submitGridRequest(newCells)
            return newCells
        })
    }

    const setColorByCell = (index: number) => {
        setColor(cells[index])
    }


    const bucketPaint = (index: number) => {
        getNeighborChain(cells, index).map((cellIndex: number) => {
            setCellColor(cellIndex)
        })
    }

    const getOnClick = () => {
        switch (tool) {
            case "BRUSH":
                return setCellColor
            case "BUCKET":
                return bucketPaint
            case "EYEDROP":
                return (index: number) => {
                    setColorByCell(index)
                    setTool("BRUSH")
                }
            default:
                return setCellColor
        }
    }

    const pushCellHistory = () => {
        console.log('Push history')

        setUndoStack(stack => {
            const newUndoStack = stack.slice()
            newUndoStack.push(() => {
                setCells(cells.slice())
            })
            return newUndoStack
        })

        setCellHistory(history => {
            const newHistory = history.slice()
            newHistory.push(cells.slice())
            return newHistory
        })

    }

    const getOnCellDown = () => {
        return () => {
            if (tool === 'BRUSH' || tool === 'BUCKET') {
                pushCellHistory()
            }
        }

    }

    const getOnCellUp = () => {
        // change to only on brush
        return () => {
            if (dragging) {
                setDragging(false)
            }
        }
    }

    const getOnCellEnter = () => {
        if (mouseDown) {
            if (!dragging) {
                setDragging(true)
            }
            switch (tool) {
                case "BRUSH":
                    return setCellColor
                default:
                    return (index: number) => {
                    }
            }
        }
        // if the mouse is up then we cap the capture for the currentImage

        return (index: number) => {
        }
    }

    const addToCurrentImage = (index: number) => {
        setCurrentImage(image => {
            const newImage = image.slice()
            newImage.push(index)
            return newImage
        })
    }

    const clearCells = () => {
        const newCells = []
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                newCells.push('#000000')
            }
        }
        setCells(newCells)
    }

    return (
        <Grid container alignItems="stretch" style={{height: '100%'}}>
            {sideOpen &&
            <Grid item xs={3}>
                <Grid container>
                    <Grid item xs={9}>
                        <Grid container direction="row">
                            <SketchPicker color={color} onChange={(newColor: any) => {
                                setColor(newColor.hex)
                            }}/>
                            <Grid item>
                                <Grid container direction="column">
                                    <Button variant={tool === 'BUCKET' ? "contained" : "outlined"}
                                            onClick={() => setTool("BUCKET")}><FormatColorFillIcon/>{showShortcuts && 'b'}
                                    </Button>
                                    <Button variant={tool === 'BRUSH' ? "contained" : "outlined"}
                                            onClick={() => setTool("BRUSH")}><BrushIcon/>{showShortcuts && 'm'} </Button>
                                    <Button variant={tool === 'EYEDROP' ? "contained" : "outlined"}
                                            onClick={() => setTool("EYEDROP")}><ColorizeIcon/>{showShortcuts && 'e'}</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid container>
                            <Grid item>
                                <Button variant="outlined" color="primary" onClick={() => submitGridRequest(cells)}>
                                    Set LEDs
                                </Button>
                                </Grid>
                            <Grid item>
                                <Button variant="outlined" color="primary" onClick={clearCells}>
                                    Clear LEDs
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button variant="outlined" color="primary"
                                    onClick={() => setLoop(!loop)}>Loop {loop ? 'on' : 'off'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={3}>
                        <Timebin setState={() => {
                            setCells(cells.slice())
                        }} loop={loop} executeOnStart={() => {
                            submitGridRequest(cells.slice())
                        }} icon={ <JustGrid cells={cells} cols={cols} rows={rows}/>}/>

                    </Grid>
                </Grid>
            </Grid>
            }
            <Grid alignItems="stretch" item xs={9}>
                    <Paper style={{height: '100%'}} className={classes.mainPanel} onMouseDown={() => { setMouseDown(true) }} onMouseUp={() => setMouseDown(false)}
                           onMouseLeave={() => setMouseDown(false)}>
                        <PixelGrid cols={cols} rows={rows} cells={cells} onCellEnter={getOnCellEnter()} onCellUp={getOnCellUp()}
                              onCellDown={getOnCellDown()} onCellClick={getOnClick()}
                              mouseDown={mouseDown}/>
                    </Paper>
            </Grid>
        </Grid>
    )

}