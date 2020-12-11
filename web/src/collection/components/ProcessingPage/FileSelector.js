import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Button from "../../../common/components/Button";

const useStyles = makeStyles(() => ({
  selector: {
    height: 600,
    border: "4px dashed #D8D8D8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

function FileSelector(props) {
  const { className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.selector, className)}>
      <Button color="primary" variant="outlined">
        Process Entire Dataset
      </Button>
    </div>
  );
}

FileSelector.propTypes = {
  /**
   * Submit a new task.
   */
  onSubmit: PropTypes.func,
  className: PropTypes.string,
};

export default FileSelector;
