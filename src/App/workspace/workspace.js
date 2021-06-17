import React, { Component } from "react";
import { Viewer } from "App/workspace/viewer";

export default class Workspace extends Component {
  constructor(props) {
    super(props);

    this.state = {
      style: props.style,
      dimension: {
        width: props.width,
        height: props.height,
      },
      bvh: {
        refBvh: props.refBvh,
        cmpBvh: props.cmpBvh,
      },
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.width != prevProps.width || this.props.height != prevProps.height) {
      this.setState({
        dimension: {
          width: prevProps.width,
          height: prevProps.height,
        },
      });
    }
  }

  componentDidMount() {
    this.viewer = new Viewer({ container: this.element });
  }

  render() {
    return (
      <div
        ref={(element) => (this.element = element)}
        style={{ width: this.state.dimension.width, height: this.state.dimension.height }}
      />
    );
  }
}
