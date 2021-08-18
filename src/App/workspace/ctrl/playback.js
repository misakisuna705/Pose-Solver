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

          <Grid item>{String(playback.curFrame[1]).padStart(4, "0")}</Grid>

          <Grid item xs>
            <Range
              allowCross={false}
              max={playback.maxValue}
              defaultValue={playback.curFrame}
              value={playback.curFrame}
              onChange={props.updateFramePos}
            />

            <Range
              max={playback.maxValue}
              defaultValue={playback.curFrame}
              value={playback.badValue}
              trackStyle={playback.badColor}
              disabled
            />
          </Grid>

          <Grid item>{String(playback.curFrame[2]).padStart(4, "0")}</Grid>

          <Grid item>
            <IconButton
              onClick={(event) => {
                props.createTimeSlice(playback.curFrame);
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
