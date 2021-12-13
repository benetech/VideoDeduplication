import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Table from "@material-ui/core/Table";
import { useIntl } from "react-intl";
import { AttributeRenderer } from "../../../lib/types/AttributeRenderer";

const useStyles = makeStyles<Theme>((theme) => ({
  attrName: {
    ...theme.mixins.valueNormal,
    color: theme.palette.action.textInactive,
  },
  attrValue: {
    ...theme.mixins.valueNormal,
    ...theme.mixins.textEllipsis,
    maxWidth: 300,
  },
  attrNameSmall: {
    ...theme.mixins.captionText,
    color: theme.palette.secondary.main,
    borderBottom: "none",
    padding: theme.spacing(1),
  },
  attrValueSmall: {
    ...theme.mixins.captionText,
    color: theme.palette.common.black,
    fontWeight: "bold",
    borderBottom: "none",
    padding: theme.spacing(1),
  },
}));

function AttributeTable<TData>(props: AttributeTableProps<TData>): JSX.Element {
  const {
    value,
    size = "large",
    attributes: attributesProp,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const intl = useIntl();

  const attributes = attributesProp.map((attr) => ({
    title: intl.formatMessage({
      id: attr.title,
    }),
    value: attr.value(value, intl),
  }));

  const nameClass = size === "small" ? classes.attrNameSmall : classes.attrName;
  const valueClass =
    size === "small" ? classes.attrValueSmall : classes.attrValue;

  return (
    <Table className={clsx(className)} {...other}>
      <TableBody>
        {attributes.map((attr) => (
          <TableRow key={attr.title}>
            <TableCell className={nameClass}>{attr.title}</TableCell>
            <TableCell className={valueClass}>{attr.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

type AttributeTableProps<TData> = {
  /**
   * Any object which attributes will be displayed.
   */
  value: TData;

  /**
   * Attributes that will be displayed.
   */
  attributes: AttributeRenderer<TData>[];
  size?: "large" | "small";
  className?: string;
};
export default AttributeTable;
