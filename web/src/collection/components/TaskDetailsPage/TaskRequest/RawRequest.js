import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ReactJson from "react-json-view";

const useStyles = makeStyles((theme) => ({}));

function RawRequest(props) {
  const { request, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(className)} {...other}>
      <ReactJson src={request} displayDataTypes={false} name={false} />
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
