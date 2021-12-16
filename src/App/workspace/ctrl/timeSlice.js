import React, { Component, Fragment } from "react";

import { withStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import MenuIcon from "@material-ui/icons/Menu";

import EditIcon from "@material-ui/icons/Edit";
import DoneIcon from "@material-ui/icons/Done";
import MicIcon from '@material-ui/icons/Mic';
import StopIcon from '@material-ui/icons/Stop';

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
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
});

export default withStyles(styles, { withTheme: true })(
  class TimeSlice extends Component {
    constructor(props) {
      super(props);

      this.state = {
        mobileOpen: false,
        open: false,
        expanded: false,
      };

      this.toggleDrawer = this.toggleDrawer.bind(this);
    }

    toggleDrawer() {
      this.setState({ mobileOpen: !this.state.mobileOpen });
    }

    render() {
      const props = this.props;
      const classes = props.classes;
      const timeSlice = props.timeSlice;

      const handleChange = (panel) => (event, isExpanded) => {
        this.setState({ expanded: isExpanded ? panel : false });

        props.updateFramePos(panel);
        props.updateFramePos(panel);
        props.updateFramePos(panel);
      };

      const drawer = (
        <div className={classes.root}>
          {timeSlice.time.map((text, index) => (
            <Accordion key={text} expanded={this.state.expanded === text} onChange={handleChange(text)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2bh-content" id="panel2bh-header">
                <Typography className={classes.heading}>{"frame " + index}</Typography>

                <Typography className={classes.secondaryHeading}>
                  {String(text[0]).padStart(4, "0") +
                    " " +
                    String(text[1]).padStart(4, "0") +
                    " " +
                    String(text[2]).padStart(4, "0")}
                </Typography>
              </AccordionSummary>

              <AccordionDetails>
                <IconButton
                  onClick={(event) => {
                    props.deleteTimeSlice(index);
                  }}
                >
                  <DeleteIcon />
                </IconButton>

              </AccordionDetails>
            </Accordion>
          ))}
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
              //anchor={theme.direction === "rtl" ? "right" : "left"}
              anchor="right"
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
              anchor="right"
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


                //<IconButton onClick={(event) => {}}>
                  //<EditIcon />
                //</IconButton>

                //<IconButton onClick={(event) => {}}>
                  //<DoneIcon />
                //</IconButton>

                //<IconButton onClick={(event) => {}}>
                  //<MicIcon />
                //</IconButton>

                //<IconButton onClick={(event) => {}}>
                  //<StopIcon />
                //</IconButton>
