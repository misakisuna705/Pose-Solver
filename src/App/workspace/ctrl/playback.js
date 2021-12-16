import React, { Component } from "react";

import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import ToggleButton from "@material-ui/lab/ToggleButton";
import PauseIcon from "@material-ui/icons/Pause";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import AddIcon from "@material-ui/icons/Add";

import { Range } from "rc-slider";
import "rc-slider/assets/index.css";

import Typography from "@material-ui/core/Typography";
import WarningIcon from "@material-ui/icons/Warning";

export default class Playback extends Component {
  render() {
    const props = this.props;
    const playback = props.playback;

    return (
      <Grid container>
        <Grid container item xs={12} alignItems="center">
          <Grid item xs={1}>
            <IconButton onClick={props.updatePlayMode}>{playback.isPlay ? <PauseIcon /> : <PlayArrowIcon />}</IconButton>
          </Grid>

          <Grid item xs={2}>
            <Typography>
              {String(playback.curFrame[1]).padStart(4, "0") + " / " + String(playback.curFrame[2]).padStart(4, "0")}
            </Typography>
          </Grid>

          <Grid item xs={7}>
            <Range
              allowCross={false}
              max={playback.maxValue}
              defaultValue={playback.curFrame}
              value={playback.curFrame}
              onChange={props.updateFramePos}
            />
          </Grid>

          <Grid item xs={1}>
            <IconButton
              onClick={(event) => {
                props.createTimeSlice(playback.curFrame);
              }}
            >
              <AddIcon />
            </IconButton>
          </Grid>

          <Grid item xs={1}>
            <Typography>AddToList</Typography>
          </Grid>
        </Grid>

        <Grid container item xs={12} alignItems="center">
          <Grid item xs={1}>
            <IconButton>
              <WarningIcon />
            </IconButton>
          </Grid>

          <Grid item xs={2}>
            <Typography>Low Correct Rate</Typography>
          </Grid>

          <Grid item xs={7}>
            <Range
              max={playback.maxValue}
              defaultValue={playback.curFrame}
              value={playback.badValue}
              trackStyle={playback.badColor}
              disabled
            />
          </Grid>

          <Grid item xs={2}></Grid>
        </Grid>
      </Grid>
    );
  }
}
