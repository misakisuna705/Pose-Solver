import React, { Component } from "react";
import { Layout } from "antd";

import Header from "App/Layout/header";
import Workspace from "App/Workspace/workspace";
import Footer from "App/Layout/footer";

import "App/App.css";

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Layout>
        <Header />

        <div style={{ backgroundColor: "#f8f9fa" }}>
          <h1 style={{ paddingTop: "30px", textAlign: "center" }}>Pose Visualization</h1>

          <div style={{ height: "calc(100vh - 243px)", paddingTop: "20px" }}>
            <Workspace />
          </div>
        </div>

        <Footer />
      </Layout>
    );
  }
}
