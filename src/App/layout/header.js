import React, { Component } from "react";
import { Button, Nav, Navbar } from "react-bootstrap";

import LOGOURL from "assets/img/logo.png";

export default class Header extends Component {
  render() {
    return (
      <Navbar bg="light" expand="lg">
        <Navbar.Brand>
          <img
            style={{
              width: "130px",
              marginLeft: "10px",
            }}
            src={LOGOURL}
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <div style={{ color: "#818181", display: "block", fontSize: "15px", padding: ".5rem 0rem .5rem 1rem" }}>
            <span style={{ color: "#004D91", fontWeight: "bold" }}>Hello</span>, welcome back root!{" "}
          </div>

          <Nav className="mr-auto" style={{ marginLeft: "1rem" }}>
            <Nav.Link>Dashboard</Nav.Link>

            <Nav.Link>Sessions</Nav.Link>

            <Nav.Link>Setting</Nav.Link>
          </Nav>

          <Nav className="ml-auto">
            <Nav.Link>
              <Button
                style={{
                  margin: "auto 0",
                  marginLeft: "1rem",
                }}
              >
                Logout
              </Button>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
