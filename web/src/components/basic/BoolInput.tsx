import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import ButtonSelect from "./ButtonSelect";
import ButtonSelectOption from "./ButtonSelect/ButtonSelectOption";

function BoolInput(props: BoolInputProps): JSX.Element {
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
  const trueText =
    propTrueText ||
    intl.formatMessage({
      id: "filter.yes",
    });
  const falseText =
    propFalseText ||
    intl.formatMessage({
      id: "filter.no",
    });
  return (
    <ButtonSelect
      value={value}
      onChange={handleChange}
      className={className}
      {...other}
    >
      <ButtonSelectOption value={false}>{falseText}</ButtonSelectOption>
      <ButtonSelectOption value={true}>{trueText}</ButtonSelectOption>
    </ButtonSelect>
  );
}

type BoolInputProps = {
  /**
   * Boolean value to be applied.
   */
  value: boolean | null;

  /**
   * Handle value change
   */
  onChange: (value: boolean | null) => void;

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
export default BoolInput;
