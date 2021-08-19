import React, { Component, Fragment } from "react";

import { withStyles } from "@material-ui/core/styles";
import Collapse from "@material-ui/core/Collapse";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import BorderInnerIcon from "@material-ui/icons/BorderInner";
import BorderOuterIcon from "@material-ui/icons/BorderOuter";
import BorderLeftIcon from "@material-ui/icons/BorderLeft";
import BorderRightIcon from "@material-ui/icons/BorderRight";
import BorderTopIcon from "@material-ui/icons/BorderTop";
import CameraAltIcon from "@material-ui/icons/CameraAlt";
import CollectionsIcon from "@material-ui/icons/Collections";
import CompareIcon from "@material-ui/icons/Compare";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import ImageIcon from "@material-ui/icons/Image";
import MenuIcon from "@material-ui/icons/Menu";
import ZoomOutMapIcon from "@material-ui/icons/ZoomOutMap";

const drawerWidth = 240;

const styles = (theme) => ({
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    //width: theme.spacing(7) + 1,
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("md")]: {
      //width: theme.spacing(9) + 1,
      width: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  drawerPaper: {
    width: drawerWidth,
  },
});

export default withStyles(styles, { withTheme: true })(
  class ModePicker extends Component {
    constructor(props) {
      super(props);

      this.state = {
        mobileOpen: false,
        open: false,
        sceneModeOpen: false,
        cameraModeOpen: false,
      };

      this.toggleDrawer = this.toggleDrawer.bind(this);
      this.toggleSceneMode = this.toggleSceneMode.bind(this);
      this.toggleCameraMode = this.toggleCameraMode.bind(this);
      this.updateSceneMode = this.updateSceneMode.bind(this);
      this.updateCameraMode = this.updateCameraMode.bind(this);
    }

    toggleDrawer() {
      this.setState({ mobileOpen: !this.state.mobileOpen });
    }

    toggleSceneMode() {
      this.setState({ sceneModeOpen: !this.state.sceneModeOpen });
    }

    toggleCameraMode() {
      this.setState({ cameraModeOpen: !this.state.cameraModeOpen });
    }

    updateSceneMode(event, index) {
      this.props.updateSceneMode(index);
    }

    updateCameraMode(event, index) {
      this.props.updateCameraMode(index);
    }

    render() {
      const props = this.props;
      const classes = props.classes;
      const theme = props.theme;
      const mode = props.mode;

      const drawer = (
        <div>
          <List>
            <ListItem button onClick={this.toggleSceneMode}>
              <ListItemIcon>
                <ImageIcon />
              </ListItemIcon>

              <ListItemText primary="Scene Mode" />
              {this.state.sceneModeOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>

            <Collapse in={this.state.sceneModeOpen} timeout="auto" unmountOnExit>
              <List>
                <ListItem
                  key={"Overlap Scene"}
                  button
                  onClick={(event) => this.updateSceneMode(event, 0)}
                  selected={mode.sceneMode === 0}
                >
                  <ListItemIcon>
                    <CollectionsIcon />
                  </ListItemIcon>

                  <ListItemText primary={"Overlap Scene"} />
                </ListItem>

                <ListItem
                  key={"Seperate Scene"}
                  button
                  onClick={(event) => this.updateSceneMode(event, 1)}
                  selected={mode.sceneMode === 1}
                >
                  <ListItemIcon>
                    <CompareIcon />
                  </ListItemIcon>

                  <ListItemText primary={"Seperate Scene"} />
                </ListItem>
              </List>
            </Collapse>

            <Divider />

            <ListItem button onClick={this.toggleCameraMode}>
              <ListItemIcon>
                <CameraAltIcon />
              </ListItemIcon>

              <ListItemText primary="Camera Mode" />
              {this.state.cameraModeOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>

            <Collapse in={this.state.cameraModeOpen} timeout="auto" unmountOnExit>
              <List>
                <ListItem
                  key={"Free Camera"}
                  button
                  onClick={(event) => this.updateCameraMode(event, 0)}
                  selected={mode.cameraMode === 0}
                >
                  <ListItemIcon>
                    <ZoomOutMapIcon />
                  </ListItemIcon>

                  <ListItemText primary={"Free Camera"} />
                </ListItem>

                <ListItem
                  key={"Front Camera"}
                  button
                  onClick={(event) => this.updateCameraMode(event, 1)}
                  selected={mode.cameraMode === 1}
                >
                  <ListItemIcon>
                    <BorderInnerIcon />
                  </ListItemIcon>

                  <ListItemText primary={"Front Camera"} />
                </ListItem>

                <ListItem
                  key={"Back Camera"}
                  button
                  onClick={(event) => this.updateCameraMode(event, 2)}
                  selected={mode.cameraMode === 2}
                >
                  <ListItemIcon>
                    <BorderOuterIcon />
                  </ListItemIcon>

                  <ListItemText primary={"Back Camera"} />
                </ListItem>

                <ListItem
                  key={"Left Camera"}
                  button
                  onClick={(event) => this.updateCameraMode(event, 3)}
                  selected={mode.cameraMode === 3}
                >
                  <ListItemIcon>
                    <BorderLeftIcon />
                  </ListItemIcon>

                  <ListItemText primary={"Left Camera"} />
                </ListItem>

                <ListItem
                  key={"Right Camera"}
                  button
                  onClick={(event) => this.updateCameraMode(event, 4)}
                  selected={mode.cameraMode === 4}
                >
                  <ListItemIcon>
                    <BorderRightIcon />
                  </ListItemIcon>

                  <ListItemText primary={"Right Camera"} />
                </ListItem>

                <ListItem
                  key={"Top Camera"}
                  button
                  onClick={(event) => this.updateCameraMode(event, 5)}
                  selected={mode.cameraMode === 5}
                >
                  <ListItemIcon>
                    <BorderTopIcon />
                  </ListItemIcon>

                  <ListItemText primary={"Top Camera"} />
                </ListItem>
              </List>
            </Collapse>
          </List>
        </div>
      );

      return (
        <Fragment>
          <CssBaseline />

          <Hidden smUp implementation="css">
            <IconButton onClick={this.toggleDrawer}>
              <MenuIcon />
            </IconButton>

            <SwipeableDrawer
              variant="temporary"
              anchor={theme.direction === "rtl" ? "right" : "left"}
              open={this.state.mobileOpen}
              onOpen={this.toggleDrawer}
              onClose={this.toggleDrawer}
              classes={{
                paper: classes.drawerPaper,
              }}
              PaperProps={{
                style: {
                  position: "absolute",
                  border: "none",
                },
              }}
              ModalProps={{
                container: document.getElementById("drawer-container"),
                disableEnforceFocus: true,
                style: { position: "absolute" },
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              {drawer}
            </SwipeableDrawer>
          </Hidden>

          <Hidden xsDown implementation="css">
            <Drawer
              className={classes.drawerClose}
              classes={{
                paper: classes.drawerClose,
              }}
              variant="permanent"
              open
              PaperProps={{
                style: {
                  position: "absolute",
                  border: "none",
                },
              }}
              ModalProps={{
                container: document.getElementById("drawer-container"),
                disableEnforceFocus: true,
                style: { position: "absolute" },
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
        </Fragment>
      );
    }
  }
);
