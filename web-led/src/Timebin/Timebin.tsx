import React, {ReactElement, useState, useRef, useEffect} from 'react'
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import {makeStyles} from '@material-ui/styles'
import AddIcon from '@material-ui/icons/Add';
import Grid from '@material-ui/core/Grid';
import { useEventListener } from "../EventListenerHook/eventListener";

const useStyles = makeStyles({
    snapshots: {
        border: '2px solid pink',
        display: 'flex',
        flexFlow: 'column',
        height: '100%',
        position: 'relative',
    },
    snapshot: {
        border: '2px solid',
        display: 'flex',
        height: '8vw',
        width: '8vw'
    },
    closeSnapshot: {
        cursor: 'pointer',
        position: 'absolute'
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
            <div className={classes.snapshotIcon} onClick={setState}>{icon}</div>
        </div>
    )
}

export const Timebin = ({executeOnStart, setState, loop, icon}: Timebin) => {
    // so this needs to hold instances of the grid -
    // it needs to be snapshots that when played will update the led grid
    // when play is hit it runs through them with the provided time interval
    // so it should be time and snapshot
    // the snapshot will be a reference to the cells array
    // so each timer runs through then you give it a callback that executes at the beginning of each time stamp
    // How can I allow the user to select and edit a given frame?
    // A time will be part of the component - you select add and it adds a new frame with the selected amount of time
    // You can delete a component and it will remove it shifting the next item in its place
    // or there can be an edit state where you update that index - instead of add it becomes update

    const classes = useStyles()

    const container = useRef()

    const [duration, setDuration] = useState<number>(100)
    const [add, setAdd] = useState<boolean>(true)
    const [snapshots, setSnapshots] = useState<Snapshot[]>([])
    const [simulationIndex, setSimulationIndex] = useState<number>(0)

    const keyDown = (event: KeyboardEvent) => {
        const ctrl = event.metaKey || event.ctrlKey
        const key = event.key.toLowerCase()
        debugger
        if(event.shiftKey && key === 'f') {
            deleteSnapshot(snapshots.length - 1)
        }
        else if(key==='f') {
            addSnapshot()
        }
    }

    const keyUp = (event: KeyboardEvent) => {

    }



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
            const newSnapshot = {duration, icon, setState, executeOnStart}
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

    return (
        <Grid container justify="center" style={{height: '100%', width: '100%',}}>

            <div>
            <TextField type="number" value={duration}
                       onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDuration(parseInt(event.target.value))}/>
                       ms
            </div>


            <div className={`${classes.snapshot}`} onClick={addSnapshot}>
                {snapshots.length > 0 && snapshots[simulationIndex] && <div className={classes.snapshot}>
                    {snapshots[simulationIndex].icon}
                </div>}
            </div>

            <div style={{}} className={classes.snapshots}>
                {snapshots.map((snapshot: Snapshot, index: number) => {
                    const {setState, icon} = snapshot
                    return (
                        <Snapshot deleteSnapshot={deleteSnapshot} icon={icon} setState={setState} index={index}/>
                    )
                })}
                <div className={`${classes.snapshot} ${classes.addSnapshot}`} onClick={addSnapshot}><AddIcon style={{alignSelf: 'center'}}/></div>

            </div>
            <Button variant="outlined" color="primary" onClick={execute}>Run animation</Button>
        </Grid>
    )

}