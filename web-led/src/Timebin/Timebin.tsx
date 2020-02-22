import React, {ReactElement, useState} from 'react'
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles({
    snapshots: {
        display: 'flex',
        width: '100%',
        minWidth: '200px',
        height: '50%',
        border: '2px solid pink'
    },
    snapshot: {
        border: '2px solid',
    }
})

type Snapshot = {
    duration: number
    icon: any
    setState: any
    executeOnStart: () => void
}

type Timebin = {
    executeOnStart: () => void
    setState: () => void
    loop: boolean
}


export const Timebin = ({executeOnStart, setState, loop}: Timebin) => {
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

    const [duration, setDuration] = useState<number>(1000)
    const [add, setAdd] = useState<boolean>(true)
    const [snapshots, setSnapshots] = useState<Snapshot[]>([])


    const addSnapshot = () => {
        setSnapshots((oldSnapshots: any) => {
            const newSnapshot = {duration, icon: duration, setState, executeOnStart}
            const newSnapshots = oldSnapshots.slice()
            console.log(newSnapshots)
            newSnapshots.push(newSnapshot)
            return newSnapshots
        })
    }

    const totalDuration = snapshots.reduce((total: number, snapshot: Snapshot) => {
        return total + snapshot.duration
    }, 0)

    const execute = () => {
        // I have to set the callback for each item to the callback of the last timer. So iterate and by index set the next callback
        // setTimeouts
        let remainingDuration = totalDuration
        console.log(remainingDuration)
        for (let i = snapshots.length - 1; i > -1; i--) {
            const {duration, executeOnStart} = snapshots[i]
            remainingDuration -= duration
            setTimeout(executeOnStart, remainingDuration)
        }
    }

    return (
        <div>
            {add &&
            <>
                <TextField type="number" value={duration}
                           onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDuration(parseInt(event.target.value))}/>
                <Button onClick={addSnapshot}>(ms) Add</Button>
            </>
            }
            <div className={classes.snapshots}>
                {snapshots.map((snapshot: Snapshot) => {
                    const {duration, setState} = snapshot
                    return (<div className={classes.snapshot} style={{width: `${Math.floor((duration / totalDuration) * 100)}%`}} onClick={setState}>{snapshot.icon}</div>)
                })
                }
            </div>
            <Button variant="outlined" color="primary" onClick={execute}>Run animation</Button>
        </div>
    )

}