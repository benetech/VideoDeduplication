import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import useUniqueId from "../../lib/hooks/useUniqueId";
import { useIntl } from "react-intl";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";

const useStyles = makeStyles<Theme>(() => ({
  input: {
    backgroundColor: "#EBEBEB",
  },
}));

function useMessages() {
  const intl = useIntl();
  return {
    search: intl.formatMessage({
      id: "actions.searchFingerprints",
    }),
  };
}

function SearchTextInput(props: SearchTextInputProps): JSX.Element {
  const { query: queryAttr = "", onSearch, className } = props;
  const classes = useStyles();
  const inputId = useUniqueId("search-input");
  const messages = useMessages();
  const [query, setQuery] = useState(queryAttr);
  const [timeoutHandle, setTimeoutHandle] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleChange = useCallback((event) => setQuery(event.target.value), []);
  const handleClear = useCallback(() => setQuery(""), []);
  const handleSearch = useCallback(() => {
    if (timeoutHandle != null) {
      clearTimeout(timeoutHandle);
    }
    if (query !== queryAttr && onSearch != null) {
      onSearch(query);
    }
  }, [query, onSearch, timeoutHandle]);

  const handleControlKeys = useCallback(
    (event) => {
      if (event.key === "Enter") {
        handleSearch();
      } else if (event.key === "Escape") {
        handleClear();
      }
    },
    [handleSearch]
  );

  useEffect(() => {
    if (timeoutHandle != null) {
      clearTimeout(timeoutHandle);
    }
    const newHandle = setTimeout(handleSearch, 1000);
    setTimeoutHandle(newHandle);
    return () => clearTimeout(newHandle);
  }, [query, onSearch]);

  useEffect(() => {
    if (query !== queryAttr) {
      setQuery(queryAttr);
    }
  }, [queryAttr]);

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
            {!query && <SearchOutlinedIcon />}
            {query && (
              <IconButton
                aria-label="search fingerprints"
                onClick={handleClear}
                edge="end"
              >
                <ClearOutlinedIcon />
              </IconButton>
            )}
          </InputAdornment>
        }
        labelWidth={145}
        onKeyDown={handleControlKeys}
      />
    </FormControl>
  );
}

type SearchTextInputProps = {
  query?: string;
  onSearch?: (query: string) => void;
  className?: string;
};
export default SearchTextInput;
