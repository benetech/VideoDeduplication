import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import ButtonSelect from "./ButtonSelect";

function BoolInput(props) {
  const {
    value,
    onChange,
    trueText: propTrueText,
    falseText: propFalseText,
    className,
    ...other
  } = props;
  const intl = useIntl();

  const handleChange = useCallback(
    (newValue) => {
      if (newValue === value) {
        onChange(null);
      } else {
        onChange(newValue);
      }
    },
    [value, onChange]
  );

  const trueText = propTrueText || intl.formatMessage({ id: "filter.yes" });
  const falseText = propFalseText || intl.formatMessage({ id: "filter.no" });

  return (
    <ButtonSelect
      value={value}
      onChange={handleChange}
      className={className}
      {...other}
    >
      <ButtonSelect.Option value={false}>{falseText}</ButtonSelect.Option>
      <ButtonSelect.Option value={true}>{trueText}</ButtonSelect.Option>
    </ButtonSelect>
  );
}

BoolInput.propTypes = {
  /**
   * Boolean value to be applied.
   */
  value: PropTypes.bool,
  /**
   * Handle value change
   */
  onChange: PropTypes.func,
  /**
   * Text displayed for true option.
   */
  trueText: PropTypes.string,
  /**
   * Text displayed for false option.
   */
  falseText: PropTypes.string,
  className: PropTypes.string,
};

export default BoolInput;
