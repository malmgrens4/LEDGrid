import React, {useEffect, useState} from 'react';
import {Grid} from '../Grid/Grid';
import {SketchPicker} from 'react-color'
import {makeStyles} from "@material-ui/styles";
import Paper from '@material-ui/core/Paper'
import Button from "@material-ui/core/Button";
import FormatColorFillIcon from '@material-ui/icons/FormatColorFill';
import BrushIcon from '@material-ui/icons/Brush';
import ColorizeIcon from '@material-ui/icons/Colorize';
import {Timebin} from '../Timebin/Timebin'
import {useEventListener} from "../EventListenerHook/eventListener";

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

const url = 'http://192.168.0.228/colors/'

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

    // so when I start dragging I want to have a snapshot of the cells so my undo isn't just a series of individual cells but the whole stroke
    // So when the drag starts I need an event - when does the drag start?
    // As soon as it leaves the first cell clicked with the mouse still down
    // Then when someone undoes it I need to add a redo that reflects the current state (a callback that can setTheCells)

    const keyPress = (event: KeyboardEvent) => {
        console.log(`${event.ctrlKey} ${event.key}`)
        //CTRL-Z
        const ctrl = event.metaKey || event.ctrlKey
        const key = event.key
        if ((ctrl && event.shiftKey && key === 'z') || (ctrl && key === 'y')) {
            redo()
        } else if (ctrl && key === 'z') {
            console.log('undo')
            undo()
        } else if (event.shiftKey) {
            //grab object mode
        }
    }

    const undo = () => {
        // if we want to redo well be returning to the current state
        if(undoStack.length > 0) {
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
        if(redoStack.length > 0) {
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

    useEventListener('keydown', keyPress)

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
                return setColorByCell
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
                            <Button variant={tool === 'BUCKET' ? "contained" : "outlined"}
                                    onClick={() => setTool("BUCKET")}><FormatColorFillIcon/></Button>
                            <Button variant={tool === 'BRUSH' ? "contained" : "outlined"}
                                    onClick={() => setTool("BRUSH")}><BrushIcon/></Button>
                            <Button variant={tool === 'EYEDROP' ? "contained" : "outlined"}
                                    onClick={() => setTool("EYEDROP")}><ColorizeIcon/></Button>
                        </div>
                    </div>
                    <Button variant="outlined" color="primary" onClick={() => submitGridRequest(cells)}>Set
                        LEDs</Button>
                    <Button variant="outlined" color="primary"
                            onClick={() => setLoop(!loop)}>Loop {loop ? 'on' : 'off'}</Button>
                    <Timebin setState={() => {
                        setCells(cells.slice())
                    }} loop={loop} executeOnStart={() => {
                        submitGridRequest(cells.slice())
                    }}/>

                </div>
            </Paper>
            }
            <Paper className={classes.mainPanel} onMouseDown={() => {
                setMouseDown(true)
            }} onMouseUp={() => setMouseDown(false)}
                   onMouseLeave={() => setMouseDown(false)}>
                <Grid cols={cols} rows={rows} cells={cells} onCellEnter={getOnCellEnter()} onCellUp={getOnCellUp()} onCellDown={getOnCellDown()} onCellClick={getOnClick()}
                      mouseDown={mouseDown}/>
            </Paper>
        </div>
    )

}