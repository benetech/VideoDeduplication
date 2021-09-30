import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FilterContainer from "./FilterContainer";
import { useIntl } from "react-intl";
import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import TopLabelTextField from "../../../components/basic/TopLabelTextField";
import useUniqueId from "../../../lib/hooks/useUniqueId";
import { format as formatDate } from "date-fns";
import { Theme } from "@material-ui/core";
import { PartialRange, Range } from "../../../lib/helpers/Range";

const useStyles = makeStyles<Theme>((theme) => ({
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  lower: {
    marginBottom: theme.spacing(4),
  },
  upper: {},
}));

/**
 * Check if date is defined.
 */
function defined(date) {
  return date != null && !isNaN(date);
}

/**
 * Get valid range of each bound.
 */
function validBounds(range, minDate, maxDate) {
  let lowerMax = undefined;
  if (defined(range.upper) && defined(maxDate)) {
    lowerMax = range.upper > maxDate ? maxDate : range.upper;
  } else if (defined(range.upper)) {
    lowerMax = range.upper;
  } else if (defined(maxDate)) {
    lowerMax = maxDate;
  }

  let upperMin = undefined;
  if (defined(range.lower) && defined(minDate)) {
    upperMin = range.lower > minDate ? range.lower : minDate;
  } else if (defined(range.lower)) {
    upperMin = range.lower;
  } else if (defined(minDate)) {
    upperMin = minDate;
  }
  return {
    lowerMin: minDate,
    lowerMax: lowerMax,
    upperMin: upperMin,
    upperMax: maxDate,
  };
}

/**
 * Format date
 */
function format(date) {
  if (date == null) {
    return null;
  }
  return formatDate(date, "MM/dd/yyyy");
}

/**
 * Get i18n text.
 */
function useMessages(range, minDate, maxDate) {
  const intl = useIntl();
  const bounds = validBounds(range, minDate, maxDate);
  const defaultMin = intl.formatMessage({ id: "filter.defaultMinDate" });
  const defaultMax = intl.formatMessage({ id: "filter.defaultMaxDate" });

  return {
    lowerMinDateMessage: intl.formatMessage(
      { id: "filter.minDateError" },
      { min: format(bounds.lowerMin) || defaultMin }
    ),
    lowerMaxDateMessage: intl.formatMessage(
      { id: "filter.maxDateError" },
      { max: format(bounds.lowerMax) || defaultMax }
    ),
    upperMinDateMessage: intl.formatMessage(
      { id: "filter.minDateError" },
      { min: format(bounds.upperMin) || defaultMin }
    ),
    upperMaxDateMessage: intl.formatMessage(
      { id: "filter.maxDateError" },
      { max: format(bounds.upperMax) || defaultMax }
    ),
    invalidDateMessage: intl.formatMessage({ id: "filter.invalidDateError" }),
    from: intl.formatMessage({ id: "filter.from" }),
    to: intl.formatMessage({ id: "filter.to" }),
    lowerAriaLabel: intl.formatMessage({ id: "aria.label.changeLowerDate" }),
    upperAriaLabel: intl.formatMessage({ id: "aria.label.changeUpperDate" }),
  };
}

/**
 * Check if range is valid.
 */
function isValid(range, minDate, maxDate) {
  const { lower, upper } = range;
  const bounds = validBounds(range, minDate, maxDate);
  return (
    (lower == null ||
      (!isNaN(lower) &&
        (bounds.lowerMin == null || lower >= bounds.lowerMin) &&
        (bounds.lowerMax == null || lower <= bounds.lowerMax))) &&
    (upper == null ||
      (!isNaN(upper) &&
        (bounds.upperMin == null || upper >= bounds.upperMin) &&
        (bounds.upperMax == null || upper <= bounds.upperMax)))
  );
}

function DateRangeFilter(props: DateRangeFilterProps) {
  const {
    title,
    range,
    onChange,
    minValid = new Date(1900, 0, 1),
    maxValid = new Date(2100, 0, 1),
    tooltip,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const [values, setValues] = useState(range);
  const lowerId = useUniqueId("date-picker");
  const upperId = useUniqueId("date-picker");
  const messages = useMessages(values, minValid, maxValid);
  const bounds = validBounds(values, minValid, maxValid);

  useEffect(() => setValues(range), [range.lower, range.upper]);

  const handleUpdate = useCallback(
    (updates) => {
      const newValues = { ...values, ...updates };
      setValues(newValues);
      if (isValid(newValues, minValid, maxValid)) {
        onChange(newValues);
      }
    },
    [values, onChange, range, minValid, maxValid]
  );

  const handleLower = useCallback(
    (lower) => handleUpdate({ lower }),
    [handleUpdate]
  );

  const handleUpper = useCallback(
    (upper) => handleUpdate({ upper }),
    [handleUpdate]
  );

  return (
    <FilterContainer
      title={title}
      tooltip={tooltip}
      className={clsx(className)}
      {...other}
    >
      <div className={classes.content}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            disableToolbar
            variant="inline"
            format="MM/dd/yyyy"
            margin="normal"
            id={lowerId}
            label={messages.from}
            value={values.lower}
            onChange={handleLower}
            KeyboardButtonProps={{
              "aria-label": messages.lowerAriaLabel,
            }}
            minDateMessage={messages.lowerMinDateMessage}
            maxDateMessage={messages.lowerMaxDateMessage}
            invalidDateMessage={messages.invalidDateMessage}
            minDate={bounds.lowerMin}
            maxDate={bounds.lowerMax}
            TextFieldComponent={TopLabelTextField}
          />
          <KeyboardDatePicker
            disableToolbar
            variant="inline"
            format="MM/dd/yyyy"
            margin="normal"
            id={upperId}
            label={messages.to}
            value={values.upper}
            onChange={handleUpper}
            KeyboardButtonProps={{
              "aria-label": messages.upperAriaLabel,
            }}
            minDateMessage={messages.upperMinDateMessage}
            maxDateMessage={messages.upperMaxDateMessage}
            invalidDateMessage={messages.invalidDateMessage}
            minDate={bounds.upperMin}
            maxDate={bounds.upperMax}
            TextFieldComponent={TopLabelTextField}
          />
        </MuiPickersUtilsProvider>
      </div>
    </FilterContainer>
  );
}

type DateRangeFilterProps = {
  title: string;
  range: PartialRange<Date>;
  onChange: (range: PartialRange<Date>) => void;
  minValid?: Date;
  maxValid?: Date;
  /**
   * Optional filter tooltip
   */
  tooltip?: string;
  className?: string;
};

export default DateRangeFilter;
