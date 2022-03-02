import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useIntl } from "react-intl";
import { FileSort } from "../../../model/VideoFile";

const useStyles = makeStyles<Theme>(() => ({
  select: {
    width: 120,
  },
}));

function useMessages() {
  const intl = useIntl();
  return {
    duration: intl.formatMessage({ id: "sort.duration" }),
    date: intl.formatMessage({ id: "sort.date" }),
    none: intl.formatMessage({ id: "sort.none" }),
    related: intl.formatMessage({ id: "sort.related" }),
    duplicates: intl.formatMessage({ id: "sort.duplicates" }),
    relevance: intl.formatMessage({ id: "sort.relevance" }),
  };
}

function SortSelector(props: SortSelectorProps): JSX.Element {
  const { value = "", onChange, className } = props;
  const messages = useMessages();
  const classes = useStyles();
  const handleChange = useCallback(
    (event) => {
      if (onChange != null) {
        onChange(event.target.value);
      }
    },
    [onChange]
  );
  return (
    <FormControl
      variant="outlined"
      className={clsx(classes.select, className)}
      size="small"
      color="secondary"
    >
      <InputLabel>Sort</InputLabel>
      <Select value={value} onChange={handleChange} label="Sort">
        <MenuItem value={FileSort.relevance}>{messages.relevance}</MenuItem>
        <MenuItem value={FileSort.date}>{messages.date}</MenuItem>
        <MenuItem value={FileSort.length}>{messages.duration}</MenuItem>
        <MenuItem value={FileSort.related}>{messages.related}</MenuItem>
        <MenuItem value={FileSort.duplicates}>{messages.duplicates}</MenuItem>
      </Select>
    </FormControl>
  );
}

type SortSelectorProps = {
  value?: FileSort | "";
  onChange?: (value: FileSort | "") => void;
  className?: string;
};
export default SortSelector;
