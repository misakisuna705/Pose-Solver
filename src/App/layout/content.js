import React, { Component } from "react";

import Workspace from "App/workspace/workspace.js";

export default class Content extends Component {
  constructor(props) {
    super(props);

    //this.state = {
    //coach: {
    //skeleton: COACH_SKELETON,
    //skin: COACH_SKIN,
    //racket: COACH_SKIN,
    //},

    //player: {
    //skeleton: PLAYER_SKELETON,
    ////skin: PLAYER_SKIN,
    ////racket: PLAYER_RACKET,
    //},
    //};
  }

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
