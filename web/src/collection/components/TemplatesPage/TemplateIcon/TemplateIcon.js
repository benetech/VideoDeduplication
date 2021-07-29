import React from "react";
import PropTypes from "prop-types";
import { TemplateIconType } from "../../../../prop-types/TemplateType";
import IconKind from "../../../../application/state/templates/IconKind";
import StandardIcon from "../StandardIcon";
import CustomIcon from "./CustomIcon";

/**
 * Generic template icon component.
 */
function TemplateIcon(props) {
  const { icon, ...other } = props;
  if (icon?.kind === IconKind.PREDEFINED) {
    return <StandardIcon name={icon.key} {...other} />;
  } else {
    return <CustomIcon url={icon?.key} {...other} />;
  }
}

TemplateIcon.propTypes = {
  /**
   * Template icon to be displayed.
   */
  icon: TemplateIconType,
  className: PropTypes.string,
};

export default TemplateIcon;
