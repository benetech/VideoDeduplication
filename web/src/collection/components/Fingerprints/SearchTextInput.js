import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import useUniqueId from "../../../common/hooks/useUniqueId";
import { useIntl } from "react-intl";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";

const useStyles = makeStyles(() => ({
  input: {
    backgroundColor: "#EBEBEB",
  },
}));

function useMessages() {
  const intl = useIntl();
  return {
    search: intl.formatMessage({ id: "actions.searchFingerprints" }),
  };
}

function SearchTextInput(props) {
  const { onSearch, className } = props;
  const classes = useStyles();
  const inputId = useUniqueId("search-input");
  const messages = useMessages();
  const [query, setQuery] = useState("");

  const handleChange = useCallback((event) => setQuery(event.target.value), []);
  const handleSearch = useCallback(() => onSearch(query), [query, onSearch]);

  return (
    <FormControl
      className={clsx(classes.input, className)}
      variant="outlined"
      size="small"
      color="secondary"
    >
      <InputLabel htmlFor={inputId}>{messages.search}</InputLabel>
      <OutlinedInput
        id={inputId}
        type="text"
        value={query}
        onChange={handleChange}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="search fingerprints"
              onClick={handleSearch}
              onMouseDown={handleSearch}
              edge="end"
            >
              <SearchOutlinedIcon />
            </IconButton>
          </InputAdornment>
        }
        labelWidth={145}
      />
    </FormControl>
  );
}

SearchTextInput.propTypes = {
  onSearch: PropTypes.func,
  className: PropTypes.string,
};

export default SearchTextInput;
