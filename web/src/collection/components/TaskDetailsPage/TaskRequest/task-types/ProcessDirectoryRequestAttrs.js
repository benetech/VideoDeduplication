import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import AttributeTable from "../../../../../common/components/AttributeTable";
import { processDirectoryAttributes } from "../requestAttributes";

function ProcessDirectoryRequestAttrs(props) {
  const { request, className, ...other } = props;
  return (
    <AttributeTable
      className={clsx(className)}
      value={request}
      attributes={processDirectoryAttributes}
      {...other}
    />
  );
}

ProcessDirectoryRequestAttrs.propTypes = {
  /**
   * Process-Directory Request to be displayed.
   */
  request: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default ProcessDirectoryRequestAttrs;
