import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import AttributeTable from "../../../../../common/components/AttributeTable";
import { matchTemplatesAttributes } from "../requestAttributes";

function MatchTemplatesRequestAttrs(props) {
  const { request, className, ...other } = props;
  return (
    <AttributeTable
      className={clsx(className)}
      value={request}
      attributes={matchTemplatesAttributes}
      {...other}
    />
  );
}

MatchTemplatesRequestAttrs.propTypes = {
  /**
   * Match-Templates Request to be displayed.
   */
  request: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default MatchTemplatesRequestAttrs;
