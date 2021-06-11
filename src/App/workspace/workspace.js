import React, { Component } from "react";
import { Viewer } from "App/workspace/viewer";

export default class Workspace extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: undefined,
      height: undefined,
    };

    this.resize = this.resize.bind(this);
  }

  componentWillMount() {
    this.resize();

    window.removeEventListener("resize", this.resize, false);
  }

  componentDidMount() {
    this.viewer = new Viewer({ container: this.element });

    window.addEventListener("resize", this.resize, false);
  }

  render() {
    return <div ref={(element) => (this.element = element)} style={{ width: this.state.width, height: this.state.height }} />;
  }

  resize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }
}
