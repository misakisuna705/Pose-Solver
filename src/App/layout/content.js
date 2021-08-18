import React, { Component } from "react";

import Workspace from "App/workspace/workspace.js";

//import COACH_SKELETON from "assets/bvh/data_3d1.bvh";
import COACH_SKELETON from "assets/coach3/skeleton.bvh";
//import PLAYER_SKELETON from "assets/bvh/data_3d2.bvh";
//import PLAYER_SKELETON from "assets/coach2/skeleton.bvh";
//import PLAYER_SKELETON from "assets/player/skeleton.bvh";
//import PLAYER_SKELETON from "assets/player/User1Char00.bvh";
//import PLAYER_SKELETON from "assets/player/User2Char00.bvh";
import PLAYER_SKELETON from "assets/player/User3_Char00.bvh";
//import COACH_SKIN from "assets/coach3/skin.fbx";
//import PLAYER_SKIN from "assets/coach2/skin.fbx";
//import COACH_RACKET from "assets/coach3/racket.fbx";
//import PLAYER_RACKET from "assets/coach2/racket.fbx";

//import XNECTURL from "assets/xnect/post_raw3D.txt";

export default class Content extends Component {
  constructor(props) {
    super(props);

    this.state = {
      coach: {
        skeleton: COACH_SKELETON,
        //skin: COACH_SKIN,
        //racket: COACH_SKIN,
      },

      player: {
        skeleton: PLAYER_SKELETON,
        //skin: PLAYER_SKIN,
        //racket: PLAYER_RACKET,
      },
    };
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
