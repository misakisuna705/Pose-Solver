import React, { Component } from "react";

import "App/App.css";

import Workspace from "App/workspace/workspace";

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Workspace width={window.innerWidth} height={window.innerHeight}/>
      </div>
    );
  }
}
