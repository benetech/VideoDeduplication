import PropTypes from "prop-types";
import React from "react";

function ExifIcon(props) {
  const { className } = props;
  return <div className={className}>[EXIF]</div>;
}

ExifIcon.propTypes = {
  className: PropTypes.string,
};

export default ExifIcon;
