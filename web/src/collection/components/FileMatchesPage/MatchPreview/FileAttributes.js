import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileType from "../../FileBrowserPage/FileType";
import TableBody from "@material-ui/core/TableBody";
import Table from "@material-ui/core/Table";
import { useIntl } from "react-intl";
import attributes from "./attributes";
import { TableRow } from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";

const useStyles = makeStyles((theme) => ({
  attrName: {
    ...theme.mixins.captionText,
    color: theme.palette.secondary.main,
    borderBottom: "none",
    padding: theme.spacing(1),
  },
  attrValue: {
    ...theme.mixins.captionText,
    color: theme.palette.common.black,
    fontWeight: "bold",
    borderBottom: "none",
    padding: theme.spacing(1),
  },
}));

function FileAttributes(props) {
  const { file, className } = props;
  const classes = useStyles();
  const intl = useIntl();

  const attrs = attributes.map((attr) => ({
    title: intl.formatMessage({ id: attr.title }),
    value: attr.value(file, intl),
  }));

  return (
    <Table className={clsx(className)}>
      <TableBody>
        {attrs.map((attr) => (
          <TableRow>
            <TableCell className={classes.attrName}>{attr.title}</TableCell>
            <TableCell className={classes.attrValue}>{attr.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

FileAttributes.propTypes = {
  /**
   * File match
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default FileAttributes;
