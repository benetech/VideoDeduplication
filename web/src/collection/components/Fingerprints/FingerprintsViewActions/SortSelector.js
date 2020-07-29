import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useIntl } from "react-intl";
import { Sort } from "./sort";

const useStyles = makeStyles((theme) => ({
  select: {
    width: 120,
  },
}));

function useMessages() {
  const intl = useIntl();
  return {
    duration: intl.formatMessage({ id: "sort.duration" }),
    size: intl.formatMessage({ id: "sort.size" }),
    date: intl.formatMessage({ id: "sort.date" }),
    none: intl.formatMessage({ id: "sort.none" }),
  };
}

function SortSelector(props) {
  const { value = "", onChange, className } = props;
  const messages = useMessages();
  const classes = useStyles();

  const handleChange = useCallback((event) => onChange(event.target.value), [
    onChange,
  ]);

  return (
    <FormControl
      variant="outlined"
      className={clsx(classes.select, className)}
      size="small"
      color="secondary"
    >
      <InputLabel>Sort</InputLabel>
      <Select value={value} onChange={handleChange} label="Sort">
        <MenuItem value="">
          <em>{messages.none}</em>
        </MenuItem>
        <MenuItem value={Sort.duration}>{messages.duration}</MenuItem>
        <MenuItem value={Sort.date}>{messages.date}</MenuItem>
        <MenuItem value={Sort.size}>{messages.size}</MenuItem>
      </Select>
    </FormControl>
  );
}

SortSelector.propTypes = {
  value: PropTypes.oneOf(["", Sort.duration, Sort.date, Sort.size]),
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default SortSelector;
