import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import FilterContainer from "./FilterContainer";
import ButtonSelect from "../../../../common/components/ButtonSelect";
import { useIntl } from "react-intl";

function BoolFilter(props) {
  const { title, value, onChange, className } = props;
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

  return (
    <FilterContainer title={title} className={clsx(className)}>
      <ButtonSelect value={value} onChange={handleChange}>
        <ButtonSelect.Option value={false}>
          {intl.formatMessage({ id: "filter.no" })}
        </ButtonSelect.Option>
        <ButtonSelect.Option value={true}>
          {intl.formatMessage({ id: "filter.yes" })}
        </ButtonSelect.Option>
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
  className: PropTypes.string,
};

export default BoolFilter;
