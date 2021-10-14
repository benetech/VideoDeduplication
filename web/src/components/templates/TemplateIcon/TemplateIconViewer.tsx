import React from "react";
import { IconKind, TemplateIcon } from "../../../model/Template";
import StandardIcon from "../StandardIcon";
import CustomIcon from "./CustomIcon";

/**
 * Generic template icon component.
 */

function TemplateIconViewer(props: TemplateIconViewerProps): JSX.Element {
  const { icon, ...other } = props;

  if (icon.kind === IconKind.PREDEFINED) {
    return <StandardIcon name={icon.key} {...other} />;
  } else {
    return <CustomIcon url={icon.key} {...other} />;
  }
}

type TemplateIconViewerProps = {
  /**
   * Template icon to be displayed.
   */
  icon: TemplateIcon;
  className?: string;
};
export default TemplateIconViewer;
