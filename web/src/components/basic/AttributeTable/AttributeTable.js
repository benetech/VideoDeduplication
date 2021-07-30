import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AttributeDescriptorType from "./AttributeDescriptorType";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Table from "@material-ui/core/Table";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
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

function AttributeTable(props) {
  const { value, attributes: attributesProp, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();

  const attributes = attributesProp.map((attr) => ({
    title: intl.formatMessage({ id: attr.title }),
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

AttributeTable.propTypes = {
  /**
   * Any object which attributes will be displayed.
   */
  value: PropTypes.object.isRequired,
  /**
   * Attributes that will be displayed.
   */
  attributes: PropTypes.arrayOf(AttributeDescriptorType.isRequired).isRequired,
  className: PropTypes.string,
};

export default AttributeTable;
