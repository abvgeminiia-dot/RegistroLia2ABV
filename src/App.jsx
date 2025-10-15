import { useState, useEffect  } from 'react'
import './App.css'
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Switch  } from "react-router-dom";
import LeeABV from "./Component/LeeABV/LeeABV";
import FormABV2 from "./Component/FormABV1/FormABV2"
import FormABV4 from "./Component/FormABV1/FormABV4"
import FormABV6 from "./Component/FormABV1/FormABV6"
import FormABV8 from "./Component/FormABV1/FormABV8"
import Menu from "./Component/Menu/Menu"

function App() {

  
  return (
    <div className="container">
    <Router>
     <Switch>
        <Route exact path="/">
          <Menu />
        </Route>
        <Route exact path="/Menu">
          <Menu />
        </Route>
        <Route exact path="/FormABV2">
          <FormABV2 />
        </Route>
        <Route exact path="/FormABV4">
          <FormABV4 />
        </Route>
        <Route exact path="/FormABV6">
          <FormABV6 />
        </Route>
        <Route exact path="/FormABV8">
          <FormABV8 />
        </Route>
        <Route exact path="/datastorage">
          <LeeABV />
        </Route>
     </Switch>
     </Router>
    </div>
  )
}

export default App
