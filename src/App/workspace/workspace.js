import React, { Component } from "react";
import { Viewer } from "App/workspace/viewer";

export default class Workspace extends Component {
  componentDidMount() {
    this.viewer = new Viewer({ container: this.element });
  }

  render() {
    return <div ref={(element) => (this.element = element)} />;
  }
}
