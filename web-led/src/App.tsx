import React from 'react';
import './App.css';
import { LandingPage } from './Home/LandingPage'
import { createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import ThemeProvider from "@material-ui/styles/ThemeProvider";

const theme = createMuiTheme({
    palette: {
        type: 'dark',
    },
});




function App() {
    document.body.style.height = "100%";
    document.body.style.width = "100%";
    console.log(document)

  return (
      <ThemeProvider theme={theme}>
            <div style={{width: '100%', height: '100%'}}>
                <LandingPage/>
            </div>
      </ThemeProvider>
  )
}

export default App;
