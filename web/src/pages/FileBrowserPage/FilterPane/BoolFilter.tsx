import React from "react";
import clsx from "clsx";
import FilterContainer from "./FilterContainer";
import BoolInput from "../../../components/basic/BoolInput";

function BoolFilter(props: BoolFilterProps): JSX.Element {
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

type BoolFilterProps = {
  /**
   * Filter title to be displayed
   */
  title: string;

  /**
   * Boolean value to be applied.
   */
  value: boolean | null;

  /**
   * Handle value change
   */
  onChange: (value: boolean | null) => void;

  /**
   * Optional filter tooltip
   */
  tooltip?: string;

  /**
   * Text displayed for true option.
   */
  trueText?: string;

  /**
   * Text displayed for false option.
   */
  falseText?: string;
  className?: string;
};
export default BoolFilter;
