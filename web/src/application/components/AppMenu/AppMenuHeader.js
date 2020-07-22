import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Typography from "@material-ui/core/Typography";
import Label from "../../../common/components/Label";

const useStyles = makeStyles((theme) => ({
  headerRoot: {
    height: 146,
    flexShrink: 0,
  },
  open: {
    width: "100%",
    height: theme.dimensions.list.itemHeight,
    padding: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  close: {
    width: theme.dimensions.list.collapseWidth,
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  row: {
    height: theme.dimensions.list.itemHeight,
  },
  title: {
    color: theme.palette.primary.main,
  },
  button: {
    color: theme.palette.common.black,
  },
}));

/**
 * Header of the application left-side menu.
 */
function AppMenuHeader(props) {
  const { open, onToggle, className } = props;
  const classes = useStyles();

  if (open) {
    return (
      <div className={clsx(classes.headerRoot, className)}>
        <div className={classes.open}>
          <Typography variant="h4">++</Typography>
          <Label role="title2" color="primary">
            winnow
          </Label>
          <IconButton onClick={onToggle} className={classes.button}>
            <MenuIcon fontSize="large" />
          </IconButton>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(classes.headerRoot, className)}>
      <div className={classes.close}>
        <Label role="title2" color="primary">
          wnn
        </Label>
        <div className={classes.row}>
          <IconButton
            className={clsx(classes.row, classes.button)}
            onClick={onToggle}
          >
            <MenuIcon fontSize="large" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

AppMenuHeader.propTypes = {
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func,
  className: PropTypes.string,
};

export default AppMenuHeader;
