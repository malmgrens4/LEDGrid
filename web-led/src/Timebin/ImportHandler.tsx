import React from 'react';
import {submitGridRequest} from "../Home/LandingPage";
import {SnapshotType} from "./types";
import {JustGrid} from "../JustGrid/JustGrid";
import { config } from '../config'


export const useImport = () => (importString: any) => {
    // we return event function they call with the file content. We parse that and return snapshots.
    try {
        const fileContent = importString.split('\n')
        const [col, row] = fileContent.shift().split(',')
        const snapshots = []
        for(let frame = 0; frame < fileContent.length; frame++) {
            let cells = fileContent[frame].split(',')
            if(cells.length === row * col) {
                const newSnapshot: SnapshotType = {
                    icon: <JustGrid cells={cells} cols={col} rows={row}/>,
                    executeOnStart: () => submitGridRequest(cells, config.localGridAddress),
                    setState: () => {
                    },
                    exportString: cells.slice().join(',')
                }

                console.log(newSnapshot)
                snapshots.push(newSnapshot)
            }
        }
        return snapshots
    }
    catch(err) {
        alert('incompatible file' + err)
    }
}