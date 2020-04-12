import React, {useState, useEffect, useRef, RefObject} from 'react'
import Button from "@material-ui/core/Button"
import {makeStyles} from '@material-ui/styles'
import AddIcon from '@material-ui/icons/Add';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import CardContent from '@material-ui/core/CardContent';
import { useEventListener } from "../EventListenerHook/eventListener";
import InputLabel from '@material-ui/core/InputLabel';
import {SnapshotType} from './types'
import {ImportExport} from "../ImportExport/ImportExport";
import {JustGrid} from "../JustGrid/JustGrid";
import {submitGridRequest} from "../Home/LandingPage";


const useStyles = makeStyles({
    snapshots: {
        display: 'flex',
        minHeight: '100%',
        flexFlow: 'column',
        position: 'relative',
    },
    snapshot: {
        border: '1px solid',
        display: 'flex',
        height: '8vw',
        width: '8vw',
        position: 'relative',
    },
    closeSnapshot: {
        padding: '2px',
        cursor: 'pointer',
        position: 'absolute'
    },
    snapshotIndex: {
      padding: '2px',
      cursor: 'pointer',
      position: 'absolute',
      right: '0',
    },
    snapshotIcon: {
        display: 'flex',
        flex: '1 0 0'
    },
    addSnapshot: {
        display: 'flex',
        height: '8vw',
        width: '8vw',
        justifyContent: 'center'
    },
    snapshotDisplay: {
        height: '10vw',
        width: '10vw',
        display: 'flex',
        border: '1px solid',
    }
})



type Timebin = {
    cells: string[]
    setCells: (cells: string[]) => void
    clearCells: () => void
    loop: boolean
    cols: number
    rows: number
}


const Snapshot = ({cells, cols, rows, deleteSnapshot, index, setCells, clearCells}: any) => {
    const classes = useStyles()

    return (
        <div className={classes.snapshot}>
            <div className={classes.closeSnapshot} onClick={(event) => {
                event.preventDefault()
                deleteSnapshot(index)
            }}>x
            </div>
            <div className={classes.snapshotIndex}>{index}</div>
            <div className={classes.snapshotIcon} onClick={() => {setCells(cells);}}>
                <JustGrid cells={cells} cols={cols} rows={rows}/>
            </div>
        </div>
    )
}

const AnimationPreview = ({snapshots, fps, setFps, cols, rows}: any) => {
    const classes = useStyles()

    const [simulationIndex, setSimulationIndex] = useState<number>(0)

    const duration = (1/fps) * 1000

    const handleBlur = () => {
        if (fps < 0.1) {
            setFps(0.1)
        } else if (fps > 15) {
            setFps(15)
        }
    }

    const handleSliderChange = (event: any, newValue: any) => {
        setFps(newValue)
    }

    const handleInputChange = (event: any) => {
        setFps(event.target.value === '' ? 0.1 : Number(event.target.value))
    }

    useEffect(() => {
        setSimulationIndex(0)

        const timer = setInterval(() => {
            setSimulationIndex( index => ((index + 1) % snapshots.length))
        }, duration)

        return () => {clearInterval(timer)}
    }, [duration, snapshots])

    return (
        <>
            <Grid item>
                <Grid container direction="column" justify="center" alignItems="center" spacing={1}>
                    <Grid item xs={12}>
                        <div className={`${classes.snapshotDisplay}`}>
                            {snapshots.length > 0 && snapshots[simulationIndex] && <div className={classes.snapshotDisplay}>
                                <JustGrid cells={snapshots[simulationIndex].cells} cols={cols} rows={rows}/>
                            </div>}
                        </div>
                    </Grid>
                </Grid>
            </Grid>

            <Grid container justify="center" spacing={3}>
            <Grid item xs={8}>
                <div style={{padding: '4px'}}>
                <InputLabel>FPS</InputLabel>
                <Slider
                    value={typeof fps === 'number' ? fps : 0.1}
                    onChange={handleSliderChange}
                    step={.1}
                    min={.1}
                    max={15}
                    aria-labelledby="input-slider"
                />
                </div>
            </Grid>
                <Grid item xs={4}>
                    <div style={{padding: '4px'}}>
                        <Input
                            value={fps}
                            margin="dense"
                            onBlur={handleBlur}
                            onChange={handleInputChange}
                            inputProps={{
                                step: .1,
                                    min: .1,
                                    max: 15,
                                    type: 'number',
                                    'aria-labelledby': 'input-slider',
                            }}
                        />
                    </div>
            </Grid>
            </Grid>
        </>
    )
}

const scrollToRef = (innerElRef: RefObject<any>, parentElRef: RefObject<any>) => {
    if(innerElRef && parentElRef) {
        parentElRef!.current!.scrollTop = innerElRef!.current!.offsetTop
    }
}

export const Timebin = ({cells, cols, rows, loop, setCells, clearCells}: Timebin) => {
    const classes = useStyles()

    const [fps, setFps] = useState<number>(5)
    const [snapshots, setSnapshots] = useState<SnapshotType[]>([])

    const addSnapRef = useRef<HTMLDivElement>(null)
    const snapContainerRef = useRef<HTMLDivElement>(null)

    const keyDown = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase()
        if(event.shiftKey && key === 'f') {
            deleteSnapshot(snapshots.length - 1)
        }
        else if(key==='f') {
            addSnapshot()
        }
    }

    const keyUp = (event: KeyboardEvent) => {
        return
    }

    const duration = (1/fps) * 1000

    useEventListener('keydown', keyDown)
    useEventListener('keyup', keyUp)

    const addSnapshot = () => {
        setSnapshots((oldSnapshots: any) => {
            const newSnapshot = {cells}
            const newSnapshots = oldSnapshots.slice()
            newSnapshots.push(newSnapshot)
            return newSnapshots
        })
        clearCells()
        scrollToRef(addSnapRef, snapContainerRef)
    }

    const totalDuration = snapshots.length * duration

    const deleteSnapshot = (index: number) => {
        setSnapshots(oldSnapshots => {
            const newSnapshots = oldSnapshots.slice()
            newSnapshots.splice(index, 1)
            return newSnapshots
        })
    }

    const getVisibleColor = (baseColor: string) => {
        return
    }

    const execute = () => {
        // I have to set the callback for each item to the callback of the last timer. So iterate and by index set the next callback
        // setTimeouts
        let remainingDuration = totalDuration
        for (let i = snapshots.length - 1; i > -1; i--) {
            const {cells} = snapshots[i]
            remainingDuration -= duration
            setTimeout(() => {submitGridRequest(cells)}, remainingDuration)
        }
    }


    return (
        <Grid container justify="center" spacing={4}>
            <Grid item>
                <Paper style={{padding: '8px'}}>
            <Grid container justify="center" spacing={2}>
                <AnimationPreview snapshots={snapshots} fps={fps} setFps={setFps} cols={cols} rows={rows}/>
                <Grid item style={{width: '100%', padding: '8px'}}>

                        <Grid item>
                            <Grid container direction="column" spacing={3}>
                                <Grid item>
                                    <Button style={{width:'100%'}} variant="contained" color="primary" onClick={execute}>Run animation</Button>
                                </Grid>
                                <Grid item>
                                    <Grid container spacing={3}>
                                        <ImportExport snapshots={snapshots} setSnapshots={setSnapshots} cols={cols} rows={rows} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>

                </Grid>
            </Grid>
                </Paper>
            </Grid>

            <Grid item ref={snapContainerRef} style={{height: '50vh', overflowY: 'scroll'}}>
                <Card>
                    <CardContent>
                        <div
                            className={classes.snapshots}>
                            {snapshots.map((snapshot: SnapshotType, index: number) => {
                                const {cells} = snapshot
                                return (
                                    <Snapshot cells={cells} deleteSnapshot={deleteSnapshot} cols={cols} rows={rows} index={index} setCells={setCells}/>
                                )
                            })}
                             <div ref={addSnapRef} className={`${classes.snapshot} ${classes.addSnapshot}`} onClick={addSnapshot}><AddIcon style={{alignSelf: 'center'}}/></div>
                     </div>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )

}