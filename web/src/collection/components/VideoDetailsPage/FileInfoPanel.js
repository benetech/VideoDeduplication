import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../prop-types/FileType";
import { fileAttributes } from "./fileAttributes";
import AttributeTable from "../../../common/components/AttributeTable";

const useStyles = makeStyles({
  panel: {
    height: 574,
    overflow: "auto",
  },
});

function FileInfoPanel(props) {
  const { file, className, ...other } = props;
  const classes = useStyles();

  return (
    <div className={clsx(classes.panel, className)} {...other}>
      <AttributeTable value={file} attributes={fileAttributes} />
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
