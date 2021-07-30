import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import FilterContainer from "./FilterContainer";
import BoolInput from "../../../components/basic/BoolInput";

function BoolFilter(props) {
  const {
    title,
    value,
    onChange,
    tooltip,
    className,
    trueText,
    falseText,
    ...other
  } = props;

  return (
    <FilterContainer
      title={title}
      className={clsx(className)}
      tooltip={tooltip}
      {...other}
    >
      <BoolInput
        value={value}
        onChange={onChange}
        trueText={trueText}
        falseText={falseText}
      />
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
