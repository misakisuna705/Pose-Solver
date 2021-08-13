import React, { Component } from "react";

import Workspace from "App/workspace/workspace.js";

export default class Content extends Component {
  render() {
    return (
      <div style={{ backgroundColor: "#f8f9fa" }}>
        <div style={{ height: "calc(100vh - 132px)", paddingTop: "20px" }}>
          <Workspace />
        </div>
      </div>
    );
  }
}

//<h1 style={{ paddingTop: "30px", textAlign: "center" }}>Pose Visualization</h1>
