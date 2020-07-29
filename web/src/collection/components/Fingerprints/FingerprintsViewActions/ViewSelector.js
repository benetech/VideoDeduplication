import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import SquaredIconButton from "../../../../common/components/SquaredIconButton";
import ViewListIcon from "@material-ui/icons/ViewStream";
import ViewGridIcon from "@material-ui/icons/ViewModule";
import { View } from "./view";

const useStyles = makeStyles((theme) => ({
  group: {},
  buttonLeft: {
    borderRight: "none",
    "&:hover": {
      borderRight: "none",
    },
  },
  buttonRight: {
    borderLeft: "none",
    "&:hover": {
      borderLeft: "none",
    },
  },
}));

function ViewSelector(props) {
  const { view, onChange, className } = props;
  const classes = useStyles();

  return (
    <ButtonGroup className={clsx(classes.group, className)}>
      <SquaredIconButton
        onClick={() => onChange(View.list)}
        variant={view === View.list ? "contained" : "outlined"}
        color={view === View.list ? "primary" : "secondary"}
        className={classes.buttonLeft}
      >
        <ViewListIcon />
      </SquaredIconButton>
      <SquaredIconButton
        onClick={() => onChange(View.grid)}
        variant={view === View.grid ? "contained" : "outlined"}
        color={view === View.grid ? "primary" : "secondary"}
        className={classes.buttonRight}
      >
        <ViewGridIcon />
      </SquaredIconButton>
    </ButtonGroup>
  );
}

ViewSelector.propTypes = {
  view: PropTypes.oneOf([View.list, View.grid]),
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default ViewSelector;
