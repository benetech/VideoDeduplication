import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ReactJson from "react-json-view";

const useStyles = makeStyles({
  root: {
    maxHeight: "50vh",
    overflowY: "auto",
  },
});

function RawRequest(props) {
  const { request, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.root, className)} {...other}>
      <ReactJson
        src={request}
        displayDataTypes={false}
        name={false}
        groupArraysAfterLength={20}
      />
    </div>
  );
}

RawRequest.propTypes = {
  /**
   * Request to be displayed.
   */
  request: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default RawRequest;
