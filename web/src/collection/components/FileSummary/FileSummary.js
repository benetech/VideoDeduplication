import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Name from "./Name";
import { FileType } from "../FileBrowserPage/FileType";
import Divider from "./Divider";
import Spacer from "./Spacer";
import Fingerprint from "./Fingerprint";
import Duration from "./Duration";
import CreationDate from "./CreationDate";
import HasExif from "./HasExif";
import HasAudio from "./HasAudio";

const useStyles = makeStyles((theme) => ({
  summary: {
    display: "flex",
    alignItems: "center",
  },
}));

/**
 * Set the following properties: selected, onSelect and value (if absent)
 */
function bindProps(file) {
  return (attribute) => {
    if (!React.isValidElement(attribute)) {
      return null;
    }

    return React.cloneElement(attribute, {
      file,
      ...attribute.props,
    });
  };
}

/**
 * Add indentation between attribute elements.
 * @param attributes attribute elements array.
 * @param divider display visible dividers
 */
function indentAttributes(attributes, divider) {
  const result = [];
  const IndentComponent = divider ? Divider : Spacer;
  if (attributes != null) {
    attributes.forEach((attribute, index) => {
      result.push(attribute);
      if (index < attributes.length - 1) {
        result.push(<IndentComponent key={`divider-${index}`} />);
      }
    });
  }
  return result;
}

/**
 * Linear file attribute list.
 */
function FileSummary(props) {
  const { file, children, divider = false, className, ...other } = props;
  const classes = useStyles();

  // Set required child properties
  let attributes = React.Children.map(children, bindProps(file));

  // Add dividers or spacers between attribute elements
  attributes = indentAttributes(attributes, divider);

  return (
    <div className={clsx(classes.summary, className)} {...other}>
      {attributes}
    </div>
  );
}

FileSummary.Name = Name;
FileSummary.Fingerprint = Fingerprint;
FileSummary.Duration = Duration;
FileSummary.CreationDate = CreationDate;
FileSummary.HasExif = HasExif;
FileSummary.HasAudio = HasAudio;

FileSummary.propTypes = {
  /**
   * Video file to be summarized.
   */
  file: FileType.isRequired,
  /**
   * Show divider between attributes.
   */
  divider: PropTypes.bool,
  /**
   * Summary attributes list.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default FileSummary;
