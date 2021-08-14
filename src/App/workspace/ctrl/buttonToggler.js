import React, { Component } from "react";

import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";
import PersonIcon from "@material-ui/icons/Person";
import NatureIcon from "@material-ui/icons/Nature";

export default class ButtonToggler extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formats: ["a", "b", "c"],
    };

    this.handleFormat = this.handleFormat.bind(this);
  }

  handleFormat(event, newFormats) {
    this.setState({ formats: newFormats });
  }

  render() {
    return (
      <ToggleButtonGroup value={this.state.formats} onChange={this.handleFormat} aria-label="text formatting">
        <ToggleButton value="a">
          <PersonOutlineIcon />
        </ToggleButton>
        <ToggleButton value="b" disabled>
          <PersonIcon />
        </ToggleButton>
        <ToggleButton value="c" disabled>
          <NatureIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    );
  }
}
