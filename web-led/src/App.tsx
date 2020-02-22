import React from 'react';
import './App.css';
import { LandingPage } from './Home/LandingPage'




function App() {
    document.body.style.height = "100%";
    document.body.style.width = "100%";
    console.log(document)

  return (
    <div style={{width: '100%', height: '100%'}}>
        <LandingPage/>
    </div>
  )
}

export default App;
