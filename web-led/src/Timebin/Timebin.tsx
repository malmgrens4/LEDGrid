import React, {ReactElement, useState, useRef, useEffect} from 'react'
import TextField from "@material-ui/core/TextField"
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
import CardActions from "@material-ui/core/CardActions";
import InputLabel from '@material-ui/core/InputLabel';

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

type Snapshot = {
    icon: any
    setState: any
    executeOnStart: () => void
}

type Timebin = {
    executeOnStart: () => void
    setState: () => void
    loop: boolean
    icon: any
}


const Snapshot = ({icon, deleteSnapshot, setState, index}: any) => {
    const classes = useStyles()

    return (
        <div className={classes.snapshot}>
            <div className={classes.closeSnapshot} onClick={(event) => {
                event.preventDefault()
                deleteSnapshot(index)
            }}>x
            </div>
            <div className={classes.snapshotIndex}>{index}</div>
            <div className={classes.snapshotIcon} onClick={setState}>{icon}</div>
        </div>
    )
}

export const Timebin = ({executeOnStart, setState, loop, icon}: Timebin) => {
    const classes = useStyles()

    const container = useRef()
    const [fps, setFps] = useState<number>(5)
    const [add, setAdd] = useState<boolean>(true)
    const [snapshots, setSnapshots] = useState<Snapshot[]>([])
    const [simulationIndex, setSimulationIndex] = useState<number>(0)

    const keyDown = (event: KeyboardEvent) => {
        const ctrl = event.metaKey || event.ctrlKey
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

    useEffect(() => {
        console.log(`setting frame ${simulationIndex}`)
        setSimulationIndex(0)

        const timer = setInterval(() => {
            setSimulationIndex( index => ((index + 1) % snapshots.length))
        }, duration)

        return () => {clearInterval(timer)}
    }, [duration, snapshots])

    const addSnapshot = () => {
        setSnapshots((oldSnapshots: any) => {
            const newSnapshot = {icon, setState, executeOnStart}
            const newSnapshots = oldSnapshots.slice()
            newSnapshots.push(newSnapshot)
            return newSnapshots
        })
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
            const {executeOnStart} = snapshots[i]
            remainingDuration -= duration
            setTimeout(executeOnStart, remainingDuration)
        }
    }


    const handleSliderChange = (event: any, newValue: any) => {
        setFps(newValue);
    };

    const handleInputChange = (event: any) => {
        setFps(event.target.value === '' ? 0.1 : Number(event.target.value));
    };

    const handleBlur = () => {
        if (fps < 0.1) {
            setFps(0.1);
        } else if (fps > 15) {
            setFps(15);
        }
    };

    return (
        <Grid container justify="center" spacing={4}>
            <Grid item>
                <Paper style={{padding: '8px'}}>
            <Grid container justify="center" spacing={2}>
                <Grid item>
                        <div className={`${classes.snapshotDisplay}`}>
                            {snapshots.length > 0 && snapshots[simulationIndex] && <div className={classes.snapshotDisplay}>
                                {snapshots[simulationIndex].icon}
                            </div>}
                        </div>
                </Grid>
                <Grid item style={{width: '100%', padding: '8px'}}>
                            <Grid container justify="center" spacing={3}>
                                <Grid item xs={8}>
                                    <InputLabel>FPS</InputLabel>
                                    <Slider
                                        value={typeof fps === 'number' ? fps : 0.1}
                                        onChange={handleSliderChange}
                                        step={.1}
                                        min={.1}
                                        max={15}
                                        aria-labelledby="input-slider"
                                    />
                                </Grid>
                                <Grid item xs={4}>
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
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Button style={{width:'100%'}} variant="contained" color="primary" onClick={execute}>Run animation</Button>
                            </Grid>

                </Grid>
            </Grid>
                </Paper>




            </Grid>

            <Grid item style={{height: '50vh', overflowY: 'scroll'}}>
                <Card>
                    <CardContent>
                <div className={classes.snapshots}>
                    {snapshots.map((snapshot: Snapshot, index: number) => {
                        const {setState, icon} = snapshot
                        return (
                            <Snapshot deleteSnapshot={deleteSnapshot} icon={icon} setState={setState} index={index}/>
                        )
                    })}
                    <div className={`${classes.snapshot} ${classes.addSnapshot}`} onClick={addSnapshot}><AddIcon style={{alignSelf: 'center'}}/></div>
                </div>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )

}