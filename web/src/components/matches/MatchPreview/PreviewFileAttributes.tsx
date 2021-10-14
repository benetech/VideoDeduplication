import React from "react";
import { makeStyles } from "@material-ui/styles";
import { TableRow, Theme } from "@material-ui/core";
import { VideoFile } from "../../../model/VideoFile";
import TableBody from "@material-ui/core/TableBody";
import Table from "@material-ui/core/Table";
import { useIntl } from "react-intl";
import TableCell from "@material-ui/core/TableCell";
import clsx from "clsx";
import { AttributeRenderer } from "../../../lib/types/AttributeRenderer";

const useStyles = makeStyles<Theme>((theme) => ({
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

function PreviewFileAttributes(props: PreviewFileAttributesProps): JSX.Element {
  const { file, attrs, className } = props;
  const classes = useStyles();
  const intl = useIntl();
  const attributes = attrs.map((attr) => ({
    title: intl.formatMessage({
      id: attr.title,
    }),
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

type PreviewFileAttributesProps = {
  /**
   * File match.
   */
  file: VideoFile;

  /**
   * Attributes to be displayed.
   */
  attrs: AttributeRenderer<VideoFile>[];
  className?: string;
};
export default PreviewFileAttributes;
