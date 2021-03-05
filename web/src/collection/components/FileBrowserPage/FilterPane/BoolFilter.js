import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import FilterContainer from "./FilterContainer";
import ButtonSelect from "../../../../common/components/ButtonSelect";
import { useIntl } from "react-intl";

function BoolFilter(props) {
  const {
    title,
    value,
    onChange,
    tooltip,
    className,
    trueText: propTrueText,
    falseText: propFalseText,
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
    <FilterContainer
      title={title}
      className={clsx(className)}
      tooltip={tooltip}
      {...other}
    >
      <ButtonSelect value={value} onChange={handleChange}>
        <ButtonSelect.Option value={false}>{falseText}</ButtonSelect.Option>
        <ButtonSelect.Option value={true}>{trueText}</ButtonSelect.Option>
      </ButtonSelect>
    </FilterContainer>
  );
}

BoolFilter.propTypes = {
  /**
   * Filter title to be displayed
   */
  title: PropTypes.string.isRequired,
  /**
   * Boolean value to be applied.
   */
  value: PropTypes.bool,
  /**
   * Handle value change
   */
  onChange: PropTypes.func,
  /**
   * Optional filter tooltip
   */
  tooltip: PropTypes.string,
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

export default BoolFilter;
