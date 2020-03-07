import React, {ReactElement, useState, useRef, useEffect} from 'react'
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import {makeStyles} from '@material-ui/styles'
import AddIcon from '@material-ui/icons/Add';
import Grid from '@material-ui/core/Grid';
import { useEventListener } from "../EventListenerHook/eventListener";

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
    const classes = useStyles()

    const container = useRef()

    const [duration, setDuration] = useState<number>(100)
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
        <Grid container justify="center">

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
            <Button variant="contained" color="primary" onClick={execute}>Run animation</Button>


            <div style={{}} className={classes.snapshots}>
                {snapshots.map((snapshot: Snapshot, index: number) => {
                    const {setState, icon} = snapshot
                    return (
                        <Snapshot deleteSnapshot={deleteSnapshot} icon={icon} setState={setState} index={index}/>
                    )
                })}
                <div className={`${classes.snapshot} ${classes.addSnapshot}`} onClick={addSnapshot}><AddIcon style={{alignSelf: 'center'}}/></div>
            </div>
        </Grid>
    )

}