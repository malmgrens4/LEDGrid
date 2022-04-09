import React from 'react'
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import FormatColorFillIcon from '@material-ui/icons/FormatColorFill';
import BrushIcon from '@material-ui/icons/Brush';
import ColorizeIcon from '@material-ui/icons/Colorize';
import WbSunny from '@material-ui/icons/WbSunny';
import BorderVerticalIcon from '@material-ui/icons/BorderVertical';
import BorderHorizontalIcon from '@material-ui/icons/BorderHorizontal';
import BorderInnerIcon from '@material-ui/icons/BorderInner';
import PanToolIcon from '@material-ui/icons/PanTool';
import Tooltip from '@material-ui/core/Tooltip';

import {ToolType} from "./types";
import {Typography} from "@material-ui/core";



type ToolPickerProps = {
    tool: ToolType
    setTool: (tool: ToolType) => void
    showShortcuts: boolean
}

export const ToolPicker = ({tool, setTool, showShortcuts}: ToolPickerProps) => {
    return (
        <div style={{display: 'flex', flexFlow: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <Typography>Tools</Typography>
        <Grid container justify="center">

            <Grid item>
            <Grid container
              alignItems="center"
              direction="column"
              >
            <Grid item xs={6} style={{justifyContent: 'center', display: 'flex'}}>
                <Tooltip title="Bucket">
                    <Button variant={tool === 'BUCKET' ? "contained" : "outlined"}
                            onClick={() => setTool("BUCKET")}><FormatColorFillIcon/>{showShortcuts && 'a'}
                    </Button>
                </Tooltip>
            </Grid>
            <Grid item xs={6} style={{justifyContent: 'center', display: 'flex'}}>
                <Tooltip title="Brush">
                <Button variant={tool === 'BRUSH' ? "contained" : "outlined"}
                        onClick={() => setTool("BRUSH")}><BrushIcon/>{showShortcuts && 'q'}
                </Button>
                </Tooltip>
            </Grid>
            <Grid item xs={6} style={{justifyContent: 'center', display: 'flex'}}>
                <Tooltip title="Eyedrop">
                <Button variant={tool === 'EYEDROP' ? "contained" : "outlined"}
                        onClick={() => setTool("EYEDROP")}><ColorizeIcon/>{showShortcuts && 'e'}
                </Button>
                </Tooltip>
            </Grid>

            <Grid item xs={6} style={{justifyContent: 'center', display: 'flex'}}>
                <Tooltip title="Brightness">
                <Button variant={tool === 'SHADER' ? "contained" : "outlined"}
                        onClick={() => setTool("SHADER")}><WbSunny/>{showShortcuts && 'b'}
                </Button>
                </Tooltip>
            </Grid>
        </Grid>
            </Grid>
            <Grid item>
            <Grid container
                  justify="space-between"
                  alignItems="center"
                  direction="column"
            >
            <Grid item xs={6} style={{justifyContent: 'center', display: 'flex'}}>
                <Tooltip title="Mirror over y-axis">
                    <Button variant={tool === 'XMIRROR' ? "contained" : "outlined"}
                            onClick={() => setTool("XMIRROR")}><BorderVerticalIcon/>{showShortcuts && 'y'}
                    </Button>
                </Tooltip>
            </Grid>

            <Grid item xs={6} style={{justifyContent: 'center', display: 'flex'}}>
                <Tooltip title="Mirror over x-axis">
                    <Button variant={tool === 'YMIRROR' ? "contained" : "outlined"}
                            onClick={() => setTool("YMIRROR")}><BorderHorizontalIcon/>{showShortcuts && 'x'}
                    </Button>
                </Tooltip>
            </Grid>
            <Grid item xs={6} style={{justifyContent: 'center', display: 'flex'}}>
                <Tooltip title="Mirror over x and y-axis">
                    <Button variant={tool === 'QUADRANTMIRROR' ? "contained" : "outlined"}
                            onClick={() => setTool("QUADRANTMIRROR")}><BorderInnerIcon/>{showShortcuts && 'z'}
                    </Button>
                </Tooltip>
            </Grid>
                <Grid item xs={6} style={{justifyContent: 'center', display: 'flex'}}>
                    <Tooltip title="Grab and move shapes">
                        <Button variant={tool === 'GRAB' ? "contained" : "outlined"}
                                onClick={() => setTool("GRAB")}><PanToolIcon/>{showShortcuts && 'g'}
                        </Button>
                    </Tooltip>
                </Grid>
        </Grid>
            </Grid>
        </Grid>
        </div>
    )
}