import React from 'react'
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import FormatColorFillIcon from '@material-ui/icons/FormatColorFill';
import BrushIcon from '@material-ui/icons/Brush';
import ColorizeIcon from '@material-ui/icons/Colorize';
import WbSunny from '@material-ui/icons/WbSunny';

import {ToolType} from "./types";



type ToolPickerProps = {
    tool: ToolType
    setTool: (tool: ToolType) => void
    showShortcuts: boolean
}

export const ToolPicker = ({tool, setTool, showShortcuts}: ToolPickerProps) => {
    return (
        <Grid container
              justify="space-between"
              alignItems="center"
              spacing={2}>

            <Grid item xs={6} style={{justifyContent: 'center', display: 'flex'}}>
                <Button variant={tool === 'BUCKET' ? "contained" : "outlined"}
                        onClick={() => setTool("BUCKET")}><FormatColorFillIcon/>{showShortcuts && 'a'}
                </Button>
            </Grid>
            <Grid item xs={6} style={{justifyContent: 'center', display: 'flex'}}>
                <Button variant={tool === 'BRUSH' ? "contained" : "outlined"}
                        onClick={() => setTool("BRUSH")}><BrushIcon/>{showShortcuts && 'q'}
                </Button>
            </Grid>
            <Grid item xs={6} style={{justifyContent: 'center', display: 'flex'}}>
                <Button variant={tool === 'EYEDROP' ? "contained" : "outlined"}
                        onClick={() => setTool("EYEDROP")}><ColorizeIcon/>{showShortcuts && 'e'}
                </Button>
            </Grid>

            <Grid item xs={6} style={{justifyContent: 'center', display: 'flex'}}>
                <Button variant={tool === 'SHADER' ? "contained" : "outlined"}
                        onClick={() => setTool("SHADER")}><WbSunny/>{showShortcuts && 'b'}
                </Button>
            </Grid>

        </Grid>
    )
}