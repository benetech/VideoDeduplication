import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme, Tooltip } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import MetadataSection from "./MetadataSection";
import UnfoldMoreIcon from "@material-ui/icons/UnfoldMore";
import UnfoldLessIcon from "@material-ui/icons/UnfoldLess";
import SearchIcon from "@material-ui/icons/Search";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import TextField from "@material-ui/core/TextField";
import SquaredIconButton from "../../../components/basic/SquaredIconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import { useIntl } from "react-intl";
import useStaging from "../../../lib/hooks/useStaging";
import TableBody from "@material-ui/core/TableBody";
import { TextAttributes } from "../../../lib/types/TextAttributes";

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    overflow: "auto",
    padding: theme.spacing(3),
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(6),
  },
  actionIcon: {
    color: theme.palette.secondary.light,
  },
  searchField: {
    flexGrow: 2,
    marginRight: theme.spacing(2),
  },
  content: {
    maxHeight: 450,
    overflow: "auto",
    margin: theme.spacing(-3),
  },
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    expand: intl.formatMessage({
      id: "actions.expandAll",
    }),
    collapse: intl.formatMessage({
      id: "actions.collapseAll",
    }),
    search: intl.formatMessage({
      id: "actions.search",
    }),
  };
}

function MetadataPane(props: MetadataPaneProps): JSX.Element {
  const { data, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [sectionState, setSectionState] = useState({
    open: false,
  });
  const {
    value: search,
    staging: searchStaging,
    setStaging: setSearch,
  } = useStaging("");
  const expandAll = useCallback(
    () =>
      setSectionState({
        open: true,
      }),
    []
  );
  const collapseAll = useCallback(
    () =>
      setSectionState({
        open: false,
      }),
    []
  );
  const handleSearchChange = useCallback(
    (event) => setSearch(event.target.value),
    [setSearch]
  );
  useEffect(() => {
    if (search) {
      setSectionState({
        open: true,
      });
    }
  }, [!!search]);
  return (
    <div className={clsx(classes.container, className)} {...other}>
      <div className={classes.header}>
        <TextField
          color="secondary"
          variant="outlined"
          size="small"
          label={messages.search}
          className={classes.searchField}
          value={searchStaging}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <ButtonGroup>
          <Tooltip title={messages.expand}>
            <SquaredIconButton
              variant="outlined"
              onClick={expandAll}
              aria-label={messages.collapse}
            >
              <UnfoldMoreIcon className={classes.actionIcon} />
            </SquaredIconButton>
          </Tooltip>
          <Tooltip title={messages.collapse}>
            <SquaredIconButton
              variant="outlined"
              onClick={collapseAll}
              aria-label={messages.collapse}
            >
              <UnfoldLessIcon className={classes.actionIcon} />
            </SquaredIconButton>
          </Tooltip>
        </ButtonGroup>
      </div>
      <div className={classes.content}>
        <Table>
          <TableBody>
            {Object.entries(data || {}).map(([sectionName, sectionData]) => (
              <MetadataSection
                key={sectionName}
                name={sectionName}
                data={sectionData}
                state={sectionState}
                filter={search}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

type MetadataPaneProps = Omit<React.HTMLProps<HTMLDivElement>, "data"> & {
  /**
   * Object containing metadata sections.
   */
  data: { [category: string]: TextAttributes };
};
export default MetadataPane;
