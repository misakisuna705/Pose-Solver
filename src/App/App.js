import React, { Component, Fragment } from "react";

import Header from "App/layout/header.js";
import Content from "App/layout/content.js";
import Footer from "App/layout/footer.js";

import "App/App.css";

export default class App extends Component {
  render() {
    return (
      <Fragment>
        <Header />

        <Content />

        <Footer />
      </Fragment>
    );
  }
}
