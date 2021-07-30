import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import ButtonPicker from "../../components/basic/ButtonPicker";

export const Period = {
  day: "day",
  week: "week",
  month: "month",
};

const periods = (intl) => [
  {
    title: intl.formatMessage({ id: "period.day" }),
    value: Period.day,
  },
  {
    title: intl.formatMessage({ id: "period.week" }),
    value: Period.week,
  },
  {
    title: intl.formatMessage({ id: "period.month" }),
    value: Period.month,
  },
];

function PeriodPicker(props) {
  const { period, onChange, className } = props;
  const intl = useIntl();

  const options = useMemo(() => periods(intl), [intl.locale]);

  return (
    <ButtonPicker
      className={className}
      options={options}
      selected={period}
      onChange={onChange}
    />
  );
}

PeriodPicker.propTypes = {
  onChange: PropTypes.func,
  period: PropTypes.oneOf([Period.day, Period.week, Period.month]).isRequired,
  className: PropTypes.string,
};

export default PeriodPicker;
