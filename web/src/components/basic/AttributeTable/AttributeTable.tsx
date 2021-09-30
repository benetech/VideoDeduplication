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
}));

function AttributeTable<TData>(props: AttributeTableProps<TData>): JSX.Element {
  const { value, attributes: attributesProp, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();
  const attributes = attributesProp.map((attr) => ({
    title: intl.formatMessage({
      id: attr.title,
    }),
    value: attr.value(value, intl),
  }));
  return (
    <Table className={clsx(className)} {...other}>
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

type AttributeTableProps<TData> = {
  /**
   * Any object which attributes will be displayed.
   */
  value: TData;

  /**
   * Attributes that will be displayed.
   */
  attributes: AttributeRenderer<TData>[];
  className?: string;
};
export default AttributeTable;
