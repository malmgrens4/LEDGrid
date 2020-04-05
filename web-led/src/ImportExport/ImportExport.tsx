import React, {useRef} from 'react'
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import {SnapshotType} from "../Timebin/types";

type ImportExportType = {
    snapshots: SnapshotType[]
    setSnapshots: (snapshots: SnapshotType[]) => void
    cols: number
    rows: number
}

const importToSnapshots = (importString: string) => {
    try {
        const fileContent: string[] = importString.split('\n')
        if(fileContent) {
            let [col, row] = fileContent!.shift()!.split(',')
            const snapshots = []
            for (let frame = 0; frame < fileContent.length; frame++) {
                let cells = fileContent[frame].split(',')
                if ( cells.length === parseInt(row) * parseInt(col) ){
                    const newSnapshot: SnapshotType = {
                        cells
                    }
                    snapshots.push(newSnapshot)
                }
            }
            return snapshots
        }
    }
    catch(err) {
        alert('incompatible file' + err)
    }
}

export const ImportExport = ({ snapshots, setSnapshots, cols, rows}: ImportExportType) => {

    const importRef = useRef<HTMLInputElement>(null)
    const exportJSONContent = rows + ',' + cols + '\n' + snapshots.reduce((exportString: string, snapshot: SnapshotType) =>  exportString + snapshot.cells.join(',') + '\n', '')

    const forwardImport = (event: any) => {
        if(importRef && importRef.current){
            importRef!.current!.click()
        }
    }

    const handleFileUpload = (event: any) => {
        let files = event.target.files
        let file = files[0]
        let reader = new FileReader()
        reader.onload = (event: any) => {
            const newSnapshots = importToSnapshots(event.target.result)
            if (!!newSnapshots) {
                setSnapshots(newSnapshots)
            }
        }
        reader.readAsText(file)
    }

    return (
        <>
            <Grid item xs={6}>
                <div style={{display: 'flex', flex: '1', justifyContent: 'center'}}>
                    <Button variant="outlined" color="secondary" onClick={forwardImport}>Import</Button>
                    <input style={{visibility: 'hidden', display: 'none'}} type="file" ref={importRef} id="import" name="import" onChange={handleFileUpload}/>
                </div>
            </Grid>
            <Grid item xs={6}>
                <div style={{display: 'flex', flex: '1', justifyContent: 'center'}}>
                <Button variant="contained" color="secondary">
                <a style={{color: 'inherit', textDecoration: 'none'}} href={`data:application/octet-stream,${encodeURIComponent(exportJSONContent)}`}>Export</a>
            </Button>
            </div>
            </Grid>
        </>
    )
}