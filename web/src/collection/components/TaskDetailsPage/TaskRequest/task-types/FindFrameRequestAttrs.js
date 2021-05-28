import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import AttributeTable from "../../../../../common/components/AttributeTable";
import { findFrameAttributes } from "../requestAttributes";

function FindFrameRequestAttrs(props) {
  const { request, className, ...other } = props;
  return (
    <AttributeTable
      value={request}
      attributes={findFrameAttributes}
      className={clsx(className)}
      {...other}
    />
  );
}

FindFrameRequestAttrs.propTypes = {
  /**
   * Find-Frame Request to be displayed.
   */
  request: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default FindFrameRequestAttrs;
