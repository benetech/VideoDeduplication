import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileType from "../../VideoDetailsPage/FileType";

const useStyles = makeStyles((theme) => ({
  list: {
    display: "flex",
    maxWidth: 300,
  },
  extension: {
    marginRight: theme.spacing(1),
  },
}));

function ExtensionList(props) {
  const { extensions, className, ...other } = props;
  const classes = useStyles();

  if (extensions == null) {
    return null;
  }

  return (
    <div className={clsx(classes.list, className)} {...other}>
      {extensions.map((extension) => (
        <FileType className={classes.extension} type={extension} />
      ))}
    </div>
  );
}

ExtensionList.propTypes = {
  /**
   * File extensions to be displayed.
   */
  extensions: PropTypes.arrayOf(PropTypes.string.isRequired),
  className: PropTypes.string,
};

export default ExtensionList;
