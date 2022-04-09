import React from 'react'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
import {SketchPicker} from "react-color"
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';

type Props = {
    color: string,
    setColor:(color: string) => void
    secondaryColor: string
    setSecondaryColor: (color: string) => void
}

export const ColorSwatch = ({color, setColor, secondaryColor, setSecondaryColor}: Props) => {

    const [primaryOpen, setPrimaryOpen] = React.useState(false);
    const [secondaryOpen, setSecondaryOpen] = React.useState(false);

    const handlePrimaryClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setPrimaryOpen(true)
    }

    const handlePrimaryClose = () => {
        setPrimaryOpen(false)
    }


    const handleSecondaryClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setSecondaryOpen(true)
    }

    const handleSecondaryClose = () => {
        setSecondaryOpen(false)
    }

    const swapColors = () => {
        setSecondaryColor(color)
        setColor(secondaryColor)
    }

    return <div style={{position: 'relative', height: '100%', border: '1 px solid white'}}>
        <ClickAwayListener onClickAway={handlePrimaryClose}>
        <div style={{position: 'absolute',
                     height: '45px',
                     width: '45px',
                     backgroundColor: `${color}`,
                     zIndex: 2,
                     borderRadius: '5px',
                     border: '2px solid white'}}
             onClick={handlePrimaryClick}>

            {primaryOpen && <div style={{position: 'absolute', top: '-150px', left: '45px'}}><SketchPicker color={color} onChange={(newColor: any) => {
                setColor(newColor.hex)
            }}/></div>
            }
        </div>
        </ClickAwayListener>
        <SwapHorizIcon style={{position: 'absolute', top: '50px', transform: 'rotate(45deg)'}} onClick={swapColors}/>
        <ClickAwayListener onClickAway={handleSecondaryClose}>
             <div style={{position: 'absolute',
                          top: '30px',
                          left: '30px',
                          height: '45px',
                          width: '45px',
                          backgroundColor: `${secondaryColor}`,
                          zIndex: 1,
                          borderRadius: '5px',
                          border: '2px solid white'}}
                  onClick={handleSecondaryClick}>
                 {secondaryOpen && <div style={{position: 'absolute', top: '-150px', left: '45px', zIndex: 1}}><SketchPicker color={color} onChange={(newColor: any) => {
                     setSecondaryColor(newColor.hex)
                 }}/></div>
                 }
             </div>

        </ClickAwayListener>
    </div>
}