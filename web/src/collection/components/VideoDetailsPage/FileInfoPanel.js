import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../FileBrowserPage/FileType";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { useIntl } from "react-intl";
import { fileAttributes } from "./fileAttributes";

const useStyles = makeStyles((theme) => ({
  panel: {
    height: 574,
    overflow: "auto",
  },
  attrName: {
    ...theme.mixins.valueNormal,
    color: theme.palette.action.textInactive,
  },
  attrValue: {
    ...theme.mixins.valueNormal,
  },
}));

function FileInfoPanel(props) {
  const { file, className } = props;
  const classes = useStyles();
  const intl = useIntl();

  const attributes = fileAttributes.map((attr) => ({
    title: intl.formatMessage({ id: attr.title }),
    value: attr.value(file, intl),
  }));

  return (
    <div className={clsx(classes.panel, className)}>
      <Table>
        <TableBody>
          {attributes.map((attr) => (
            <TableRow key={attr.title}>
              <TableCell className={classes.attrName}>{attr.title}</TableCell>
              <TableCell className={classes.attrValue}>{attr.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

FileInfoPanel.propTypes = {
  /**
   * Video file
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default FileInfoPanel;
