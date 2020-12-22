import React, { Component } from "react";

import Renderer from "App/workspace/viewer";

export default class Workspace extends Component {
  componentDidMount() {
    this.viewer = new Renderer();

    this.element.appendChild(this.viewer.domElement);
  }

  render() {
    return <div ref={element => (this.element = element)} />;
  }
}
