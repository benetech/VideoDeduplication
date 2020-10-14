import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";

function Presets(props) {
  const { className } = props;
  return <div className={clsx(className)} />;
}

Presets.propTypes = {
  className: PropTypes.string,
};

export default Presets;
