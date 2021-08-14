import React, { Component, Fragment } from "react";

import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import ToggleButton from "@material-ui/lab/ToggleButton";
import PauseIcon from "@material-ui/icons/Pause";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import ReplayIcon from "@material-ui/icons/Replay";

import { Range } from "rc-slider";
import "rc-slider/assets/index.css";

export default class Playback extends Component {
  render() {
    const props = this.props;
    const playback = props.playback;

    return (
      <Fragment>
        <Grid container spacing={2}>
          <Grid item>
            <IconButton onClick={props.updatePlayMode}>{playback.isPlay ? <PauseIcon /> : <PlayArrowIcon />}</IconButton>
          </Grid>

          <Grid item>{playback.frame[1]}</Grid>

          <Grid item xs>
            <Range allowCross={false} defaultValue={playback.frame} value={playback.frame} onChange={props.updateFramePos} />
          </Grid>

          <Grid item>100</Grid>

          <Grid item>
            <IconButton
              onClick={(event) => {
                props.createTimeSlice(playback.frame);
              }}
            >
              <PlaylistAddIcon />
            </IconButton>
          </Grid>

          <Grid item>
            <ToggleButton value="check" selected={playback.isLoop} onChange={props.updateLoopMode}>
              <ReplayIcon />
            </ToggleButton>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}
