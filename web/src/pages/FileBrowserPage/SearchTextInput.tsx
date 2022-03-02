import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { MenuItem, Select, Theme } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import useUniqueId from "../../lib/hooks/useUniqueId";
import { useIntl } from "react-intl";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import useHealth from "../../application/api/useHealth";

const useStyles = makeStyles<Theme>(() => ({
  container: {
    backgroundColor: "#EBEBEB",
    display: "flex",
    alignItems: "center",
  },
  textControl: {
    flexGrow: 2,
  },
  textInput: {
    borderRadius: "4px 0px 0px 4px",
    borderRight: "none",
  },
  selectInput: {
    borderLeftWidth: 0,
    borderRadius: "0px 4px 4px 0px",
    minWidth: 200,
  },
  selectOutlined: {
    "& $notchedOutline": {
      borderWidth: "5px",
    },
  },
}));

function useMessages() {
  const intl = useIntl();
  return {
    search: intl.formatMessage({ id: "actions.searchFingerprints" }),
    fileName: intl.formatMessage({ id: "filter.fileName" }),
    semantic: intl.formatMessage({ id: "filter.semanticSearch" }),
    nameQuery: intl.formatMessage({ id: "filter.fileNameQuery" }),
    semanticQuery: intl.formatMessage({ id: "filter.semanticQuery" }),
    queryType: intl.formatMessage({ id: "filter.queryType" }),
  };
}

type UseQuery = {
  staging: string;
  setStaging: Dispatch<SetStateAction<string>>;
  onChange: (query: string) => void;
  handleChange: (event: any) => void;
  forceSearch: () => void;
  clear: () => void;
};

function useQuery(value: string, onSearch: (query: string) => void): UseQuery {
  const [staging, setStaging] = useState<string>(value);
  const [timeoutHandle, setTimeoutHandle] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    setStaging(value);
    if (timeoutHandle != null) {
      clearTimeout(timeoutHandle);
      setTimeoutHandle(null);
    }
  }, [value]);

  const onChange = useCallback(
    (newStaging) => {
      setStaging(newStaging);
      if (timeoutHandle != null) {
        clearTimeout(timeoutHandle);
      }
      const newTimeoutHandle = setTimeout(() => onSearch(newStaging), 1000);
      setTimeoutHandle(newTimeoutHandle);
    },
    [timeoutHandle, onSearch]
  );

  const handleChange = useCallback(
    (event) => onChange(event.target.value),
    [onChange]
  );

  const forceSearch = useCallback(() => {
    if (timeoutHandle != null) {
      clearTimeout(timeoutHandle);
      setTimeoutHandle(null);
    }
    onSearch(staging);
  }, [staging, onSearch, timeoutHandle]);

  const clear = useCallback(() => onChange(""), [onChange]);

  return { staging, setStaging, handleChange, onChange, forceSearch, clear };
}

enum QueryType {
  Semantic,
  FileName,
}

type SearchTextInputProps = {
  nameQuery: string;
  onNameSearch: (query: string) => void;
  semanticQuery: string;
  onSemanticSearch: (query: string) => void;
  className?: string;
};

export default function SearchTextInput(
  props: SearchTextInputProps
): JSX.Element {
  const {
    nameQuery,
    onNameSearch,
    semanticQuery,
    onSemanticSearch,
    className,
  } = props;
  const classes = useStyles();
  const health = useHealth();
  const inputId = useUniqueId("search-input");
  const selectId = useUniqueId("type-select");
  const messages = useMessages();
  const [queryType, setQueryType] = useState<QueryType>(QueryType.FileName);

  const nameSearch = useQuery(nameQuery, onNameSearch);
  const semanticSearch = useQuery(semanticQuery, onSemanticSearch);
  const search = queryType == QueryType.FileName ? nameSearch : semanticSearch;

  const handleQueryType = useCallback((event) => {
    setQueryType(event.target.value);
  }, []);

  const handleControlKeys = useCallback(
    (event) => {
      if (event.key === "Enter") {
        search.forceSearch();
      } else if (event.key === "Escape") {
        search.clear();
      }
    },
    [search]
  );

  const label =
    queryType == QueryType.FileName
      ? messages.nameQuery
      : messages.semanticQuery;

  const labelWidth = queryType == QueryType.FileName ? 119 : 115;

  return (
    <div className={clsx(classes.container, className)}>
      <FormControl
        variant="outlined"
        size="small"
        color="secondary"
        className={classes.textControl}
      >
        <InputLabel htmlFor={inputId}>{label}</InputLabel>
        <OutlinedInput
          id={inputId}
          type="text"
          value={search.staging}
          onChange={search.handleChange}
          endAdornment={
            <InputAdornment position="end">
              {search.staging && (
                <IconButton
                  aria-label="search fingerprints"
                  onClick={search.clear}
                  edge="end"
                >
                  <ClearOutlinedIcon />
                </IconButton>
              )}
            </InputAdornment>
          }
          labelWidth={labelWidth}
          onKeyDown={handleControlKeys}
          className={classes.textInput}
        />
      </FormControl>
      <FormControl size="small" color="secondary" variant="outlined">
        <InputLabel htmlFor={selectId}>{messages.queryType}</InputLabel>
        <Select
          id={selectId}
          value={queryType}
          onChange={handleQueryType}
          className={classes.selectInput}
          labelWidth={85}
          classes={{ root: classes.selectOutlined }}
        >
          <MenuItem value={QueryType.FileName}>{messages.fileName}</MenuItem>
          <MenuItem
            value={QueryType.Semantic}
            disabled={!health?.semanticSearch.available}
          >
            {messages.semantic}
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}
