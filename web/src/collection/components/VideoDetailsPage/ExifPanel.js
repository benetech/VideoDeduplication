import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../prop-types/FileType";
import {
  SelectableTab,
  SelectableTabs,
} from "../../../common/components/SelectableTabs";
import ExifIcon from "../../../common/components/icons/ExifIcon";
import {
  audioEXIFAttributes,
  flashPixEXIFAttributes,
  generalEXIFAttributes,
} from "./ExifAttributes";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    margin: theme.spacing(3),
  },
  icon: {
    marginRight: theme.spacing(4),
    marginBottom: theme.spacing(0.5),
    fontSize: 16,
    fontWeight: 500,
  },
  tabs: {},
  table: {
    height: 500,
    overflow: "auto",
    padding: theme.spacing(3),
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
 * Get attributes set depending on tab
 */
function getAttributes(tab) {
  switch (tab) {
    case 0:
      return generalEXIFAttributes;
    case 1:
      return flashPixEXIFAttributes;
    case 2:
      return audioEXIFAttributes;
    default:
      return [];
  }
}

function ExifPanel(props) {
  const { file, className, ...other } = props;
  const classes = useStyles();
  const [tab, setTab] = useState(0);
  const intl = useIntl();

  // Get attributes
  const attributes = getAttributes(tab).map((attr) => ({
    title: intl.formatMessage({ id: attr.title }),
    value: attr.value(file),
  }));

  return (
    <div className={clsx(className)} {...other}>
      <div className={classes.header}>
        <ExifIcon className={classes.icon} />
        <SelectableTabs
          value={tab}
          onChange={setTab}
          className={classes.tabs}
          size="small"
        >
          <SelectableTab label="General" />
          <SelectableTab label="Flash Pix" />
          <SelectableTab label="Audio" />
        </SelectableTabs>
      </div>
      <div className={classes.table}>
        <Table>
          <TableBody>
            {attributes.map((attr) => (
              <TableRow key={attr.title}>
                <TableCell className={classes.attrName}>{attr.title}</TableCell>
                <TableCell className={classes.attrValue}>
                  {attr.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

ExifPanel.propTypes = {
  /**
   * Vide file
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default ExifPanel;
