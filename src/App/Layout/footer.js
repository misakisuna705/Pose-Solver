import React, { Component } from "react";
import { Layout } from "antd";

export default class Footer extends Component {
  render() {
    return (
      <Layout style={{ textAlign: "center", backgroundColor: "white" }}>
        VRPong, NTHU
        <div style={{ fontSize: "10px", color: "#6D6D6D" }}>Copyright ©2021 All rights reserved</div>
      </Layout>
    );
  }
}
