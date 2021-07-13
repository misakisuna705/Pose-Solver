import React, { Component } from "react";
import { Viewer } from "App/Workspace/View/viewer";

export default class Workspace extends Component {
  constructor(props) {
    super(props);

    this.element = undefined;
  }

  render() {
    return (
      <div style={{ height: "100%" }}>
        <div ref={(element) => (this.element = element)} style={{ height: "100%" }} />
      </div>
    );
  }

  componentDidMount() {
    this.viewer = new Viewer({ container: this.element });
  }
}
