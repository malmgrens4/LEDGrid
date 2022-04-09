import React, { useContext, useEffect, useState } from "react";
import { PixelGrid } from "../PixelGrid/PixelGrid";
import Grid from "@material-ui/core/Grid";
import { SketchPicker } from "react-color";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import { Timebin } from "../Timebin/Timebin";
import { useEventListener } from "../EventListenerHook/eventListener";
import { config } from "../config";
import { getNeighborChain, hexToRGB, RGBToHex } from "../PixelGrid/GridHelpers";
import useCells from "../PixelGrid/pixel.hook";
import { ToolType } from "./types";
import { ToolPicker } from "./Tools";
import { JustGrid } from "../JustGrid/JustGrid";
import { ColorSwatch } from "./ColorSwatch";
import { Typography } from "@material-ui/core";

type coordinate = { x: number; y: number };

const defaultColor = "#000000";

const useStyles = makeStyles({
  mainPage: {
    display: "flex",
    height: "100%",
    width: "100%",
  },
  sidePanel: {
    alignContent: "center",
    display: "flex",
    borderRight: "2px solid",
    padding: "8px",
  },
  drawer: {
    display: "flex",
    flex: "1 0 0",
    alignContent: "center",
    flexFlow: "column",
  },
  mainPanel: {
    display: "flex",
    flexFlow: "column",
  },
  gridContainer: {},
  tools: {
    display: "flex",
    flexFlow: "column",
  },
});

export const submitGridRequest = (curCells: string[]) => {
  const params = curCells.map((cell) => cell.substring(1)).join(",");
  fetch(
    `http://${config.localGridAddress}:${config.gridPort}/colors/${params}`
  ).catch(err => console.log)
};

export const LandingPage = () => {
  const classes = useStyles();
  const [color, setColor] = useState<string>("#ff0000");
  const [secondaryColor, setSecondaryColor] = useState<string>("#0000ff");
  const [mouseDown, setMouseDown] = useState<boolean>(false);
  const [sideOpen, setSideOpen] = useState<boolean>(true);
  const [tool, setTool] = useState<ToolType>("BRUSH");
  const [loop, setLoop] = useState<boolean>(false);
  const [cellHistory, setCellHistory] = useState<string[][]>([]);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [currentImage, setCurrentImage] = useState<number[]>([]);
  const [dragging, setDragging] = useState<boolean>();
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);

  const { cells, setCells, cols, rows, clearCells } = useCells();

  useEffect(() => {
    submitGridRequest(cells);
  }, [cells]);

  const keyDown = (event: KeyboardEvent) => {
    console.log(`${event.ctrlKey} ${event.key}`);
    //CTRL-Z
    const ctrl = event.metaKey || event.ctrlKey;
    const key = event.key;

    if (ctrl) {
      setShowShortcuts(true);
    }
    if (key === "u") {
      setCells((curCells: string[]) => {
        const flippedCells: string[] = [];
        for (let i = 0; i < curCells.length; i++) {
          const { x, y } = indexToCoordinates(i);
          flippedCells[i] = curCells[coordinatesToIndex(cols - 1 - x, y)];
        }
        return flippedCells;
      });
    }

    if ((ctrl && event.shiftKey && key === "z") || (ctrl && key === "y")) {
      redo();
    } else if (ctrl && key === "z") {
      undo();
    } else if (event.shiftKey) {
      //grab object mode
    } else if (key === "q") {
      setTool("BRUSH");
    } else if (key === "a") {
      setTool("BUCKET");
    } else if (key === "e") {
      setTool("EYEDROP");
    } else if (key === "Enter") {
      submitGridRequest(cells);
    } else if (key === "b") {
      setTool("SHADER");
    }
  };

  const keyUp = (event: KeyboardEvent) => {
    const ctrl = event.metaKey || event.ctrlKey;
    console.log("key up");
    if (!ctrl) {
      setShowShortcuts(false);
    }
  };

  useEventListener("keydown", keyDown);
  useEventListener("keyup", keyUp);

  const undo = () => {
    // if we want to redo well be returning to the current state
    if (undoStack.length > 0) {
      setRedoStack((stack) => {
        const newRedoStack = stack.slice();
        newRedoStack.push(() => setCells(cells.slice()));
        return newRedoStack;
      });

      setUndoStack((stack) => {
        const newUndoStack = stack.slice();
        newUndoStack.pop()();
        return newUndoStack;
      });
    }
  };

  const redo = () => {
    // if we want to redo well be returning to the current state
    if (redoStack.length > 0) {
      setUndoStack((stack) => {
        const newUndoStack = stack.slice();
        newUndoStack.push(() => setCells(cells.slice()));
        return newUndoStack;
      });

      setRedoStack((stack) => {
        const newRedoStack = stack.slice();
        newRedoStack.pop()();
        return newRedoStack;
      });
    }
  };

  const setCellColor = (index: number, newColor: string = color) => {
    console.log("set color")
    console.log(color)
    console.log(index)
    if(cells[index] === newColor) {return}
    setCells((oldCells) => {
      const newCells = oldCells.slice();
      newCells[index] = newColor;
      return newCells;
    });
  };

  const setColorByCell = (index: number) => {
    setColor(cells[index]);
  };

  const bucketPaint = (index: number) => {
    getNeighborChain(cells, index, cols, rows).map((cellIndex: number) => {
      setCellColor(cellIndex);
    });
  };

  const shaderAction = (index: number) => {
    let { red, green, blue } = hexToRGB(cells[index]);
    red = Math.floor(0.9 * red);
    green = Math.floor(0.9 * green);
    blue = Math.floor(0.9 * blue);
    setCellColor(index, RGBToHex({ red, green, blue }));
  };

  const getOnClick = () => {
    switch (tool) {
      case "BRUSH":
        return setCellColor;
      case "BUCKET":
        return bucketPaint;
      case "EYEDROP":
        return (index: number) => {
          setColorByCell(index);
          setTool("BRUSH");
        };
      case "GRAB":
        return (index: number) => {
          setCurrentImage(getNeighborChain(cells, index, cols, rows));
        };
      default:
        return (index: number) => {};
    }
  };

  const pushCellHistory = () => {
    setUndoStack((stack) => {
      const newUndoStack = stack.slice();
      newUndoStack.push(() => {
        setCells(cells.slice());
      });
      return newUndoStack;
    });

    setCellHistory((history) => {
      const newHistory = history.slice();
      newHistory.push(cells.slice());
      return newHistory;
    });
  };

  const indexToCoordinates = (index: number): { x: number; y: number } => {
    const y: number = Math.floor(index / cols);
    const x: number = index % cols;

    return { x, y };
  };

  const coordinatesToIndex = (x: number, y: number): number => {
    return y * cols + x;
  };

  const getXMirrorCellIndex = (index: number) => {
    const { x, y } = indexToCoordinates(index);
    const secondCell = cols - 1 - x + y * cols;
    return secondCell;
  };

  const getYMirrorCellIndex = (index: number) => {
    const { x, y } = indexToCoordinates(index);
    const secondCell = coordinatesToIndex(x, Math.abs(rows - 1 - y));
    return secondCell;
  };

  const XMirrorAction = (index: number) => {
    const secondCell = getXMirrorCellIndex(index);

    if (secondCell) {
      setCellColor(index);
      setCellColor(secondCell);
    }
  };

  const YMirrorAction = (index: number) => {
    const secondCell = getYMirrorCellIndex(index);

    if (secondCell) {
      setCellColor(index);
      setCellColor(secondCell);
    }
  };

  const QuadrantMirrorAction = (index: number) => {
    XMirrorAction(index);
    YMirrorAction(index);
    YMirrorAction(getXMirrorCellIndex(index));
  };

  const getOnCellDown = () => {
    return (index: number) => {
      if (tool === "BRUSH") {
        setCellColor(index);
        pushCellHistory();
      } else if (tool === "BUCKET") {
        pushCellHistory();
      } else if (tool === "SHADER") {
        shaderAction(index);
        pushCellHistory();
      } else if (tool === "XMIRROR") {
        XMirrorAction(index);
        pushCellHistory();
      } else if (tool === "YMIRROR") {
        YMirrorAction(index);
        pushCellHistory();
      } else if (tool === "QUADRANTMIRROR") {
        QuadrantMirrorAction(index);
        pushCellHistory();
      }
    };
  };

  const getOnCellUp = () => {
    // change to only on brush
    return () => {
      if (dragging) {
        setDragging(false);
      }
    };
  };

  const getCoordinateDifference = (p1: coordinate, p2: coordinate) => {
    return { x: p2.x - p1.x, y: p2.y - p1.y };
  };

  const dragAction = (index: number) => {
    if (currentImage && currentImage.length > 0) {
      const currentCoords = indexToCoordinates(index);
      const diff: coordinate = getCoordinateDifference(
        indexToCoordinates(currentImage[0]),
        currentCoords
      );
      const newImagePosition: number[] = [];
      const cellsCopy = [...cells];

      currentImage.map((imageIndex: number) => {
        if (imageIndex < cells.length) {
          cellsCopy[imageIndex] = defaultColor;
        }
      });

      currentImage.map((imageIndex: number) => {
        let imageCoordinates = indexToCoordinates(imageIndex);
        if (imageCoordinates.x + diff.x >= cols) {
          imageCoordinates.x -= cols;
        }
        if (imageCoordinates.x + diff.x <= -1) {
          imageCoordinates.x += cols;
        }
        const newImageIndex = coordinatesToIndex(
          imageCoordinates.x + diff.x,
          imageCoordinates.y + diff.y
        );

        newImagePosition.push(newImageIndex);

        if (imageIndex < cells.length) {
          cellsCopy[newImageIndex] = cells[imageIndex];
        }
      });
      setCurrentImage(newImagePosition);

      setCells(cellsCopy);
    }
  };

  const getOnCellEnter = () => {
    if (mouseDown) {
      if (!dragging) {
        setDragging(true);
      }
      if (tool === "BRUSH") {
        return (index: number) => {
          setCellColor(index);
        };
      } else if (tool === "SHADER") {
        return (index: number) => shaderAction(index);
      } else if (tool === "XMIRROR") {
        return (index: number) => XMirrorAction(index);
      } else if (tool === "YMIRROR") {
        return (index: number) => YMirrorAction(index);
      } else if (tool === "QUADRANTMIRROR") {
        return (index: number) => {
          QuadrantMirrorAction(index);
        };
      } else if (tool === "GRAB") {
        return dragAction;
      } else {
        return (index: number) => {};
      }
    } else {
      return (index: number) => {};
    }
    // if the mouse is up then we cap the capture for the currentImage
  };

  const addToCurrentImage = (index: number) => {
    setCurrentImage((image) => {
      const newImage = image.slice();
      newImage.push(index);
      return newImage;
    });
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex" }}>
      {sideOpen && (
        <div style={{ width: "150px" }}>
          <Paper square style={{ height: "100%" }}>
            <Grid container justify="center">
              <Grid item>
                <Grid container direction="row" justify="center">
                  <Grid item xs={12} style={{ padding: "8px 0px" }}>
                    <ToolPicker
                      tool={tool}
                      setTool={setTool}
                      showShortcuts={showShortcuts}
                    />
                  </Grid>
                </Grid>
                <Grid container style={{ paddingTop: "16px" }}>
                  <div style={{ width: "100%" }}>
                    <div
                      style={{ height: "100px", transform: "translateX(25%)" }}
                    >
                      <ColorSwatch
                        color={color}
                        setColor={setColor}
                        secondaryColor={secondaryColor}
                        setSecondaryColor={setSecondaryColor}
                      />
                    </div>
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </div>
      )}
      <div style={{ display: "flex", flex: "9" }}>
        <Paper style={{ height: "100%", width: "100%" }}>
          <Grid
            container
            direction="column"
            alignItems="center"
            justify="center"
            style={{ height: "100%", width: "100%" }}
          >
            <Grid item style={{ height: "calc(100% - 25px)", width: "100%" }}>
              <Paper
                square
                style={{ height: "100%", width: "100%" }}
                className={classes.mainPanel}
                onMouseDown={() => {
                  setMouseDown(true);
                }}
                onMouseUp={() => setMouseDown(false)}
                onMouseLeave={() => setMouseDown(false)}
                onTouchStart={() => setMouseDown(true)}
                onTouchEnd={() => setMouseDown(false)}
              >
                <div style={{ height: "100%", width: "100%", flex: "1" }}>
                  <div style={{ opacity: ".5" }}>
                    <JustGrid cells={cells} cols={cols} rows={rows} />
                  </div>
                  <PixelGrid
                    cols={cols}
                    rows={rows}
                    cells={cells}
                    onCellEnter={getOnCellEnter()}
                    onCellUp={getOnCellUp()}
                    onCellDown={getOnCellDown()}
                    onCellClick={getOnClick()}
                    mouseDown={mouseDown}
                  />
                </div>
              </Paper>
            </Grid>
            <Paper
              style={{
                width: "100%",
                height: "25px",
                display: "flex",
                justifyContent: "center",
              }}
              square
            >
              <Button
                style={{ marginRight: "32px" }}
                color="primary"
                variant="contained"
                onClick={() => submitGridRequest(cells)}
              >
                Set LEDs
              </Button>
              <Button
                style={{ marginRight: "32px" }}
                color="primary"
                variant="contained"
                onClick={() => setLoop(!loop)}
              >
                Loop {loop ? "on" : "off"}
              </Button>

              <Button
                color="secondary"
                variant="contained"
                onClick={clearCells}
              >
                Clear LEDs
              </Button>
            </Paper>
          </Grid>
        </Paper>
      </div>
      {/* <div style={{ display: "flex", flex: "1" }}>
        <Paper square style={{ height: "100%" }}>
          <Grid container direction="column" style={{ height: "100%" }}>
            <Grid item xs={12} style={{ height: "100%", padding: "16px" }}>
              <Timebin
                cells={cells.slice()}
                cols={cols}
                rows={rows}
                loop={loop}
                setCells={setCells}
                clearCells={clearCells}
              />
            </Grid>
          </Grid>
        </Paper>
      </div> */}
    </div>
  );
};
