import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileType from "../../../prop-types/FileType";
import TableBody from "@material-ui/core/TableBody";
import Table from "@material-ui/core/Table";
import { useIntl } from "react-intl";
import { AttrType } from "./attributes";
import { TableRow } from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  attrTable: {
    margin: theme.spacing(1),
  },
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
  indicator: {
    height: 58,
    margin: theme.spacing(1),
  },
}));

function PreviewFileAttributes(props) {
  const { file, attrs, className } = props;
  const classes = useStyles();
  const intl = useIntl();

  const attributes = attrs.map((attr) => ({
    title: intl.formatMessage({ id: attr.title }),
    value: attr.value(file, intl),
  }));

  return (
    <Table className={clsx(classes.attrTable, className)}>
      <TableBody>
        {attributes.map((attr) => (
          <TableRow key={attr.title}>
            <TableCell className={classes.attrName}>{attr.title}</TableCell>
            <TableCell className={classes.attrValue}>{attr.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

PreviewFileAttributes.propTypes = {
  /**
   * File match.
   */
  file: FileType.isRequired,
  /**
   * Attributes to be displayed.
   */
  attrs: PropTypes.arrayOf(AttrType).isRequired,
  className: PropTypes.string,
};

export default PreviewFileAttributes;
