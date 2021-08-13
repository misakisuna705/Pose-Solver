import React, { Component } from "react";

import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

import FormatBoldIcon from "@material-ui/icons/FormatBold";
import FormatColorFillIcon from "@material-ui/icons/FormatColorFill";
import FormatItalicIcon from "@material-ui/icons/FormatItalic";
import FormatUnderlinedIcon from "@material-ui/icons/FormatUnderlined";

export default class ButtonToggler extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formats: ["bold", "italic"],
    };
  }

  render() {
    return (
      <ToggleButtonGroup value={this.state.formats} onChange={this.handleFormat} aria-label="text formatting">
        <ToggleButton value="bold" aria-label="bold">
          <FormatBoldIcon />
        </ToggleButton>
        <ToggleButton value="italic" aria-label="italic">
          <FormatItalicIcon />
        </ToggleButton>
        <ToggleButton value="underlined" aria-label="underlined">
          <FormatUnderlinedIcon />
        </ToggleButton>
        <ToggleButton value="color" aria-label="color" disabled>
          <FormatColorFillIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    );
  }
}
