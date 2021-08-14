import React, { Component } from "react";

import { withStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import { BVHLoader } from "three/examples/jsm/loaders/BVHLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

import { Viewer } from "App/workspace/view/viewer.js";
import ModePicker from "App/workspace/ctrl/modePicker.js";
import TimeSlice from "App/workspace/ctrl/timeSlice.js";
import Playback from "App/workspace/ctrl/playback.js";
import ButtonToggler from "App/workspace/ctrl/buttonToggler.js";

//import COACH_SKELETON from "assets/bvh/data_3d1.bvh";
//import PLAYER_SKELETON from "assets/bvh/data_3d2.bvh";
import COACH_SKELETON from "assets/coach3/skeleton.bvh";
import PLAYER_SKELETON from "assets/coach2/skeleton.bvh";
//import COACH_SKIN from "assets/coach3/skin.fbx";
//import PLAYER_SKIN from "assets/coach2/skin.fbx";
//import COACH_RACKET from "assets/coach3/racket.fbx";
//import PLAYER_RACKET from "assets/coach2/racket.fbx";

//import XNECTURL from "assets/xnect/post_raw3D.txt";

const styles = (theme) => ({
  root: {
    width: 200,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
});

export default withStyles(styles, { withTheme: true })(
  class Workspace extends Component {
    constructor(props) {
      super(props);

      this.state = {
        isViewerReady: false,

        mode: {
          sceneMode: 0,
          cameraMode: 0,
        },

        playback: {
          isPlay: false,
          isLoop: false,
          frame: [0, 0, 100],
        },

        timeSlice: {
          time: [[0, 0, 100]],
        },

        formats: ["bold", "italic"],
      };

      //this.viewer.update(this.viewer.defaultFrame, sceneMode, "freeCam", "EDW", "all");

      this.element = undefined;

      this.load = this.load.bind(this);
      this.updateSceneMode = this.updateSceneMode.bind(this);
      this.updateCameraMode = this.updateCameraMode.bind(this);
      this.updatePlayMode = this.updatePlayMode.bind(this);
      this.updateLoopMode = this.updateLoopMode.bind(this);
      this.updateFramePos = this.updateFramePos.bind(this);
      this.createTimeSlice = this.createTimeSlice.bind(this);
      this.deleteTimeSlice = this.deleteTimeSlice.bind(this);
    }

    render() {
      const classes = this.props.classes;

      return (
        <div
          id="drawer-container"
          style={{ width: "100%", height: "100%", position: "relative", display: "flex", overflowY: "scroll" }}
        >
          <ModePicker mode={this.state.mode} updateSceneMode={this.updateSceneMode} updateCameraMode={this.updateCameraMode} />

          <div style={{ overflow: "hidden", flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <div ref={(element) => (this.element = element)} style={{ overflow: "hidden", flexGrow: 1 }}></div>

            <Playback
              playback={this.state.playback}
              updatePlayMode={this.updatePlayMode}
              updateLoopMode={this.updateLoopMode}
              updateFramePos={this.updateFramePos}
              createTimeSlice={this.createTimeSlice}
            />
          </div>

          <TimeSlice
            timeSlice={this.state.timeSlice}
            updateFramePos={this.updateFramePos}
            deleteTimeSlice={this.deleteTimeSlice}
          />

          <Backdrop className={classes.backdrop} open={!this.state.isViewerReady}>
            <CircularProgress color="inherit" />
          </Backdrop>
        </div>
      );
    }

    componentDidMount() {
      const rawsLoaded = [
        this.load(new BVHLoader(), COACH_SKELETON),
        this.load(new BVHLoader(), PLAYER_SKELETON),
        //this.load(new FBXLoader(), COACH_SKIN),
        //this.load(new FBXLoader(), PLAYER_SKIN),
        //this.load(new FBXLoader(), COACH_RACKET),
      ];

      Promise.all(rawsLoaded).then((raws) => {
        const viewer = (this.viewer = new Viewer({ container: this.element, raws: raws }));

        this.element.appendChild(viewer.domElement);

        viewer.init(this.state.playback.curFrame, this.state.mode.sceneMode, this.state.mode.cameraMode);

        this.setState({ isViewerReady: true });
      });
    }

    load(loader, url) {
      return new Promise((resolve) => {
        loader.load(url, resolve);
      });
    }

    updateSceneMode(mode) {
      this.setState({ mode: { ...this.state.mode, sceneMode: mode } });

      this.viewer.updateScene(mode);
    }

    updateCameraMode(mode) {
      this.setState({ mode: { ...this.state.mode, cameraMode: mode } });

      this.viewer.updateCamera(mode);
    }

    updatePlayMode() {
      this.setState({ playback: { ...this.state.playback, isPlay: !this.state.playback.isPlay } });
    }

    updateLoopMode() {
      this.setState({ playback: { ...this.state.playback, isLoop: !this.state.playback.isLoop } });
    }

    updateFramePos(frame) {
      this.setState({ playback: { ...this.state.playback, frame: frame } });

      this.viewer.updateModel(frame[1]);
    }

    createTimeSlice(frame) {
      console.log(frame);
      console.log(this.state.timeSlice.time[0]);

      if (this.state.timeSlice.time.includes(frame)) return;

      this.setState({ timeSlice: { ...this.state.timeSlice, time: [...this.state.timeSlice.time, frame] } });
    }

    deleteTimeSlice(index) {
      this.setState({ timeSlice: { ...this.state.timeSlice, time: this.state.timeSlice.time.filter((_, i) => i !== index) } });
    }
  }
);

//<ButtonToggler />;
