import React, { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TableRow from "@material-ui/core/TableRow";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import Collapse from "@material-ui/core/Collapse";
import TableCell from "@material-ui/core/TableCell";
import { useIntl } from "react-intl";
import Marked from "../../../../common/components/Marked";

const useStyles = makeStyles((theme) => ({
  nameRow: {},
  content: {},
  collapseButtonCell: {
    width: theme.spacing(5),
  },
  attrName: {
    ...theme.mixins.textSmall,
    color: theme.palette.secondary.main,
  },
  attrValue: {
    ...theme.mixins.textSmall,
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    collapse: intl.formatMessage({ id: "actions.collapse" }),
    expand: intl.formatMessage({ id: "actions.expand" }),
  };
}

const MetadataSection = React.memo(function MetadataSection(props) {
  const { classes: classesProp, name, data, state, filter } = props;
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const messages = useMessages();
  const actionLabel = open ? messages.collapse : messages.expand;

  const toggleOpen = useCallback(() => setOpen(!open), [open]);

  useEffect(() => {
    if (open !== !!state?.open) {
      setOpen(!!state?.open);
    }
  }, [state]);

  // Filter attributes by search string
  const attributes = useMemo(() => {
    if (filter) {
      return Object.entries(data).filter(
        ([attrName, attrValue]) =>
          attrName.toLowerCase().includes(filter.toLowerCase()) ||
          attrValue.toLowerCase().includes(filter.toLowerCase())
      );
    } else {
      return Object.entries(data);
    }
  }, [data, filter]);

  if (attributes.length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      <TableRow className={clsx(classes.nameRow, classesProp?.nameRow)}>
        <TableCell className={classes.collapseButtonCell}>
          <IconButton
            size="small"
            onClick={toggleOpen}
            aria-label={actionLabel}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" variant="head">
          <Marked mark={filter}>{name}</Marked>
        </TableCell>
      </TableRow>
      <TableRow className={clsx(classes.content, classesProp?.content)}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table>
              <TableBody>
                {attributes.map(([attrName, attrValue]) => (
                  <TableRow key={attrName}>
                    <TableCell
                      className={clsx(classes.attrName, classesProp?.attrName)}
                    >
                      <Marked mark={filter}>{attrName}</Marked>
                    </TableCell>
                    <TableCell
                      className={clsx(
                        classes.attrValue,
                        classesProp?.attrValue
                      )}
                    >
                      <Marked mark={filter}>{attrValue}</Marked>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
});

MetadataSection.propTypes = {
  /**
   * Section name.
   */
  name: PropTypes.string.isRequired,
  /**
   * Object containing metadata attributes.
   */
  data: PropTypes.object.isRequired,
  /**
   * Externally controls section state.
   */
  state: PropTypes.shape({
    open: PropTypes.bool,
  }),
  /**
   * Search-string.
   */
  filter: PropTypes.string,
  /**
   * Custom styles.
   */
  classes: PropTypes.shape({
    nameRow: PropTypes.string,
    content: PropTypes.string,
    collapseButtonCell: PropTypes.string,
    attrName: PropTypes.string,
    attrValue: PropTypes.string,
  }),
};

export default MetadataSection;
