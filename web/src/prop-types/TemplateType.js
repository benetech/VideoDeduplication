import PropTypes from "prop-types";
import IconKind from "../application/state/templates/IconKind";

export const TemplateIconType = PropTypes.shape({
  kind: PropTypes.oneOf([IconKind.PREDEFINED, IconKind.CUSTOM]).isRequired,
  key: PropTypes.string.isRequired,
});

export const TemplateExampleType = PropTypes.shape({
  id: PropTypes.any.isRequired,
  url: PropTypes.string.isRequired,
  templateId: PropTypes.any.isRequired,
});

export const TemplateType = PropTypes.shape({
  id: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  icon: TemplateIconType,
  examples: PropTypes.arrayOf(TemplateExampleType).isRequired,
  fileCount: PropTypes.number,
});
