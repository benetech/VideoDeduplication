import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import FilterContainer from "./FilterContainer";
import { useIntl } from "react-intl";
import TopLabelTextField from "../../../components/basic/TopLabelTextField";
import { PartialRange, Range } from "../../../lib/helpers/Range";

const useStyles = makeStyles<Theme>((theme) => ({
  fields: {
    display: "flex",
  },
  lowerBound: {},
  upperBound: {
    marginLeft: theme.spacing(4),
  },
}));

/**
 * Get i18n text.
 */
function useMessages(title: string) {
  const intl = useIntl();
  return {
    from: intl.formatMessage({
      id: "filter.from",
    }),
    to: intl.formatMessage({
      id: "filter.to",
    }),
    fromAriaLabel: intl.formatMessage(
      {
        id: "filter.min.label",
      },
      {
        title,
      }
    ),
    toAriaLabel: intl.formatMessage(
      {
        id: "filter.max.label",
      },
      {
        title,
      }
    ),
  };
}

/**
 * Check if the current values are valid.
 */
function isValid(
  range: PartialRange,
  minValue?: number,
  maxValue?: number
): Range<boolean> {
  const { lower, upper } = range;
  return {
    lower:
      lower == null ||
      (!Number.isNaN(lower) &&
        (minValue == null || lower >= minValue) &&
        (maxValue == null || lower <= maxValue) &&
        (upper == null || Number.isNaN(upper) || lower <= upper)),
    upper:
      upper == null ||
      (!Number.isNaN(upper) &&
        (maxValue == null || upper <= maxValue) &&
        (minValue == null || upper >= minValue) &&
        (lower == null || Number.isNaN(lower) || upper >= lower)),
  };
}

/**
 * Get display values from range numeric values.
 */
function toDisplayValues(
  range: PartialRange = { lower: null, upper: null }
): Range<string> {
  return {
    lower: range.lower != null ? String(range.lower) : "",
    upper: range.upper != null ? String(range.upper) : "",
  };
}
/**
 * Get numeric range from displayed values.
 */

function toRange(displayValues: Range<string>): PartialRange {
  return {
    lower: displayValues.lower !== "" ? Number(displayValues.lower) : null,
    upper: displayValues.upper !== "" ? Number(displayValues.upper) : null,
  };
}

function RangeFilter(props: RangeFilterProps): JSX.Element {
  const {
    title,
    range,
    onChange,
    maxValue,
    minValue,
    tooltip,
    className,
    ...other
  } = props;
  const messages = useMessages(title);
  const classes = useStyles();
  const [values, setValues] = useState(toDisplayValues(range));
  const [valid, setValid] = useState({
    lower: true,
    upper: true,
  });
  useEffect(() => {
    const newValues = toDisplayValues(range);
    setValues(newValues);
    setValid(isValid(range, minValue, maxValue));
  }, [range.lower, range.upper, maxValue, minValue]);
  const handleUpdate = useCallback(
    (updates) => {
      const newValues = { ...values, ...updates };
      const newRange = toRange(newValues);
      const valid = isValid(newRange, minValue, maxValue);
      setValues(newValues);
      setValid(valid);

      if (valid.lower && valid.upper && onChange != null) {
        onChange(newRange);
      }
    },
    [values, onChange, range, minValue, maxValue]
  );
  const handleLowerChange = useCallback(
    (event) =>
      handleUpdate({
        lower: event.target.value,
      }),
    [handleUpdate]
  );
  const handleUpperChange = useCallback(
    (event) =>
      handleUpdate({
        upper: event.target.value,
      }),
    [handleUpdate]
  );
  return (
    <FilterContainer
      title={title}
      tooltip={tooltip}
      className={clsx(className)}
      {...other}
    >
      <div className={classes.fields}>
        <TopLabelTextField
          error={!valid.lower}
          color="secondary"
          label={messages.from}
          aria-label={messages.fromAriaLabel}
          className={classes.lowerBound}
          value={values.lower}
          onChange={handleLowerChange}
        />
        <TopLabelTextField
          error={!valid.upper}
          color="secondary"
          label={messages.to}
          aria-label={messages.toAriaLabel}
          className={classes.upperBound}
          value={values.upper}
          onChange={handleUpperChange}
        />
      </div>
    </FilterContainer>
  );
}

type RangeFilterProps = {
  /**
   * Filter title to be displayed
   */
  title: string;

  /**
   * Current range value.
   */
  range: PartialRange;

  /**
   * Handle range change.
   */
  onChange?: (range: PartialRange) => void;

  /**
   * Minimal valid value if any.
   */
  minValue?: number;

  /**
   * Maximal valid value if any.
   */
  maxValue?: number;

  /**
   * Optional filter tooltip
   */
  tooltip?: string;
  className?: string;
};
export default RangeFilter;
