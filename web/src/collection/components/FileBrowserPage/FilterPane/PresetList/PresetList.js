import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import PresetListItem from "./PresetListItem";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: theme.spacing(1),
  },
  preset: {
    marginBottom: theme.spacing(1),
  },
}));

/**
 * Set the preset list item styles.
 */
function bindStyles(presetClass) {
  return (preset) => {
    if (!React.isValidElement(preset)) {
      return null;
    }
    // Calculate class name
    const className = clsx(presetClass, preset.props.className);
    return React.cloneElement(preset, { ...preset.props, className });
  };
}

function PresetList(props) {
  const { children, className, ...other } = props;
  const classes = useStyles();

  // Bind styles
  const presets = React.Children.map(children, bindStyles(classes.preset));

  return (
    <div className={clsx(classes.root, className)} {...other}>
      {presets}
    </div>
  );
}

PresetList.Item = PresetListItem;

PresetList.propTypes = {
  /**
   * FilterContainer content.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default PresetList;
