import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import PresetListItem from "./PresetListItem";

const useStyles = makeStyles<Theme>((theme) => ({
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

function bindStyles(
  presetClass?: string
): (preset: React.ReactNode) => React.ReactNode | null {
  return (preset) => {
    if (!React.isValidElement(preset)) {
      return null;
    } // Calculate class name

    const className = clsx(presetClass, preset.props.className);
    return React.cloneElement(preset, { ...preset.props, className });
  };
}

function PresetList(props: PresetListProps): JSX.Element {
  const { children, className, ...other } = props;
  const classes = useStyles(); // Bind styles

  const presets = React.Children.map(children, bindStyles(classes.preset));
  return (
    <div className={clsx(classes.root, className)} {...other}>
      {presets}
    </div>
  );
}

PresetList.Item = PresetListItem;
type PresetListProps = {
  /**
   * FilterContainer content.
   */
  children?: React.ReactNode;
  className?: string;
};
export default PresetList;
